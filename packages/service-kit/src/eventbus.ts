import {
  DEAD_LETTER_EXCHANGE,
  Envelope as EnvelopeSchema,
  TOPIC_EXCHANGE,
  routingKeyFor,
  type Envelope,
} from '@uhs/contracts';
import { connect } from 'amqplib';
import type { Logger } from 'pino';

type AmqpConnection = Awaited<ReturnType<typeof connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection['createConfirmChannel']>>;
type ConsumeCallback = Parameters<AmqpChannel['consume']>[1];
type Delivery = NonNullable<Parameters<ConsumeCallback>[0]>;

/** Retry delays required by spec §9.6. */
export const RETRY_DELAYS_MS = [1_000, 5_000, 30_000, 120_000, 600_000] as const;

export const MAX_ATTEMPTS = RETRY_DELAYS_MS.length + 1;

export type EventHandler = (
  envelope: Envelope,
  routingKey: string,
  attempt: number,
) => Promise<void>;

export interface EventBus {
  publish: (envelope: Envelope, routingKey?: string) => Promise<void>;
  consume: (queue: string, bindings: readonly string[], handler: EventHandler) => Promise<void>;
  isReady: () => boolean;
  close: () => Promise<void>;
}

export interface EventBusOptions {
  url: string;
  service: string;
  logger: Logger;
  /** Overridable for tests; defaults to the five delays in RETRY_DELAYS_MS. */
  retryDelaysMs?: readonly number[];
}

/**
 * Wraps amqplib so service code never imports it directly (spec §9.2).
 *
 * Topology per consumer queue:
 *   queue            durable, bound to uhs.events, dead-letters to <queue>.dlx
 *   <queue>.dlx      fanout, dead-letter target
 *   <queue>.dlq      durable, bound to <queue>.dlx
 *   <queue>.retry.N  durable TTL queue, dead-letters to <queue>.redeliver
 *   <queue>.redeliver fanout, bound to the consumer queue
 *
 * Delaying through a TTL queue and re-delivering through a fanout preserves the
 * original routing key, which a dead-letter back to the topic exchange would
 * not do reliably.
 */
export async function createEventBus(options: EventBusOptions): Promise<EventBus> {
  const retryDelays = options.retryDelaysMs ?? RETRY_DELAYS_MS;
  const connection = await connect(options.url);
  const channel = await connection.createConfirmChannel();

  let ready = true;
  connection.on('close', () => {
    ready = false;
  });
  connection.on('error', (error) => {
    ready = false;
    options.logger.error({ err: error }, 'rabbitmq connection error');
  });

  await channel.assertExchange(TOPIC_EXCHANGE, 'topic', { durable: true });
  await channel.assertExchange(DEAD_LETTER_EXCHANGE, 'topic', { durable: true });
  await channel.prefetch(10);

  async function publish(envelope: Envelope, routingKey?: string): Promise<void> {
    const key = routingKey ?? routingKeyFor(envelope.event_type, envelope.source_application);
    channel.publish(TOPIC_EXCHANGE, key, Buffer.from(JSON.stringify(envelope)), {
      persistent: true,
      contentType: 'application/json',
      messageId: envelope.event_id,
      correlationId: envelope.correlation_id,
      timestamp: Date.now(),
      type: envelope.event_type,
      headers: { 'x-attempt': 0, classification: envelope.classification },
    });
    await channel.waitForConfirms();
  }

  async function declareConsumerTopology(queue: string): Promise<void> {
    await channel.assertExchange(`${queue}.dlx`, 'fanout', { durable: true });
    await channel.assertQueue(`${queue}.dlq`, { durable: true });
    await channel.bindQueue(`${queue}.dlq`, `${queue}.dlx`, '');

    await channel.assertQueue(queue, {
      durable: true,
      deadLetterExchange: `${queue}.dlx`,
    });

    await channel.assertExchange(`${queue}.redeliver`, 'fanout', { durable: true });
    await channel.bindQueue(queue, `${queue}.redeliver`, '');

    for (const [index, delay] of retryDelays.entries()) {
      await channel.assertQueue(`${queue}.retry.${index}`, {
        durable: true,
        arguments: {
          'x-message-ttl': delay,
          'x-dead-letter-exchange': `${queue}.redeliver`,
        },
      });
    }
  }

  async function consume(
    queue: string,
    bindings: readonly string[],
    handler: EventHandler,
  ): Promise<void> {
    await declareConsumerTopology(queue);

    for (const binding of bindings) {
      await channel.bindQueue(queue, TOPIC_EXCHANGE, binding);
    }

    await channel.consume(queue, (message: Delivery | null) => {
      if (!message) return;
      void (async () => {
        let envelope: Envelope;
        try {
          envelope = EnvelopeSchema.parse(JSON.parse(message.content.toString()));
        } catch (error) {
          options.logger.error({ err: error, queue }, 'undecodable event; dead-lettering');
          channel.nack(message, false, false);
          return;
        }

        const rawAttempt = message.properties.headers?.['x-attempt'];
        const attempt = typeof rawAttempt === 'number' ? rawAttempt : Number(rawAttempt ?? 0) || 0;

        try {
          await handler(envelope, message.fields.routingKey, attempt);
          channel.ack(message);
        } catch (error) {
          const nextAttempt = attempt + 1;
          const exhausted = nextAttempt >= MAX_ATTEMPTS;
          const delayIndex = Math.min(nextAttempt - 1, retryDelays.length - 1);
          const target = exhausted ? `${queue}.dlq` : `${queue}.retry.${delayIndex}`;

          options.logger.error(
            { err: error, eventId: envelope.event_id, queue, attempt: nextAttempt, exhausted },
            'event handler failed',
          );

          // Publish before acknowledging: a crash here redelivers rather than loses.
          channel.publish('', target, message.content, {
            persistent: true,
            contentType: 'application/json',
            messageId: envelope.event_id,
            correlationId: envelope.correlation_id,
            type: envelope.event_type,
            headers: { ...message.properties.headers, 'x-attempt': nextAttempt },
          });
          await channel.waitForConfirms();
          channel.ack(message);
        }
      })();
    });

    options.logger.info({ queue, bindings }, 'consuming events');
  }

  return {
    publish,
    consume,
    isReady: () => ready,
    async close(): Promise<void> {
      ready = false;
      await channel.close().catch(() => undefined);
      await connection.close().catch(() => undefined);
    },
  };
}
