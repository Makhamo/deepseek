import { IdempotencyKey, SHARED_PROBLEM_CODES } from '@uhs/contracts';
import type { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import type { ZodType } from 'zod';
import { problemError } from './errors.js';

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

/** Accepts an upstream request id, otherwise generates one (spec §4.3). */
export function requestId(): RequestHandler {
  return (req, res, next) => {
    const incoming = req.header('x-request-id');
    const id = incoming && REQUEST_ID_PATTERN.test(incoming) ? incoming : randomUUID();
    res.locals.requestId = id;
    res.locals.correlationId = id;
    res.setHeader('x-request-id', id);
    next();
  };
}

/**
 * Validates a request part against a contracts schema. The parsed value is
 * placed on res.locals.validated; the raw input is never trusted.
 */
export function validate<T>(
  schema: ZodType<T>,
  source: 'body' | 'query' | 'params' = 'body',
): RequestHandler {
  return (req, res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      next(
        problemError(
          422,
          SHARED_PROBLEM_CODES.validationFailed,
          'Request validation failed',
          parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        ),
      );
      return;
    }
    res.locals.validated = parsed.data;
    next();
  };
}

/**
 * POST requires an Idempotency-Key (spec §4.4). Storage of the request hash and
 * replay of the stored response is a per-service concern; this guarantees every
 * write arrives with a usable key.
 */
export function requireIdempotencyKey(): RequestHandler {
  return (req, _res, next) => {
    if (req.method !== 'POST') return next();

    const key = req.header('idempotency-key');
    if (!key || !IdempotencyKey.safeParse(key).success) {
      return next(
        problemError(
          400,
          SHARED_PROBLEM_CODES.idempotencyKeyMissing,
          'POST requests require a valid Idempotency-Key header',
        ),
      );
    }
    next();
  };
}

/** PUT and PATCH require If-Match (spec §4.4). */
export function requireIfMatch(): RequestHandler {
  return (req, _res, next) => {
    if (req.method !== 'PUT' && req.method !== 'PATCH') return next();

    if (!req.header('if-match')) {
      return next(
        problemError(
          428,
          SHARED_PROBLEM_CODES.preconditionFailed,
          'PUT and PATCH requests require an If-Match header',
        ),
      );
    }
    next();
  };
}
