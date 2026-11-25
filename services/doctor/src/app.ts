import type { Database } from '@uhs/service-kit';
import { authenticate, createServiceApp, requirePermission } from '@uhs/service-kit';
import type { RequestHandler } from 'express';
import type { Logger } from 'pino';

export interface AppDependencies {
  logger: Logger;
  database: Database;
  busReady: () => boolean;
  corsOrigins: readonly string[];
  auth: { jwksUrl: string; issuer: string; algorithm: string };
}

export function buildApp(deps: AppDependencies) {
  const auth: RequestHandler = authenticate({
    jwksUrl: deps.auth.jwksUrl,
    issuer: deps.auth.issuer,
    algorithm: deps.auth.algorithm,
  });

  return createServiceApp({
    service: 'doctor',
    logger: deps.logger,
    corsOrigins: deps.corsOrigins,
    readiness: [
      { name: 'database', check: () => deps.database.ping() },
      {
        name: 'broker',
        check: () => {
          if (!deps.busReady()) throw new Error('broker connection is not ready');
        },
      },
    ],
    routes: (router) => {
      /**
       * Placeholder route. It proves the token -> tenant -> permission chain is
       * wired end to end. The real doctor endpoints replace it as the
       * modules under src/modules are implemented.
       */
      router.get('/v1/doctor/ping', auth, requirePermission('pm:read'), (_req, res) => {
        res.json({ service: 'doctor', ok: true });
      });
    },
  });
}
