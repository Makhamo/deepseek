import { describe, expect, it } from 'vitest';
import {
  ALL_PERMISSIONS,
  ClaimStatus,
  Envelope,
  EVENT_CATALOGUE,
  IntegrationOutcome,
  PermissionSchema,
  ProblemDetails,
  isCataloguedEvent,
  routingKeyFor,
} from '../src/index.js';

/** The envelope example published in the specification (section 9.1). */
const SPEC_ENVELOPE = {
  event_id: '0190f7b4-2c1a-7e3d-9a10-4f6b8c2d1e05',
  event_type: 'lab.result.verified',
  event_version: 1,
  occurred_at: '2026-11-17T09:42:10+02:00',
  published_at: '2026-11-17T09:42:11+02:00',
  source_service: 'lab',
  source_record_id: '0190f7b3-1111-7000-8000-000000000001',
  source_tenant_id: '0190f7a0-2222-7000-8000-000000000002',
  target_tenant_id: '0190f7a0-3333-7000-8000-000000000003',
  relationship_id: '0190f7a0-4444-7000-8000-000000000004',
  source_application: 'nicu',
  correlation_id: '0190f7a2-5555-7000-8000-000000000005',
  causation_id: '0190f7a1-6666-7000-8000-000000000006',
  subject: {
    patient_id: '0190f001-7777-7000-8000-000000000007',
    nicu_admission_id: '0190f002-8888-7000-8000-000000000008',
    order_id: '0190f7a1-9999-7000-8000-000000000009',
  },
  actor: { type: 'user', id: 'usr_0190f7' },
  classification: 'clinical',
  payload: {
    result_id: '0190f7b3-aaaa-7000-8000-00000000000a',
    result_version: 1,
    test_code: 'NEO-BILI',
    result_value: '12.4',
    result_unit: 'mg/dL',
    result_status: 'final',
    critical_flag: false,
    verifier_id: 'usr_0190f7',
    verified_at: '2026-11-17T09:42:10+02:00',
  },
};

describe('event envelope', () => {
  it('accepts the example payload from the specification', () => {
    const parsed = Envelope.parse(SPEC_ENVELOPE);
    expect(parsed.event_type).toBe('lab.result.verified');
    expect(parsed.classification).toBe('clinical');
  });

  it('rejects an envelope with no subject identifier', () => {
    const result = Envelope.safeParse({ ...SPEC_ENVELOPE, subject: {} });
    expect(result.success).toBe(false);
  });

  it('rejects an event type that is not <service>.<aggregate>.<verb>', () => {
    const result = Envelope.safeParse({ ...SPEC_ENVELOPE, event_type: 'result.verified' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing tenant id', () => {
    const { source_tenant_id: _omitted, ...withoutTenant } = SPEC_ENVELOPE;
    expect(Envelope.safeParse(withoutTenant).success).toBe(false);
  });
});

describe('routing keys', () => {
  it('appends the source application for lab and clm events', () => {
    expect(routingKeyFor('lab.result.verified', 'nicu')).toBe('lab.result.verified.nicu');
    expect(routingKeyFor('clm.claim.status_changed', 'ph')).toBe('clm.claim.status_changed.ph');
  });

  it('leaves other services unmodified', () => {
    expect(routingKeyFor('pm.encounter.opened', 'pm')).toBe('pm.encounter.opened');
    expect(routingKeyFor('tri.assessment.completed')).toBe('tri.assessment.completed');
  });

  it('does not append a suffix when no application is supplied', () => {
    expect(routingKeyFor('lab.result.verified', null)).toBe('lab.result.verified');
  });
});

describe('event catalogue', () => {
  it('contains the spec event types with a producer and aggregate key', () => {
    for (const entry of EVENT_CATALOGUE) {
      expect(entry.producer.length).toBeGreaterThan(0);
      expect(entry.aggregateKey.length).toBeGreaterThan(0);
    }
    expect(isCataloguedEvent('clm.claim.status_changed')).toBe(true);
    expect(isCataloguedEvent('clm.claim.not_a_verb')).toBe(false);
  });

  it('has unique event types', () => {
    const types = EVENT_CATALOGUE.map((entry) => entry.eventType);
    expect(new Set(types).size).toBe(types.length);
  });
});

describe('canonical values', () => {
  it('lists the claim lifecycle from the specification', () => {
    expect(ClaimStatus.options).toContain('partially_paid');
    expect(ClaimStatus.options).toContain('reversed');
  });

  it('lists every integration outcome', () => {
    expect(IntegrationOutcome.options).toEqual([
      'published',
      'accepted',
      'rejected',
      'held',
      'duplicate',
      'failed_retrying',
      'dead_lettered',
      'unconfirmed',
    ]);
  });
});

describe('permissions', () => {
  it('accepts a catalogued permission and rejects an unknown one', () => {
    expect(PermissionSchema.safeParse('lab:verify').success).toBe(true);
    expect(PermissionSchema.safeParse('lab:destroy').success).toBe(false);
  });

  it('exposes every resource:action pair', () => {
    expect(ALL_PERMISSIONS).toContain('clm:view_financial');
    expect(ALL_PERMISSIONS).toContain('platform:ledger');
    expect(new Set(ALL_PERMISSIONS).size).toBe(ALL_PERMISSIONS.length);
  });
});

describe('problem details', () => {
  it('accepts a namespaced error code', () => {
    expect(
      ProblemDetails.safeParse({
        type: 'about:blank',
        title: 'Unauthorized',
        status: 401,
        code: 'AUTH-001',
      }).success,
    ).toBe(true);
  });

  it('rejects an unnamespaced code', () => {
    expect(
      ProblemDetails.safeParse({ type: 'about:blank', title: 'Bad', status: 400, code: 'OOPS' })
        .success,
    ).toBe(false);
  });
});
