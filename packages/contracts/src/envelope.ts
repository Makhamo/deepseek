import { z } from 'zod';
import { Classification, SourceApplication } from './enums.js';

/** Identifiers a consumer needs to associate an event without extra reads. */
export const Subject = z.object({
  patient_id: z.uuid().optional(),
  encounter_id: z.uuid().optional(),
  nicu_admission_id: z.uuid().optional(),
  order_id: z.uuid().optional(),
  claim_id: z.uuid().optional(),
});
export type Subject = z.infer<typeof Subject>;

export const Actor = z.object({
  type: z.enum(['user', 'service']),
  id: z.string().min(1),
});
export type Actor = z.infer<typeof Actor>;

/** At least one subject identifier must be present. */
const subjectHasIdentifier = (subject: z.infer<typeof Subject>): boolean =>
  Object.values(subject).some((value) => typeof value === 'string' && value.length > 0);

/**
 * The event envelope (spec §9.1). Additive changes only within an event_version;
 * a breaking change requires a new version.
 */
export const Envelope = z
  .object({
    event_id: z.uuid(),
    event_type: z
      .string()
      .regex(/^[a-z]+\.[a-z_]+\.[a-z_]+$/, 'event_type must be <service>.<aggregate>.<verb>'),
    event_version: z.number().int().positive(),
    occurred_at: z.iso.datetime({ offset: true }),
    published_at: z.iso.datetime({ offset: true }).optional(),
    source_service: z.string().min(1),
    source_record_id: z.string().min(1),
    source_tenant_id: z.uuid(),
    target_tenant_id: z.uuid().nullable().default(null),
    relationship_id: z.uuid().nullable().default(null),
    source_application: SourceApplication.nullable().default(null),
    correlation_id: z.uuid(),
    causation_id: z.uuid().nullable().default(null),
    subject: Subject,
    actor: Actor,
    classification: Classification,
    payload: z.record(z.string(), z.unknown()),
  })
  .refine((envelope) => subjectHasIdentifier(envelope.subject), {
    message: 'subject must carry at least one identifier',
    path: ['subject'],
  });

export type Envelope = z.infer<typeof Envelope>;

/** The envelope plus the broker metadata a consumer receives. */
export const DeliveredEvent = z.object({
  envelope: Envelope,
  routing_key: z.string().min(1),
  attempt: z.number().int().nonnegative().default(0),
});
export type DeliveredEvent = z.infer<typeof DeliveredEvent>;
