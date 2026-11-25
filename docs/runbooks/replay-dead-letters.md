# Replay dead letters

**When:** a consumer queue's `.dlq` has depth above zero.

1. Inspect the queue in the RabbitMQ management UI (`http://localhost:15672`,
   user `uhs`) under **Queues** → `<service>.<purpose>.dlq`.
2. Read the `x-attempt` header and the failure reason in the service logs; filter
   by `eventId`.
3. Fix the cause. Never replay into a consumer that will fail for the same
   reason: the event will return to the dead-letter queue.
4. Replay with `POST /v1/ledger/dead-letters/{event_id}/replay` once core exposes
   the ledger endpoint (build order step 2). Until then, republish the message
   from the management UI.
5. Confirm the outcome through the integration ledger, not by assuming the
   publish succeeded.

Consumers are idempotent through the inbox, so a replay cannot duplicate work.
