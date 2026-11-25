import { z } from 'zod';

/**
 * RFC 9457 Problem Details (spec §4.4). Stable codes follow
 * <SERVICE>-<AREA>-<NNN>, e.g. CORE-REGISTRY-001. Stack traces, SQL and internal
 * identifiers never appear here.
 */
export const PROBLEM_CONTENT_TYPE = 'application/problem+json';

export const ProblemDetails = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  status: z.number().int().min(400).max(599),
  code: z.string().regex(/^[A-Z]+(-[A-Z]+)?-\d{3}$/),
  detail: z.string().optional(),
  correlation_id: z.string().optional(),
  errors: z
    .array(z.object({ path: z.string(), message: z.string() }))
    .optional(),
});
export type ProblemDetails = z.infer<typeof ProblemDetails>;

/** Codes the shared backbone can emit; services add their own namespaced codes. */
export const SHARED_PROBLEM_CODES = {
  missingToken: 'AUTH-001',
  invalidToken: 'AUTH-002',
  tokenExpired: 'AUTH-003',
  forbidden: 'AUTH-004',
  idempotencyKeyMissing: 'HTTP-001',
  idempotencyKeyMismatch: 'HTTP-002',
  preconditionFailed: 'HTTP-003',
  validationFailed: 'HTTP-004',
  notFound: 'HTTP-404',
  internal: 'HTTP-500',
  notReady: 'HEALTH-001',
} as const;

export type SharedProblemCode = (typeof SHARED_PROBLEM_CODES)[keyof typeof SHARED_PROBLEM_CODES];
