import { silentLogger } from '@uhs/service-kit';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { canSubscribe } from '../src/channels.js';

const build = (redisReady = true) =>
  buildApp({ logger: silentLogger('notifications'), redisReady: () => redisReady, corsOrigins: [] });

describe('notifications gateway shell', () => {
  it('answers liveness', async () => {
    const { app } = build();
    const response = await request(app).get('/health/live');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'live', service: 'notifications' });
  });

  it('returns 503 when redis is down', async () => {
    const { app } = build(false);
    const response = await request(app).get('/health/ready');
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('HEALTH-001');
  });
});

describe('subscription authorization', () => {
  const staff = {
    requestId: 'r',
    correlationId: 'r',
    userId: 'usr_1',
    tenantId: 'tenant-a',
    permissions: ['lab:read'] as never,
    facilityIds: [],
    isServiceToken: false,
  };

  it('allows a tenant room the caller can read', () => {
    expect(canSubscribe(staff, { channel: 'tenant:tenant-a:lab-results' })).toBe(true);
  });

  it('denies another tenant and an unknown room', () => {
    expect(canSubscribe(staff, { channel: 'tenant:tenant-b:lab-results' })).toBe(false);
    expect(canSubscribe(staff, { channel: 'tenant:tenant-a:unknown' })).toBe(false);
  });

  it('denies a patient channel that is not the caller patient', () => {
    expect(canSubscribe(staff, { channel: 'patient:p1:updates', patientId: 'p2' })).toBe(false);
    expect(canSubscribe(staff, { channel: 'patient:p1:updates', patientId: 'p1' })).toBe(true);
  });
});
