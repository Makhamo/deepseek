import { pino } from 'pino';
import type { Logger, LoggerOptions } from 'pino';

/**
 * Fields that must never reach a log line (spec §17). Redaction is applied by
 * pino at serialisation time, including nested request headers.
 */
export const REDACTION_PATHS: readonly string[] = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  '*.authorization',
  '*.cookie',
  '*.password',
  '*.token',
  '*.access_token',
  '*.refresh_token',
  '*.national_id',
  '*.id_number',
  '*.passport',
  '*.phone',
  '*.email',
  '*.first_name',
  '*.last_name',
  '*.date_of_birth',
  '*.address',
  '*.result_value',
  '*.diagnosis',
];

export interface CreateLoggerOptions {
  service: string;
  level?: string;
  /** Human-readable output for local development; JSON always in production. */
  pretty?: boolean;
}

export function createLogger({ service, level = 'info', pretty = false }: CreateLoggerOptions): Logger {
  const options: LoggerOptions = {
    level,
    base: { service },
    redact: { paths: [...REDACTION_PATHS], censor: '[redacted]' },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
  };

  if (pretty) {
    options.transport = {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss.l', ignore: 'pid,hostname' },
    };
  }

  return pino(options);
}
