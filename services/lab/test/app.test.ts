import { silentLogger, type Database } from '@uhs/service-kit';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

const database = { ping: async () => undefined } as unknown as Database;

const build = () =>
  buildApp({
    logger: silentLogger('lab'),
    database,
    busReady: () => true,
    corsOrigins: ['http://localhost:3000'],
    auth: {
      jwksUrl: 'http://localhost:4001/api/auth/jwks',
      issuer: 'http://localhost:4001',
      algorithm: 'EdDSA',
    },
  });

describe('lab service shell', () => {
  it('answers liveness', async () => {
    const { app } = build();
    const response = await request(app).get('/health/live');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'live', service: 'lab' });
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

  it('rejects an unauthenticated call with problem details', async () => {
    const { app } = build();
    const response = await request(app).get('/v1/lab/ping');
    expect(response.status).toBe(401);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.body.code).toBe('AUTH-001');
  });
});
