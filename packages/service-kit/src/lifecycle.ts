import type { Logger } from 'pino';

export interface LifecycleOptions {
  logger: Logger;
  /** Hard exit deadline once shutdown starts (spec §4.4: 30 seconds). */
  timeoutMs?: number;
}

export interface Lifecycle {
  onShutdown: (name: string, run: () => Promise<void> | void) => void;
  shutdown: (reason: string) => Promise<void>;
  installSignalHandlers: () => void;
}

/**
 * On SIGTERM the service stops accepting requests, stops consumers, finishes
 * in-flight work, flushes the outbox relay and closes pools. Hooks run in
 * reverse registration order.
 */
export function createLifecycle(options: LifecycleOptions): Lifecycle {
  const { logger } = options;
  const timeoutMs = options.timeoutMs ?? 30_000;
  const hooks: { name: string; run: () => Promise<void> | void }[] = [];
  let inFlight: Promise<void> | undefined;

  async function shutdown(reason: string): Promise<void> {
    if (inFlight) return inFlight;

    inFlight = (async () => {
      logger.info({ reason }, 'shutting down');
      const deadline = new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          logger.fatal({ timeoutMs }, 'shutdown timed out; exiting');
          resolve();
        }, timeoutMs);
        timer.unref?.();
      });

      await Promise.race([
        (async () => {
          for (const hook of [...hooks].reverse()) {
            try {
              await hook.run();
            } catch (error) {
              logger.error({ err: error, hook: hook.name }, 'shutdown hook failed');
            }
          }
        })(),
        deadline,
      ]);

      logger.info('shutdown complete');
    })();

    return inFlight;
  }

  return {
    onShutdown(name, run) {
      hooks.push({ name, run });
    },
    shutdown,
    installSignalHandlers() {
      process.once('SIGTERM', () => {
        void shutdown('SIGTERM');
      });
      process.once('SIGINT', () => {
        void shutdown('SIGINT');
      });
      process.once('unhandledRejection', (reason) => {
        logger.fatal({ err: reason }, 'unhandled rejection');
        void shutdown('unhandledRejection');
      });
      process.once('uncaughtException', (error) => {
        logger.fatal({ err: error }, 'uncaught exception');
        void shutdown('uncaughtException');
      });
    },
  };
}
