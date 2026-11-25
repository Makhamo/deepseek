import { baseConfigSchema, loadConfig } from '@uhs/service-kit';
import { z } from 'zod';

/** The gateway has no database; it fans out over Redis (spec §13.1). */
const schema = baseConfigSchema.extend({
  REDIS_URL: z.string().min(1),
  AUTH_JWKS_URL: z.string().min(1),
  AUTH_ISSUER: z.string().min(1),
});

export type RealtimeConfig = z.infer<typeof schema>;

export function loadRealtimeConfig(source: NodeJS.ProcessEnv = process.env): RealtimeConfig {
  return loadConfig(schema, source);
}
