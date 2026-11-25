# Resolve a held event

**When:** a held event appears on the integration worklist.

A held event could not be safely associated with a local record — an unmatched
patient or encounter, an inactive tenant relationship, an unmapped code or an
identity mismatch. Nothing was written, and the message was acknowledged: it will
not retry by itself.

1. Read `held_event` in the consumer's database: `reason_code`, `detail` and the
   stored envelope.
2. Resolve the underlying cause:
   - `ENCOUNTER_PATIENT_MISMATCH` / `IDENTITY_MISMATCH` — correct the link in the
     source application.
   - `RELATIONSHIP_INACTIVE` — activate the tenant relationship in core.
   - `CODE_UNMAPPED` — add the mapping to `refdata.code_map`.
3. Release with `POST /v1/ledger/holds/{event_id}/release`, or reject with
   `POST /v1/ledger/holds/{event_id}/reject` and a reason.
4. Confirm the integration outcome in the ledger.

Releasing reprocesses the event through the normal handler, so idempotency
applies.
