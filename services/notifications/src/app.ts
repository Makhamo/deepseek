import { createServiceApp, type ReadinessCheck } from '@uhs/service-kit';
import type { Logger } from 'pino';

export interface AppDependencies {
  logger: Logger;
  redisReady: () => boolean;
  corsOrigins: readonly string[];
}

export function buildApp(deps: AppDependencies) {
  const readiness: ReadinessCheck[] = [
    {
      name: 'redis',
      check: () => {
        if (!deps.redisReady()) throw new Error('redis connection is not ready');
      },
    },
  ];

  return createServiceApp({
    service: 'notifications',
    logger: deps.logger,
    corsOrigins: deps.corsOrigins,
    readiness,
    routes: (router) => {
      // The socket upgrades on this path; HTTP only reports why it is up.
      router.get('/v1/notifications/ping', (_req, res) => {
        res.json({ service: 'notifications', transport: 'socket.io' });
      });
    },
  });
}
