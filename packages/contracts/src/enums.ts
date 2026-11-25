import { z } from 'zod';

/**
 * Canonical persisted/published values (spec §10.1). Display labels may differ
 * per application, but these are the only values that cross a boundary.
 */

export const LabOrderStatus = z.enum([
  'requested',
  'accepted',
  'held',
  'rejected',
  'in_progress',
  'completed',
  'cancelled',
]);
export type LabOrderStatus = z.infer<typeof LabOrderStatus>;

export const SpecimenStatus = z.enum([
  'expected',
  'collected',
  'received',
  'processing',
  'rejected',
  'cancelled',
]);
export type SpecimenStatus = z.infer<typeof SpecimenStatus>;

export const TestStatus = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);
export type TestStatus = z.infer<typeof TestStatus>;

export const ResultStatus = z.enum([
  'in_progress',
  'preliminary',
  'final',
  'amended',
  'cancelled',
]);
export type ResultStatus = z.infer<typeof ResultStatus>;

export const AmendmentType = z.enum(['amendment', 'correction']);
export type AmendmentType = z.infer<typeof AmendmentType>;

export const TriageStatus = z.enum(['in_progress', 'completed', 'cancelled']);
export type TriageStatus = z.infer<typeof TriageStatus>;

export const ClaimStatus = z.enum([
  'draft',
  'submitted',
  'accepted',
  'rejected',
  'adjudicated',
  'approved',
  'partially_approved',
  'partially_paid',
  'paid',
  'adjusted',
  'reversed',
]);
export type ClaimStatus = z.infer<typeof ClaimStatus>;

export const Priority = z.enum(['routine', 'urgent', 'emergency']);
export type Priority = z.infer<typeof Priority>;

export const IntegrationOutcome = z.enum([
  'published',
  'accepted',
  'rejected',
  'held',
  'duplicate',
  'failed_retrying',
  'dead_lettered',
  'unconfirmed',
]);
export type IntegrationOutcome = z.infer<typeof IntegrationOutcome>;

export const Classification = z.enum([
  'public',
  'internal',
  'personal',
  'clinical',
  'financial',
]);
export type Classification = z.infer<typeof Classification>;

/** Application short codes used for routing keys (spec §9.2). */
export const SourceApplication = z.enum(['pm', 'ph', 'nicu']);
export type SourceApplication = z.infer<typeof SourceApplication>;
