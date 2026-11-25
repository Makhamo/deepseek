import { baseConfigSchema, loadConfig } from '@uhs/service-kit';
import { z } from 'zod';

/**
 * lab configuration. Startup fails with a readable message when a
 * required value is missing; nothing is read from a request body.
 */
const schema = baseConfigSchema.extend({
  DATABASE_URL: z.string().min(1),
  MIGRATION_DATABASE_URL: z.string().min(1),
  RABBITMQ_URL: z.string().min(1),
  AUTH_JWKS_URL: z.string().min(1),
  AUTH_ISSUER: z.string().min(1),
  REPORT_SIGNING_SECRET: z.string().optional(),
});

export type ServiceConfig = z.infer<typeof schema>;

export function loadServiceConfig(source: NodeJS.ProcessEnv = process.env): ServiceConfig {
  return loadConfig(schema, source);
}
