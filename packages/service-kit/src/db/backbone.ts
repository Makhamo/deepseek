import { sql } from 'drizzle-orm';
import { index, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { Envelope } from '@uhs/contracts';

/**
 * The transactional outbox (spec §6.2, §9.3). A service writes its business
 * change and the outgoing event in the same transaction; the relay publishes
 * from here afterwards.
 */
export const outbox = pgTable(
  'outbox',
  {
    id: uuid('id').primaryKey(),
    aggregateType: text('aggregate_type').notNull(),
    aggregateId: uuid('aggregate_id').notNull(),
    eventType: text('event_type').notNull(),
    routingKey: text('routing_key').notNull(),
    envelope: jsonb('envelope').$type<Envelope>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (table) => [
    index('outbox_pending_idx')
      .on(table.createdAt)
      .where(sql`${table.publishedAt} is null`),
    index('outbox_published_idx').on(table.publishedAt),
  ],
);

/**
 * The inbox (spec §6.2, §9.4). The primary key on (consumer, event_id) is what
 * makes every consumer idempotent across redeliveries.
 */
export const inbox = pgTable(
  'inbox',
  {
    consumer: text('consumer').notNull(),
    eventId: uuid('event_id').notNull(),
    outcome: text('outcome').notNull(),
    attempts: integer('attempts').notNull().default(0),
    processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.consumer, table.eventId] })],
);

/**
 * Events that cannot be safely associated with local records (spec §9.4,
 * §9.5). They are acknowledged, never retried automatically, and resolved by a
 * human through the integration ledger.
 */
export const heldEvent = pgTable('held_event', {
  eventId: uuid('event_id').primaryKey(),
  consumer: text('consumer').notNull(),
  reasonCode: text('reason_code').notNull(),
  detail: text('detail'),
  envelope: jsonb('envelope').$type<Envelope>().notNull(),
  status: text('status').notNull().default('open'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});
