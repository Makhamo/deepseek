import type { RequestContext } from '@uhs/service-kit';

/**
 * Notification channels (spec §13.1). Messages are notifications only: the
 * client always fetches data through the API.
 */
export const CHANNELS = {
  tenantLabResults: (tenantId: string) => `tenant:${tenantId}:lab-results`,
  patientUpdates: (patientId: string) => `patient:${patientId}:updates`,
  nicuResults: (admissionId: string) => `nicu:${admissionId}:results`,
  pharmacyQueue: (tenantId: string) => `tenant:${tenantId}:pharmacy-queue`,
} as const;

export interface SubscriptionRequest {
  channel: string;
  patientId?: string;
  nicuAdmissionId?: string;
}

/**
 * A caller may only join a channel it can already read through the API.
 *
 * This is the single place that decision is made. Relationship checks (does
 * this clinician treat this patient, is there consent) belong to core; until
 * that endpoint exists only tenant-scoped staff channels are permitted, and a
 * patient channel requires the caller's own patient id.
 */
export function canSubscribe(context: RequestContext, request: SubscriptionRequest): boolean {
  if (!context.tenantId && !context.userId) return false;

  if (request.channel.startsWith('tenant:')) {
    const [, tenantId, room] = request.channel.split(':');
    if (!tenantId || !room) return false;
    if (tenantId !== context.tenantId) return false;
    if (room === 'pharmacy-queue') return context.permissions.includes('ph:read');
    if (room === 'lab-results') {
      return context.permissions.includes('lab:read') || context.permissions.includes('pm:read');
    }
    return false;
  }

  if (request.channel.startsWith('patient:')) {
    const [, patientId, room] = request.channel.split(':');
    return Boolean(patientId && room === 'updates' && request.patientId === patientId);
  }

  if (request.channel.startsWith('nicu:')) {
    return (
      context.permissions.includes('nicu:read') && request.nicuAdmissionId !== undefined
    );
  }

  return false;
}
