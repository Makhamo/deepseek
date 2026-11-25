import { PROBLEM_CONTENT_TYPE, SHARED_PROBLEM_CODES } from '@uhs/contracts';
import { Router } from 'express';

export interface ReadinessCheck {
  name: string;
  /** Throws when the dependency is unavailable. */
  check: () => Promise<void> | void;
}

export interface HealthRouterOptions {
  service: string;
  readiness?: readonly ReadinessCheck[];
}

interface CheckReport {
  name: string;
  ok: boolean;
  error?: string;
}

/**
 * GET /health/live is the process; GET /health/ready is the dependencies
 * (database, broker, Redis) — spec §4.4.
 */
export function healthRouter(options: HealthRouterOptions): Router {
  const router = Router();
  const readiness = options.readiness ?? [];

  router.get('/live', (_req, res) => {
    res.status(200).json({ status: 'live', service: options.service });
  });

  router.get('/ready', async (_req, res) => {
    const reports: CheckReport[] = await Promise.all(
      readiness.map(async (entry): Promise<CheckReport> => {
        try {
          await entry.check();
          return { name: entry.name, ok: true };
        } catch (error) {
          return {
            name: entry.name,
            ok: false,
            error: error instanceof Error ? error.message : 'unavailable',
          };
        }
      }),
    );

    const failed = reports.filter((report) => !report.ok);

    if (failed.length > 0) {
      res.status(503).type(PROBLEM_CONTENT_TYPE).json({
        type: 'about:blank',
        title: 'Service Unavailable',
        status: 503,
        code: SHARED_PROBLEM_CODES.notReady,
        detail: `Not ready: ${failed.map((report) => report.name).join(', ')}`,
        checks: reports,
      });
      return;
    }

    res.status(200).json({ status: 'ready', service: options.service, checks: reports });
  });

  return router;
}
