export type Status =
  | 'received'
  | 'clinical_check'
  | 'verified'
  | 'dispensing'
  | 'ready'
  | 'out_for_delivery'
  | 'collected'
  | 'delivered'
  | 'on_hold'
  | 'cancelled';

export type Fulfillment = 'collection' | 'delivery' | 'pending';

export type Rx = {
  id: string;
  patient: string;
  patientId: string;
  mrn: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  drug: string;
  strength: string;
  form: string;
  qty: string;
  sig: string;
  daysSupply: number;
  refills: number;
  doctor: string;
  doctorId: string;
  facility: string;
  date: string;
  priority: 'normal' | 'high' | 'urgent';
  status: Status;
  fulfillment: Fulfillment;
  allergies: string;
  interactions: string[];
  diagnosis?: string;
  description?: string;
  notes?: string;
  timeline: { at: string; by: string; action: string }[];
};

export const FLOW: Status[] = [
  'received',
  'clinical_check',
  'verified',
  'dispensing',
  'ready',
  'out_for_delivery',
  'collected',
  'delivered',
];

export const STATUS_META: Record<Status, { label: string; color: string; step: number }> = {
  received: { label: 'Received', color: 'bg-slate-100 text-slate-700', step: 0 },
  clinical_check: { label: 'Clinical check', color: 'bg-violet-50 text-violet-700', step: 1 },
  verified: { label: 'Verified', color: 'bg-sky-50 text-sky-700', step: 2 },
  dispensing: { label: 'Dispensing', color: 'bg-amber-50 text-amber-700', step: 3 },
  ready: { label: 'Ready for collection', color: 'bg-emerald-50 text-emerald-700', step: 4 },
  out_for_delivery: { label: 'Out for delivery', color: 'bg-blue-50 text-blue-700', step: 5 },
  collected: { label: 'Collected', color: 'bg-teal-50 text-teal-700', step: 6 },
  delivered: { label: 'Delivered', color: 'bg-teal-50 text-teal-700', step: 6 },
  on_hold: { label: 'On hold', color: 'bg-rose-50 text-rose-700', step: -1 },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-500', step: -1 },
};

export const RX_SEED: Rx[] = [
  {
    id: 'RX-4821',
    patient: 'Thandi Ndlovu',
    patientId: 'u5',
    mrn: 'MRN-88421',
    age: 34,
    phone: '+27 82 123 4567',
    email: 'thandi@example.com',
    address: '14 Maple Street, Sandton',
    drug: 'Amoxicillin',
    strength: '500 mg',
    form: 'Capsules',
    qty: '21',
    sig: '1 capsule three times daily for 7 days',
    description:
      'Broad-spectrum penicillin antibiotic for bacterial sinusitis. Take at regular intervals. Complete the full course even if symptoms improve.',
    daysSupply: 7,
    refills: 0,
    doctor: 'Dr. S. Naidoo',
    doctorId: 'u1',
    facility: 'Main Clinic',
    date: '2026-11-22 10:12',
    priority: 'normal',
    status: 'received',
    fulfillment: 'pending',
    allergies: 'Penicillin (mild rash) — review carefully',
    interactions: [],
    diagnosis: 'Acute bacterial sinusitis',
    timeline: [{ at: '2026-11-22 10:12', by: 'System', action: 'Prescription received from EHR' }],
  },
  {
    id: 'RX-4820',
    patient: 'Johan van Wyk',
    patientId: 'u6',
    mrn: 'MRN-77102',
    age: 58,
    phone: '+27 83 987 6543',
    email: 'johan@example.com',
    address: '3 Willow Close, Fourways',
    drug: 'Insulin glargine',
    strength: '100 U/mL',
    form: 'Pen',
    qty: '1',
    sig: '10 units subcutaneously at night',
    description:
      'Long-acting basal insulin (glargine). Inject subcutaneously at the same time each night. Store pens in refrigerator until first use.',
    daysSupply: 28,
    refills: 2,
    doctor: 'Dr. L. Mokoena',
    doctorId: 'u2',
    facility: 'Cardiology',
    date: '2026-11-22 09:55',
    priority: 'urgent',
    status: 'clinical_check',
    fulfillment: 'delivery',
    allergies: 'None known',
    interactions: ['May potentiate hypoglycaemia with concurrent beta-blockers'],
    diagnosis: 'Type 2 diabetes mellitus',
    timeline: [
      { at: '2026-11-22 09:55', by: 'System', action: 'Prescription received' },
      { at: '2026-11-22 10:01', by: 'Pharm. K. Botha', action: 'Moved to clinical check' },
    ],
  },
  {
    id: 'RX-4819',
    patient: 'Aisha Patel',
    patientId: 'u7',
    mrn: 'MRN-55019',
    age: 42,
    phone: '+27 71 222 3344',
    email: 'aisha@example.com',
    address: '8 Park Lane, Illovo',
    drug: 'Metformin',
    strength: '500 mg',
    form: 'Tablets',
    qty: '60',
    sig: '1 tablet twice daily with meals',
    description:
      'Biguanide antidiabetic. Take with food to reduce gastrointestinal side effects. Do not crush extended-release forms.',
    daysSupply: 30,
    refills: 3,
    doctor: 'Dr. S. Naidoo',
    doctorId: 'u1',
    facility: 'Main Clinic',
    date: '2026-11-22 09:40',
    priority: 'normal',
    status: 'verified',
    fulfillment: 'collection',
    allergies: 'None known',
    interactions: [],
    diagnosis: 'Type 2 diabetes mellitus',
    timeline: [
      { at: '2026-11-22 09:40', by: 'System', action: 'Prescription received' },
      { at: '2026-11-22 09:48', by: 'Pharm. K. Botha', action: 'Clinical check passed' },
      { at: '2026-11-22 09:52', by: 'Pharm. K. Botha', action: 'Verified' },
    ],
  },
  {
    id: 'RX-4815',
    patient: 'Sipho Khumalo',
    patientId: 'u9',
    mrn: 'MRN-33108',
    age: 51,
    phone: '+27 84 555 6677',
    email: 'sipho@example.com',
    address: '12 Oak Ave, Sandton',
    drug: 'Atorvastatin',
    strength: '20 mg',
    form: 'Tablets',
    qty: '30',
    sig: '1 tablet at night',
    description:
      'HMG-CoA reductase inhibitor for dyslipidaemia. Preferably taken in the evening. Avoid excessive grapefruit juice.',
    daysSupply: 30,
    refills: 5,
    doctor: 'Dr. S. Naidoo',
    doctorId: 'u1',
    facility: 'Main Clinic',
    date: '2026-11-21 16:20',
    priority: 'normal',
    status: 'ready',
    fulfillment: 'collection',
    allergies: 'None known',
    interactions: [],
    diagnosis: 'Hyperlipidaemia',
    timeline: [
      { at: '2026-11-21 16:20', by: 'System', action: 'Prescription received' },
      { at: '2026-11-21 16:35', by: 'Pharm. K. Botha', action: 'Verified & dispensed' },
      { at: '2026-11-21 16:42', by: 'Tech. M. Dlamini', action: 'Labelled – ready for collection' },
    ],
  },
  {
    id: 'RX-4810',
    patient: 'Lerato Molefe',
    patientId: 'u10',
    mrn: 'MRN-22991',
    age: 29,
    phone: '+27 72 111 2233',
    email: 'lerato@example.com',
    address: '45 Ridge Rd, Rosebank',
    drug: 'Paracetamol',
    strength: '500 mg',
    form: 'Tablets',
    qty: '20',
    sig: '1–2 tablets every 6 hours as needed',
    description: 'Analgesic / antipyretic. Maximum 4 g per day in adults. Caution in hepatic impairment.',
    daysSupply: 5,
    refills: 0,
    doctor: 'Dr. Botha',
    doctorId: 'u11',
    facility: 'Urgent Care',
    date: '2026-11-21 14:05',
    priority: 'normal',
    status: 'collected',
    fulfillment: 'collection',
    allergies: 'None known',
    interactions: [],
    diagnosis: 'Acute pain',
    timeline: [
      { at: '2026-11-21 14:05', by: 'System', action: 'Received' },
      { at: '2026-11-21 14:20', by: 'Pharm. K. Botha', action: 'Dispensed' },
      { at: '2026-11-21 15:10', by: 'Patient', action: 'Collected at counter' },
    ],
  },
  {
    id: 'RX-4802',
    patient: 'Nomsa Dlamini',
    patientId: 'u12',
    mrn: 'MRN-11880',
    age: 67,
    phone: '+27 76 333 4455',
    email: 'nomsa@example.com',
    address: '7 Cedar Close, Midrand',
    drug: 'Warfarin',
    strength: '5 mg',
    form: 'Tablets',
    qty: '28',
    sig: 'As directed by INR results',
    description:
      'Vitamin K antagonist anticoagulant. Dose adjusted according to INR. High-alert medication — counsel on bleeding risk and diet.',
    daysSupply: 28,
    refills: 0,
    doctor: 'Dr. L. Mokoena',
    doctorId: 'u2',
    facility: 'Cardiology',
    date: '2026-11-20 11:00',
    priority: 'high',
    status: 'on_hold',
    fulfillment: 'pending',
    allergies: 'None known',
    interactions: ['High bleeding risk – confirm latest INR'],
    notes: 'Awaiting INR result from lab before release',
    diagnosis: 'Atrial fibrillation',
    timeline: [
      { at: '2026-11-20 11:00', by: 'System', action: 'Received' },
      { at: '2026-11-20 11:15', by: 'Pharm. K. Botha', action: 'Placed on hold – INR pending' },
    ],
  },
];

export function nextStatus(s: Status, fulfillment: Fulfillment): Status | null {
  if (s === 'ready') {
    return fulfillment === 'delivery' ? 'out_for_delivery' : 'collected';
  }
  const i = FLOW.indexOf(s);
  if (i < 0 || i >= FLOW.length - 1) return null;
  return FLOW[i + 1];
}

export function getRxById(id: string): Rx | undefined {
  return RX_SEED.find((r) => r.id === id);
}
