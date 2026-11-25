/**
 * nicu database schema.
 *
 * The backbone tables (outbox, inbox, held_event) are shared through
 * @uhs/service-kit. Service-owned tables are added here as modules are
 * implemented; every tenant table needs tenant_id and an RLS policy.
 */
export { heldEvent, inbox, outbox } from '@uhs/service-kit';
