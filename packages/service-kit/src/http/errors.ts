import { PROBLEM_CONTENT_TYPE, SHARED_PROBLEM_CODES, type ProblemDetails } from '@uhs/contracts';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export interface FieldError {
  path: string;
  message: string;
}

export class ProblemError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail?: string;
  readonly errors?: readonly FieldError[];

  constructor(
    status: number,
    code: string,
    detail?: string,
    errors?: readonly FieldError[],
  ) {
    super(detail ?? code);
    this.name = 'ProblemError';
    this.status = status;
    this.code = code;
    if (detail !== undefined) this.detail = detail;
    if (errors !== undefined) this.errors = errors;
  }
}

export function problemError(
  status: number,
  code: string,
  detail?: string,
  errors?: readonly FieldError[],
): ProblemError {
  return new ProblemError(status, code, detail, errors);
}

const TITLES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  412: 'Precondition Failed',
  422: 'Unprocessable Content',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
};

export function toProblemDetails(error: unknown, correlationId?: string): ProblemDetails {
  const correlation = correlationId ? { correlation_id: correlationId } : {};

  if (error instanceof ProblemError) {
    return {
      type: 'about:blank',
      title: TITLES[error.status] ?? 'Error',
      status: error.status,
      code: error.code,
      ...(error.detail ? { detail: error.detail } : {}),
      ...correlation,
      ...(error.errors ? { errors: [...error.errors] } : {}),
    };
  }

  if (error instanceof ZodError) {
    return {
      type: 'about:blank',
      title: TITLES[422] ?? 'Unprocessable Content',
      status: 422,
      code: SHARED_PROBLEM_CODES.validationFailed,
      detail: 'Request validation failed',
      ...correlation,
      errors: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  return {
    type: 'about:blank',
    title: TITLES[500] ?? 'Internal Server Error',
    status: 500,
    code: SHARED_PROBLEM_CODES.internal,
    ...correlation,
  };
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  const correlationId = typeof res.locals.correlationId === 'string' ? res.locals.correlationId : undefined;
  res
    .status(404)
    .type(PROBLEM_CONTENT_TYPE)
    .json(toProblemDetails(problemError(404, SHARED_PROBLEM_CODES.notFound), correlationId));
};

/**
 * The single place an error becomes an HTTP response. Stack traces, SQL and
 * internal identifiers never cross this boundary (spec §4.4, §16).
 */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const correlationId = typeof res.locals.correlationId === 'string' ? res.locals.correlationId : undefined;
  const problem = toProblemDetails(error, correlationId);

  if (problem.status >= 500) {
    const logger = res.locals.logger;
    if (logger && typeof (logger as { error?: unknown }).error === 'function') {
      (logger as { error: (obj: object, msg: string) => void }).error(
        { err: error },
        'unhandled request error',
      );
    }
  }

  res.status(problem.status).type(PROBLEM_CONTENT_TYPE).json(problem);
};
