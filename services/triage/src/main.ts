import {
  createDatabase,
  createEventBus,
  createLifecycle,
  createLogger,
  startTracing,
  splitOrigins,
} from '@uhs/service-kit';
import { buildApp } from './app.js';
import { loadServiceConfig } from './config.js';

async function main(): Promise<void> {
  const config = loadServiceConfig();
  const logger = createLogger({
    service: config.SERVICE_NAME,
    level: config.LOG_LEVEL,
    pretty: config.NODE_ENV === 'development',
  });

  const tracing = startTracing({
    service: config.SERVICE_NAME,
    endpoint: config.OTEL_EXPORTER_OTLP_ENDPOINT,
    logger,
  });

  const database = createDatabase(config.DATABASE_URL);
  const bus = await createEventBus({
    url: config.RABBITMQ_URL,
    service: config.SERVICE_NAME,
    logger,
  });

  const { app } = buildApp({
    logger,
    database,
    busReady: () => bus.isReady(),
    corsOrigins: splitOrigins(config.CORS_ORIGINS),
    auth: {
      jwksUrl: config.AUTH_JWKS_URL,
      issuer: config.AUTH_ISSUER,
      algorithm: config.AUTH_JWT_ALG,
    },
  });

  const server = app.listen(config.PORT, '0.0.0.0', () => {
    logger.info({ port: config.PORT }, 'service listening');
  });

  const lifecycle = createLifecycle({ logger });
  lifecycle.onShutdown(
    'http',
    () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
      }),
  );
  lifecycle.onShutdown('broker', () => bus.close());
  lifecycle.onShutdown('database', () => database.close());
  lifecycle.onShutdown('tracing', () => tracing.stop());
  lifecycle.installSignalHandlers();

  logger.info({ service: config.SERVICE_NAME }, 'service started');
}

main().catch((error: unknown) => {
  process.stderr.write(
    'failed to start service: ' + (error instanceof Error ? error.message : String(error)) + '\n',
  );
  process.exit(1);
});
