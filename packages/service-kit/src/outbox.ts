import { routingKeyFor, type Envelope } from '@uhs/contracts';
import { sql } from 'drizzle-orm';
import type { PoolClient } from 'pg';
import type { Logger } from 'pino';
import { outbox } from './db/backbone.js';
import type { Database, Tx } from './db/client.js';
import type { EventBus } from './eventbus.js';

const BATCH_SIZE = 100;
const DEFAULT_POLL_MS = 500;
const PUBLISHED_RETENTION_DAYS = 7;

export function aggregateTypeFor(eventType: string): string {
  return eventType.split('.')[1] ?? 'unknown';
}

export function aggregateIdFor(envelope: Envelope): string {
  const subject = envelope.subject;
  return (
    subject.encounter_id ??
    subject.nicu_admission_id ??
    subject.patient_id ??
    subject.order_id ??
    subject.claim_id ??
    envelope.event_id
  );
}

/**
 * Writes an event into the outbox inside the caller's transaction (spec §9.3).
 * The business change and this row commit together or not at all.
 */
export async function appendEvent(tx: Tx, envelope: Envelope): Promise<void> {
  await tx.insert(outbox).values({
    id: envelope.event_id,
    aggregateType: aggregateTypeFor(envelope.event_type),
    aggregateId: aggregateIdFor(envelope),
    eventType: envelope.event_type,
    routingKey: routingKeyFor(envelope.event_type, envelope.source_application),
    envelope,
  });
  // Wakes the relay as soon as the transaction commits.
  await tx.execute(sql`select pg_notify('outbox_pending', '')`);
}

export interface OutboxRelay {
  /** Publishes everything currently pending; returns how many were published. */
  drain: () => Promise<number>;
  stop: () => Promise<void>;
}

export interface OutboxRelayOptions {
  database: Database;
  bus: EventBus;
  logger: Logger;
  pollIntervalMs?: number;
}

/**
 * Publishes pending outbox rows in order, using FOR UPDATE SKIP LOCKED so that
 * several service instances can run the relay at once (spec §9.3).
 *
 * Publishing happens inside the row's transaction and the row is marked
 * published only after the broker confirmed it. A crash between those two
 * steps redelivers the event; consumers are idempotent through the inbox, so
 * at-least-once is safe.
 */
export function startOutboxRelay(options: OutboxRelayOptions): OutboxRelay {
  const { database, bus, logger } = options;
  const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_MS;

  let running = true;
  let timer: NodeJS.Timeout | undefined;
  let inflight: Promise<void> = Promise.resolve();
  let listener: PoolClient | undefined;
  let iterations = 0;

  async function drain(): Promise<number> {
    const client = await database.pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query<{
        id: string;
        envelope: Envelope;
        routing_key: string;
      }>(
        `select id, envelope, routing_key
           from outbox
          where published_at is null
          order by created_at
          limit $1
          for update skip locked`,
        [BATCH_SIZE],
      );

      for (const row of rows) {
        await bus.publish(row.envelope, row.routing_key);
      }

      if (rows.length > 0) {
        await client.query('update outbox set published_at = now() where id = any($1::uuid[])', [
          rows.map((row) => row.id),
        ]);
      }

      await client.query('COMMIT');
      return rows.length;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  async function purge(): Promise<void> {
    await database.pool.query(
      `delete from outbox where published_at < now() - ($1 || ' days')::interval`,
      [PUBLISHED_RETENTION_DAYS],
    );
  }

  function schedule(delayMs: number): void {
    if (!running) return;
    timer = setTimeout(() => {
      inflight = runOnce();
    }, delayMs);
    timer.unref?.();
  }

  async function runOnce(): Promise<void> {
    if (!running) return;
    try {
      let published = 0;
      do {
        published = await drain();
      } while (running && published === BATCH_SIZE);

      iterations += 1;
      if (iterations % 120 === 0) await purge();
    } catch (error) {
      logger.error({ err: error }, 'outbox relay iteration failed');
    }
    schedule(pollIntervalMs);
  }

  void (async () => {
    try {
      listener = await database.pool.connect();
      await listener.query('LISTEN outbox_pending');
      listener.on('notification', () => {
        if (!running) return;
        if (timer) clearTimeout(timer);
        inflight = runOnce();
      });
    } catch (error) {
      logger.warn({ err: error }, 'outbox relay could not LISTEN; falling back to polling');
    }
  })();

  schedule(0);

  return {
    drain,
    async stop(): Promise<void> {
      running = false;
      if (timer) clearTimeout(timer);
      await inflight.catch(() => undefined);
      if (listener) {
        try {
          await listener.query('UNLISTEN outbox_pending');
        } finally {
          listener.release();
        }
      }
    },
  };
}
