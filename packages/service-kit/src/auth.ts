import { SHARED_PROBLEM_CODES, isPermission, type Permission } from '@uhs/contracts';
import { AsyncLocalStorage } from 'node:async_hooks';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { RequestHandler } from 'express';
import { problemError } from './http/errors.js';

export interface RequestContext {
  requestId: string;
  correlationId: string;
  userId?: string;
  tenantId?: string;
  role?: string;
  permissions: readonly Permission[];
  facilityIds: readonly string[];
  isServiceToken: boolean;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn);
}

/** The verified identity for the current request, if any. */
export function currentRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

export interface TokenVerificationOptions {
  jwksUrl: string;
  issuer: string;
  algorithm?: string;
  audience?: string;
}

/** Claim names from the token contract in spec §5.5. */
interface AccessTokenClaims {
  sub?: unknown;
  tenant_id?: unknown;
  role?: unknown;
  perm?: unknown;
  fac?: unknown;
  actor_type?: unknown;
}

function claimString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * Verifies a user or service access token against the auth service's JWKS.
 * Issuer, audience, expiry and algorithm are all checked; unsigned tokens are
 * rejected (spec §16).
 */
export function authenticate(options: TokenVerificationOptions): RequestHandler {
  const jwks = createRemoteJWKSet(new URL(options.jwksUrl));
  const algorithms = [options.algorithm ?? 'EdDSA'];
  const audience = options.audience ?? 'uhs-api';

  return (req, res, next) => {
    void (async () => {
      const header = req.header('authorization');
      const token = header?.replace(/^Bearer\s+/i, '').trim();

      if (!token) {
        next(problemError(401, SHARED_PROBLEM_CODES.missingToken, 'Missing bearer token'));
        return;
      }

      try {
        const { payload } = await jwtVerify(token, jwks, {
          issuer: options.issuer,
          audience,
          algorithms,
        });
        const claims = payload as AccessTokenClaims;

        const permissions = Array.isArray(claims.perm)
          ? claims.perm.filter((value): value is Permission => typeof value === 'string' && isPermission(value))
          : [];

        const context: RequestContext = {
          requestId: typeof res.locals.requestId === 'string' ? res.locals.requestId : '',
          correlationId:
            typeof res.locals.correlationId === 'string' ? res.locals.correlationId : '',
          permissions,
          facilityIds: Array.isArray(claims.fac)
            ? claims.fac.filter((value): value is string => typeof value === 'string')
            : [],
          isServiceToken: claimString(claims.actor_type) === 'service',
          ...(claimString(claims.sub) ? { userId: claimString(claims.sub) as string } : {}),
          ...(claimString(claims.tenant_id)
            ? { tenantId: claimString(claims.tenant_id) as string }
            : {}),
          ...(claimString(claims.role) ? { role: claimString(claims.role) as string } : {}),
        };

        runWithRequestContext(context, () => next());
      } catch {
        next(problemError(401, SHARED_PROBLEM_CODES.invalidToken, 'Token is invalid or expired'));
      }
    })();
  };
}

/**
 * Declares the permission a route requires. Every route must have one; hiding a
 * menu item is never the control (spec §14, §16).
 */
export function requirePermission(permission: Permission): RequestHandler {
  return (_req, _res, next) => {
    const context = currentRequestContext();

    if (!context?.userId) {
      next(problemError(401, SHARED_PROBLEM_CODES.missingToken, 'Authentication required'));
      return;
    }

    if (!context.permissions.includes(permission)) {
      next(problemError(403, SHARED_PROBLEM_CODES.forbidden, `Missing permission: ${permission}`));
      return;
    }

    next();
  };
}
