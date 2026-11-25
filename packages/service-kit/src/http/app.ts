import cors from 'cors';
import express from 'express';
import type { Express, Router } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import { errorHandler, notFoundHandler } from './errors.js';
import { healthRouter, type ReadinessCheck } from './health.js';
import { requestId } from './middleware.js';

export interface ServiceAppOptions {
  service: string;
  logger: Logger;
  corsOrigins?: readonly string[];
  rateLimit?: { windowMs: number; limit: number };
  readiness?: readonly ReadinessCheck[];
  /** Mounts the service's own routes; health routes are always present. */
  routes?: (router: Router) => void;
  /**
   * Runs after security middleware but before any body parsing. Auth mounts the
   * Better Auth handler here because it reads the raw request body itself.
   */
  beforeBodyParsers?: (app: Express) => void;
  bodyLimit?: string;
}

export interface ServiceApp {
  app: Express;
  router: Router;
}

/**
 * Assembles the middleware in the order required by spec §4.3:
 * request id → logging → security → rate limit → (auth per route) → handler →
 * central error handler.
 *
 * Authentication is deliberately not global: each route declares
 * authenticate() and requirePermission(), and internal routes accept service
 * tokens only.
 */
export function createServiceApp(options: ServiceAppOptions): ServiceApp {
  const app = express();
  app.disable('x-powered-by');

  app.use(requestId());

  app.use(
    pinoHttp({
      logger: options.logger,
      genReqId: (_req, res) => String(res.locals.requestId ?? ''),
      customLogLevel: (_req, res, error) => {
        if (error || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    }),
  );

  app.use((_req, res, next) => {
    res.locals.logger = options.logger;
    next();
  });

  app.use(helmet());

  const origins = [...(options.corsOrigins ?? [])];
  app.use(
    cors({
      origin: origins.length > 0 ? origins : false,
      credentials: true,
      maxAge: 600,
    }),
  );

  options.beforeBodyParsers?.(app);

  app.use(express.json({ limit: options.bodyLimit ?? '1mb' }));

  app.use(
    rateLimit({
      windowMs: options.rateLimit?.windowMs ?? 60_000,
      limit: options.rateLimit?.limit ?? 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  );

  app.use('/health', healthRouter({ service: options.service, readiness: options.readiness }));

  const router = express.Router();
  options.routes?.(router);
  app.use(router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, router };
}
