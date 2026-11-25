import { silentLogger, type Database } from '@uhs/service-kit';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

const database = { ping: async () => undefined } as unknown as Database;

const build = () =>
  buildApp({
    logger: silentLogger('auth'),
    database,
    busReady: () => true,
    corsOrigins: ['http://localhost:3000'],
    auth: {
      jwksUrl: 'http://localhost:4001/api/auth/jwks',
      issuer: 'http://localhost:4001',
      algorithm: 'EdDSA',
    },
    // The real handler is Better Auth's toNodeHandler(auth); the shell test only
    // proves it is mounted before the body parser.
    authHandler: (_req, res) => {
      res.status(200).json({ mounted: true });
    },
  });

describe('auth service shell', () => {
  it('answers liveness', async () => {
    const { app } = build();
    const response = await request(app).get('/health/live');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'live', service: 'auth' });
  });

  it('reports readiness from its dependencies', async () => {
    const { app } = build();
    const response = await request(app).get('/health/ready');
    expect(response.status).toBe(200);
    expect(response.body.checks.map((check: { name: string }) => check.name)).toEqual([
      'database',
      'broker',
    ]);
  });

  it('mounts the auth handler under /api/auth', async () => {
    const { app } = build();
    const response = await request(app).post('/api/auth/sign-in/email').send({});
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ mounted: true });
  });

  it('rejects an unauthenticated role catalogue request', async () => {
    const { app } = build();
    const response = await request(app).get('/internal/roles');
    expect(response.status).toBe(401);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.body.code).toBe('AUTH-001');
  });
});
