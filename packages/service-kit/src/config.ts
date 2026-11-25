import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

/**
 * Local development convenience only: services are started with their own
 * directory as cwd, so both a service-local .env and the repository .env are
 * considered. In deployed environments the values come from the environment.
 */
loadDotenv({ path: ['.env', '../../.env'], quiet: true });

/**
 * An empty value in a .env file means "not configured", not an empty string.
 * Without this, `FOO=` would fail a min(1) check on an optional variable.
 */
function optionalEnv<T extends z.ZodType>(schema: T) {
  return z.preprocess((value) => (value === '' ? undefined : value), schema.optional());
}

/**
 * The environment every service shares (spec §4.2). A service extends this
 * schema with the values it cannot run without (a database, a broker, ...),
 * so a missing variable fails at startup with a readable message rather than
 * at the first request.
 */
export const baseConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SERVICE_NAME: z.string().min(1),
  // 0 is valid: the OS assigns a free port (used by tests and the migrate CLI).
  PORT: z.coerce.number().int().min(0).max(65535).default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  DATABASE_URL: optionalEnv(z.string().min(1)),
  MIGRATION_DATABASE_URL: optionalEnv(z.string().min(1)),

  RABBITMQ_URL: optionalEnv(z.string().min(1)),
  REDIS_URL: optionalEnv(z.string().min(1)),

  AUTH_JWKS_URL: optionalEnv(z.string().min(1)),
  AUTH_ISSUER: optionalEnv(z.string().min(1)),
  AUTH_JWT_ALG: z.string().min(1).default('EdDSA'),
  AUTH_AUDIENCE: z.string().min(1).default('uhs-api'),

  CORS_ORIGINS: z.string().default(''),
  OTEL_EXPORTER_OTLP_ENDPOINT: optionalEnv(z.string().min(1)),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  REQUEST_BODY_LIMIT: z.string().default('1mb'),
});

export type BaseConfig = z.infer<typeof baseConfigSchema>;

export class ConfigurationError extends Error {
  constructor(public readonly issues: readonly string[]) {
    super(`Invalid configuration:\n  - ${issues.join('\n  - ')}`);
    this.name = 'ConfigurationError';
  }
}

/**
 * Parses and validates the environment. Never call this at module scope of a
 * library module: only a service's main.ts decides when the process starts.
 */
export function loadConfig<S extends z.ZodType>(
  schema: S,
  source: NodeJS.ProcessEnv = process.env,
): z.infer<S> {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(
      (issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`,
    );
    throw new ConfigurationError(issues);
  }
  return parsed.data;
}

export function splitOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
