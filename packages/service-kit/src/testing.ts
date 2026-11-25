import type { Logger } from 'pino';
import { createLogger } from './logger.js';

/** A logger that discards output, for tests. */
export function silentLogger(service = 'test'): Logger {
  return createLogger({ service, level: 'silent' });
}
