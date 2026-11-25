import type { SourceApplication } from './enums.js';

/**
 * The event catalogue (spec §9.9). One row per published event type, listing the
 * producer, the consumers and the aggregate key.
 */
export interface EventCatalogueEntry {
  readonly eventType: string;
  readonly producer: string;
  readonly consumers: readonly string[];
  readonly aggregateKey: string;
}

export const EVENT_CATALOGUE: readonly EventCatalogueEntry[] = [
  { eventType: 'registry.patient.created', producer: 'core', consumers: ['*'], aggregateKey: 'patient_id' },
  { eventType: 'registry.patient.updated', producer: 'core', consumers: ['*'], aggregateKey: 'patient_id' },
  { eventType: 'registry.patient.merged', producer: 'core', consumers: ['*'], aggregateKey: 'patient_id' },
  { eventType: 'registry.infant.registered', producer: 'core', consumers: ['nicu', 'lab'], aggregateKey: 'patient_id' },
  { eventType: 'registry.consent.changed', producer: 'core', consumers: ['doctor', 'lab', 'pharmacy', 'nicu', 'claims'], aggregateKey: 'patient_id' },
  { eventType: 'auth.role.changed', producer: 'auth', consumers: ['*'], aggregateKey: 'tenant_id' },
  { eventType: 'auth.membership.changed', producer: 'auth', consumers: ['*', 'notifications'], aggregateKey: 'tenant_id' },
  { eventType: 'tenant.config.changed', producer: 'core', consumers: ['*'], aggregateKey: 'tenant_id' },
  { eventType: 'refdata.changed', producer: 'core', consumers: ['*'], aggregateKey: 'code_system' },
  { eventType: 'integration.ack', producer: 'any', consumers: ['core'], aggregateKey: 'event_id' },
  { eventType: 'pm.encounter.opened', producer: 'doctor', consumers: ['triage'], aggregateKey: 'encounter_id' },
  { eventType: 'pm.encounter.updated', producer: 'doctor', consumers: ['triage'], aggregateKey: 'encounter_id' },
  { eventType: 'pm.encounter.closed', producer: 'doctor', consumers: ['triage'], aggregateKey: 'encounter_id' },
  { eventType: 'pm.laborder.created', producer: 'doctor', consumers: ['lab'], aggregateKey: 'lab_order_id' },
  { eventType: 'pm.laborder.authorized', producer: 'doctor', consumers: ['lab'], aggregateKey: 'lab_order_id' },
  { eventType: 'pm.laborder.updated', producer: 'doctor', consumers: ['lab'], aggregateKey: 'lab_order_id' },
  { eventType: 'pm.laborder.cancelled', producer: 'doctor', consumers: ['lab'], aggregateKey: 'lab_order_id' },
  { eventType: 'pm.service.claimable', producer: 'doctor', consumers: ['claims'], aggregateKey: 'service_id' },
  { eventType: 'tri.assessment.saved', producer: 'triage', consumers: ['doctor', 'pharmacy'], aggregateKey: 'assessment_id' },
  { eventType: 'tri.assessment.completed', producer: 'triage', consumers: ['doctor', 'pharmacy'], aggregateKey: 'assessment_id' },
  { eventType: 'tri.assessment.cancelled', producer: 'triage', consumers: ['doctor', 'pharmacy'], aggregateKey: 'assessment_id' },
  { eventType: 'tri.assessment.amended', producer: 'triage', consumers: ['doctor', 'pharmacy'], aggregateKey: 'assessment_id' },
  { eventType: 'tri.patient.ready_for_review', producer: 'triage', consumers: ['pharmacy'], aggregateKey: 'assessment_id' },
  { eventType: 'ph.workflow.status_changed', producer: 'pharmacy', consumers: ['triage'], aggregateKey: 'prescription_id' },
  { eventType: 'ph.laborder.created', producer: 'pharmacy', consumers: ['lab'], aggregateKey: 'lab_order_id' },
  { eventType: 'ph.laborder.cancelled', producer: 'pharmacy', consumers: ['lab'], aggregateKey: 'lab_order_id' },
  { eventType: 'ph.prescription.issued', producer: 'pharmacy', consumers: ['notifications', 'audit'], aggregateKey: 'prescription_id' },
  { eventType: 'ph.prescription.cancelled', producer: 'pharmacy', consumers: ['notifications', 'audit'], aggregateKey: 'prescription_id' },
  { eventType: 'ph.dispensing.completed', producer: 'pharmacy', consumers: ['notifications', 'audit'], aggregateKey: 'prescription_id' },
  { eventType: 'ph.dispensing.returned', producer: 'pharmacy', consumers: ['notifications', 'audit'], aggregateKey: 'prescription_id' },
  { eventType: 'ph.dispensing.voided', producer: 'pharmacy', consumers: ['notifications', 'audit'], aggregateKey: 'prescription_id' },
  { eventType: 'ph.dispensing.claimable', producer: 'pharmacy', consumers: ['claims'], aggregateKey: 'dispensing_id' },
  { eventType: 'ph.dispensing.reversed', producer: 'pharmacy', consumers: ['claims'], aggregateKey: 'dispensing_id' },
  { eventType: 'nicu.admission.opened', producer: 'nicu', consumers: ['lab', 'claims'], aggregateKey: 'nicu_admission_id' },
  { eventType: 'nicu.admission.closed', producer: 'nicu', consumers: ['lab', 'claims'], aggregateKey: 'nicu_admission_id' },
  { eventType: 'nicu.admission.claim_milestone', producer: 'nicu', consumers: ['claims'], aggregateKey: 'nicu_admission_id' },
  { eventType: 'nicu.service.claimable', producer: 'nicu', consumers: ['claims'], aggregateKey: 'nicu_admission_id' },
  { eventType: 'nicu.laborder.created', producer: 'nicu', consumers: ['lab'], aggregateKey: 'lab_order_id' },
  { eventType: 'nicu.laborder.updated', producer: 'nicu', consumers: ['lab'], aggregateKey: 'lab_order_id' },
  { eventType: 'nicu.laborder.cancelled', producer: 'nicu', consumers: ['lab'], aggregateKey: 'lab_order_id' },
  { eventType: 'lab.specimen.status_changed', producer: 'lab', consumers: ['doctor', 'pharmacy', 'nicu'], aggregateKey: 'lab_order_id' },
  { eventType: 'lab.test.status_changed', producer: 'lab', consumers: ['doctor', 'pharmacy', 'nicu'], aggregateKey: 'lab_order_id' },
  { eventType: 'lab.result.verified', producer: 'lab', consumers: ['doctor', 'pharmacy', 'nicu'], aggregateKey: 'result_id' },
  { eventType: 'lab.result.amended', producer: 'lab', consumers: ['doctor', 'pharmacy', 'nicu'], aggregateKey: 'result_id' },
  { eventType: 'lab.result.cancelled', producer: 'lab', consumers: ['doctor', 'pharmacy', 'nicu'], aggregateKey: 'result_id' },
  { eventType: 'lab.result.critical_detected', producer: 'lab', consumers: ['doctor', 'pharmacy', 'nicu'], aggregateKey: 'result_id' },
  { eventType: 'clm.claim.created', producer: 'claims', consumers: ['doctor', 'pharmacy', 'nicu'], aggregateKey: 'claim_id' },
  { eventType: 'clm.claim.submitted', producer: 'claims', consumers: ['doctor', 'pharmacy', 'nicu'], aggregateKey: 'claim_id' },
  { eventType: 'clm.claim.status_changed', producer: 'claims', consumers: ['doctor', 'pharmacy', 'nicu'], aggregateKey: 'claim_id' },
  { eventType: 'clm.claim.adjusted', producer: 'claims', consumers: ['doctor', 'pharmacy', 'nicu'], aggregateKey: 'claim_id' },
  { eventType: 'clm.claim.reversed', producer: 'claims', consumers: ['doctor', 'pharmacy', 'nicu'], aggregateKey: 'claim_id' },
];

export const TOPIC_EXCHANGE = 'uhs.events';
export const DEAD_LETTER_EXCHANGE = 'uhs.dlx';

/** lab.* and clm.* events are routed per originating application (spec §9.2). */
const APPLICATION_ROUTED_PREFIXES = ['lab.', 'clm.'] as const;

export function routingKeyFor(eventType: string, sourceApplication?: SourceApplication | null): string {
  const routed = APPLICATION_ROUTED_PREFIXES.some((prefix) => eventType.startsWith(prefix));
  return routed && sourceApplication ? `${eventType}.${sourceApplication}` : eventType;
}

/** Whether an event type is in the published catalogue. */
export function isCataloguedEvent(eventType: string): boolean {
  return EVENT_CATALOGUE.some((entry) => entry.eventType === eventType);
}
