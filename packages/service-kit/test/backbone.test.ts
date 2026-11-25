import { SHARED_PROBLEM_CODES } from '@uhs/contracts';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { baseConfigSchema, ConfigurationError, loadConfig, splitOrigins } from '../src/config.js';
import { createServiceApp } from '../src/http/app.js';
import { problemError, toProblemDetails } from '../src/http/errors.js';
import { requestId, validate } from '../src/http/middleware.js';
import { silentLogger } from '../src/testing.js';

describe('configuration', () => {
  it('applies defaults and coerces numbers', () => {
    const parsed = baseConfigSchema.parse({ SERVICE_NAME: 'core', PORT: '4002' });
    expect(parsed.PORT).toBe(4002);
    expect(parsed.NODE_ENV).toBe('development');
    expect(parsed.AUTH_AUDIENCE).toBe('uhs-api');
  });

  it('reports a readable error for a missing required value', () => {
    expect(() => loadConfig(baseConfigSchema, {})).toThrow(ConfigurationError);
  });

  it('splits a CORS allowlist and drops blanks', () => {
    expect(splitOrigins(' http://a.test , ,http://b.test ')).toEqual([
      'http://a.test',
      'http://b.test',
    ]);
    expect(splitOrigins('')).toEqual([]);
  });

  it('validates a service-specific extension of the base schema', () => {
    const schema = baseConfigSchema.extend({ DATABASE_URL: z.string().min(1) });
    expect(() => loadConfig(schema, { SERVICE_NAME: 'core' })).toThrow(ConfigurationError);
    expect(loadConfig(schema, { SERVICE_NAME: 'core', DATABASE_URL: 'postgres://x' }).DATABASE_URL).toBe(
      'postgres://x',
    );
  });
});

describe('problem details', () => {
  it('maps a known problem error', () => {
    const problem = toProblemDetails(
      problemError(403, SHARED_PROBLEM_CODES.forbidden, 'nope'),
      'corr-1',
    );
    expect(problem).toMatchObject({
      status: 403,
      code: 'AUTH-004',
      title: 'Forbidden',
      correlation_id: 'corr-1',
    });
  });

  it('maps a validation failure without leaking internals', () => {
    const problem = toProblemDetails({ secret: 'database error' });
    expect(problem).toMatchObject({ status: 500, code: 'HTTP-500' });
    expect(JSON.stringify(problem)).not.toContain('database error');
  });

  it('maps zod issues to field errors', () => {
    const result = z.object({ name: z.string() }).safeParse({});
    const problem = toProblemDetails(result.error);
    expect(problem.status).toBe(422);
    expect(problem.errors?.[0]?.path).toBe('name');
  });
});

describe('http app', () => {
  const build = () =>
    createServiceApp({
      service: 'test',
      logger: silentLogger(),
      readiness: [
        { name: 'database', check: () => undefined },
        { name: 'broker', check: () => undefined },
      ],
      routes: (router) => {
        router.get('/v1/ping', (_req, res) => {
          res.json({ ok: true });
        });
        router.post('/v1/thing', validate(z.object({ name: z.string().min(1) })), (_req, res) => {
          res.status(201).json({ ok: true });
        });
      },
    });

  it('answers liveness', async () => {
    const { app } = build();
    const response = await request(app).get('/health/live');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'live', service: 'test' });
  });

  it('answers readiness and echoes a request id', async () => {
    const { app } = build();
    const response = await request(app).get('/health/ready').set('x-request-id', 'req-12345678');
    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBe('req-12345678');
    expect(response.body.checks).toHaveLength(2);
  });

  it('returns 503 when a dependency is down', async () => {
    const { app } = createServiceApp({
      service: 'test',
      logger: silentLogger(),
      readiness: [
        {
          name: 'broker',
          check: () => {
            throw new Error('no route to host');
          },
        },
      ],
    });
    const response = await request(app).get('/health/ready');
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('HEALTH-001');
  });

  it('returns problem details for an unknown route', async () => {
    const { app } = build();
    const response = await request(app).get('/nope');
    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toContain('application/problem+json');
  });

  it('rejects an invalid body with field errors', async () => {
    const { app } = build();
    const response = await request(app).post('/v1/thing').send({ name: '' });
    expect(response.status).toBe(422);
    expect(response.body.errors).toHaveLength(1);
  });

  it('generates a request id when none is supplied', async () => {
    const { app } = createServiceApp({
      service: 'test',
      logger: silentLogger(),
      routes: (router) => {
        router.get('/v1/id', (_req, res) => {
          res.json({ id: res.locals.requestId });
        });
      },
    });
    const response = await request(app).get('/v1/id');
    expect(typeof response.body.id).toBe('string');
    expect(response.body.id.length).toBeGreaterThan(7);
  });

  it('exposes the request-id middleware on its own', async () => {
    const { app } = createServiceApp({
      service: 'test',
      logger: silentLogger(),
      routes: (router) => {
        router.get('/v1/own', requestId(), (_req, res) => {
          res.json({ id: res.locals.requestId });
        });
      },
    });
    const response = await request(app).get('/v1/own');
    expect(response.status).toBe(200);
  });
});
