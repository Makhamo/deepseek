import {
  newId,
  type Envelope,
  type IntegrationOutcome,
  type Subject,
} from '@uhs/contracts';
import { and, eq } from 'drizzle-orm';
import type { Logger } from 'pino';
import { heldEvent, inbox } from './db/backbone.js';
import type { Database, Tx } from './db/client.js';
import { appendEvent } from './outbox.js';
import { isoNow } from './time.js';

export type HandlerOutcome = Extract<IntegrationOutcome, 'accepted' | 'rejected' | 'held'>;

export interface HandlerResult {
  outcome: HandlerOutcome;
  reasonCode?: string;
  detail?: string;
  targetRecordId?: string;
}

export type InboxEventHandler = (envelope: Envelope, tx: Tx) => Promise<HandlerResult>;

export interface InboxOptions {
  consumer: string;
  database: Database;
  logger: Logger;
}

function ackEnvelope(
  source: Envelope,
  consumer: string,
  tenantId: string,
  result: HandlerResult,
): Envelope {
  const subject: Subject = { ...source.subject };
  return {
    event_id: newId(),
    event_type: 'integration.ack',
    event_version: 1,
    occurred_at: isoNow(),
    source_service: consumer,
    source_record_id: source.event_id,
    source_tenant_id: tenantId,
    target_tenant_id: null,
    relationship_id: null,
    source_application: null,
    correlation_id: source.correlation_id,
    causation_id: source.event_id,
    subject,
    actor: { type: 'service', id: consumer },
    classification: 'internal',
    payload: {
      event_id: source.event_id,
      consumer,
      outcome: result.outcome,
      reason_code: result.reasonCode ?? null,
      detail: result.detail ?? null,
      target_record_id: result.targetRecordId ?? null,
    },
    // The contract's refine() only requires a subject id, which the source carries.
  } as Envelope;
}

/**
 * Runs a handler exactly once per (consumer, event_id) (spec §9.4).
 *
 * The inbox row is inserted in the same transaction as the handler's work, so
 * a technical failure rolls everything back and a redelivery retries cleanly.
 * Business outcomes are returned, never thrown.
 */
export async function handleEvent(
  options: InboxOptions,
  handler: InboxEventHandler,
  envelope: Envelope,
): Promise<HandlerOutcome | 'duplicate'> {
  const tenantId = envelope.target_tenant_id ?? envelope.source_tenant_id;

  return options.database.withTenant(tenantId, async (tx) => {
    const claimed = await tx
      .insert(inbox)
      .values({ consumer: options.consumer, eventId: envelope.event_id, outcome: 'processing' })
      .onConflictDoNothing()
      .returning({ eventId: inbox.eventId });

    if (claimed.length === 0) {
      options.logger.debug(
        { eventId: envelope.event_id, consumer: options.consumer },
        'duplicate event ignored',
      );
      return 'duplicate' as const;
    }

    const result = await handler(envelope, tx);

    await tx
      .update(inbox)
      .set({ outcome: result.outcome })
      .where(
        and(eq(inbox.consumer, options.consumer), eq(inbox.eventId, envelope.event_id)),
      );

    if (result.outcome === 'held') {
      await tx
        .insert(heldEvent)
        .values({
          eventId: envelope.event_id,
          consumer: options.consumer,
          reasonCode: result.reasonCode ?? 'UNSPECIFIED',
          detail: result.detail ?? null,
          envelope,
        })
        .onConflictDoNothing();
    }

    await appendEvent(tx, ackEnvelope(envelope, options.consumer, tenantId, result));

    return result.outcome;
  });
}
