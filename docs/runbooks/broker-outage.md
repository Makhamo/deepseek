# Broker outage

**When:** `/health/ready` reports `broker` unavailable, or publishing fails.

A broker outage is not data loss: business writes and their outbox rows commit
together, and the relay republishes pending rows when the broker returns.

1. Confirm the broker: `docker compose -f infra/docker-compose.yml ps rabbitmq`.
2. Restart it: `docker compose -f infra/docker-compose.yml restart rabbitmq`.
3. Watch the relay catch up: pending rows are those with `published_at is null`
   in each service's `outbox`.
4. Verify `x-attempt` is not climbing on any queue, and that no `.dlq` gained
   depth during the outage.
5. If a message was published but the service crashed before marking it
   published, the event is redelivered. Consumers dedupe through the inbox, so
   this is safe.

Do not delete outbox rows to "clear" a backlog.
