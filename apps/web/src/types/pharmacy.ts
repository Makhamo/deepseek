export type RxStatus =
  | "received"
  | "clinical_check"
  | "verified"
  | "dispensing"
  | "ready"
  | "out_for_delivery"
  | "collected"
  | "delivered"
  | "on_hold"
  | "cancelled";

export type FulfillmentMethod = "collection" | "delivery";

export type Priority = "normal" | "high" | "urgent";

export interface Person {
  id: string;
  name: string;
  role: "patient" | "doctor" | "pharmacist" | "nurse" | "admin";
  mrn?: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

export interface Medication {
  name: string;
  strength: string;
  form: string;
  quantity: number;
  unit: string;
  directions: string;
  daysSupply: number;
  refills: number;
  ndc?: string;
}

export interface TimelineEvent {
  id: string;
  status: RxStatus;
  label: string;
  at: string;
  by: string;
  note?: string;
}

export interface Prescription {
  id: string;
  rxNumber: string;
  status: RxStatus;
  priority: Priority;
  fulfillment: FulfillmentMethod;
  patient: Person;
  prescriber: Person;
  medication: Medication;
  diagnosis?: string;
  allergies: string[];
  interactions: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  readyAt?: string;
  collectedAt?: string;
  deliveredAt?: string;
  deliveryAddress?: string;
  deliveryDriver?: string;
  deliveryEta?: string;
  timeline: TimelineEvent[];
  clinicalChecklist: { id: string; label: string; done: boolean }[];
  barcode?: string;
}

export const STATUS_FLOW: RxStatus[] = [
  "received",
  "clinical_check",
  "verified",
  "dispensing",
  "ready",
  "out_for_delivery",
  "collected",
  "delivered",
];

export const STATUS_LABELS: Record<RxStatus, string> = {
  received: "Received",
  clinical_check: "Clinical check",
  verified: "Verified",
  dispensing: "Dispensing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  collected: "Collected",
  delivered: "Delivered",
  on_hold: "On hold",
  cancelled: "Cancelled",
};
