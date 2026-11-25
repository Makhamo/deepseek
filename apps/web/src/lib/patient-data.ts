// Shared patient-portal data. Replace with API calls when the backend is wired in.

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  facility: string;
  rating: number;
  nextAvailable: string;
  bio: string;
  slots: Record<string, string[]>; // date -> times
};

export const DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. S. Naidoo',
    specialty: 'General Practice',
    facility: 'Main Clinic',
    rating: 4.8,
    nextAvailable: 'Tomorrow 09:30',
    bio: 'Primary care physician focused on preventive care, hypertension and chronic disease management.',
    slots: {
      '2026-11-23': ['09:00', '09:30', '10:00', '11:00', '14:00', '14:30'],
      '2026-11-24': ['08:30', '09:00', '10:30', '13:00', '15:00'],
      '2026-11-25': ['09:30', '11:00', '14:00'],
    },
  },
  {
    id: 'd2',
    name: 'Dr. L. Mokoena',
    specialty: 'Cardiology',
    facility: 'Cardiology Suite',
    rating: 4.9,
    nextAvailable: '24 Nov 10:00',
    bio: 'Cardiologist with a special interest in heart health, blood pressure and diabetes-related care.',
    slots: {
      '2026-11-23': ['10:00', '10:30', '11:30'],
      '2026-11-24': ['09:00', '13:00', '15:30'],
      '2026-11-26': ['08:30', '11:00', '14:30'],
    },
  },
  {
    id: 'd3',
    name: 'Dr. Botha',
    specialty: 'Urgent Care',
    facility: 'Urgent Care',
    rating: 4.6,
    nextAvailable: 'Today 16:00',
    bio: 'Urgent care physician for same-day, non-life-threatening concerns.',
    slots: {
      '2026-11-22': ['16:00', '16:30'],
      '2026-11-23': ['08:30', '12:00', '16:00'],
      '2026-11-24': ['09:00', '13:30'],
    },
  },
];

export type Appt = {
  id: string;
  doctor: string;
  specialty: string;
  time: string;
  date: string; // e.g. "23 Nov 2026"
  type: 'In-person' | 'Video';
  reason: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  location: string;
  notes?: string;
};

export const SEED_APPOINTMENTS: Appt[] = [
  { id: '1', doctor: 'Dr. S. Naidoo', specialty: 'General Practice', time: '09:30', date: '23 Nov 2026', type: 'In-person', reason: 'Follow-up hypertension', status: 'confirmed', location: 'Main Clinic · Room 4' },
  { id: '2', doctor: 'Dr. L. Mokoena', specialty: 'Cardiology', time: '10:15', date: '24 Nov 2026', type: 'Video', reason: 'Diabetes review', status: 'confirmed', location: 'Video link will be sent' },
];

export type Medicine = {
  id: string;
  name: string;
  quantity: string;
  instructions: string;
  prescriber: string;
  issued: string;
  status: 'ready' | 'dispensed' | 'delivered' | 'processing';
  where: string;
};

export const SEED_MEDICINES: Medicine[] = [
  { id: '1', name: 'Amoxicillin 500 mg', quantity: '21 capsules', instructions: 'Take one capsule three times daily for 7 days. Complete the full course.', prescriber: 'Dr. S. Naidoo', issued: '19 Nov 2026', status: 'ready', where: 'Pharmacy A – Counter 2' },
  { id: '2', name: 'Atorvastatin 20 mg', quantity: '30 tablets', instructions: 'Take one tablet in the evening.', prescriber: 'Dr. L. Mokoena', issued: '18 Nov 2026', status: 'dispensed', where: 'Collected' },
  { id: '3', name: 'Paracetamol 500 mg', quantity: '20 tablets', instructions: 'Take one to two tablets every 6 hours when needed.', prescriber: 'Dr. S. Naidoo', issued: '15 Nov 2026', status: 'delivered', where: 'Home delivery' },
  { id: '4', name: 'Metformin 500 mg', quantity: '60 tablets', instructions: 'Take one tablet twice daily with meals.', prescriber: 'Dr. S. Naidoo', issued: '10 Nov 2026', status: 'processing', where: '—' },
];

export type LabResult = {
  id: string;
  name: string;
  code: string;
  specimen: string;
  orderedBy: string;
  ordered: string;
  completed: string | null;
  status: 'ready' | 'processing';
  summary: string | null;
  range: string | null;
};

export const SEED_RESULTS: LabResult[] = [
  { id: '1', name: 'Complete Blood Count (CBC)', code: 'CBC', specimen: 'Blood', orderedBy: 'Dr. S. Naidoo', ordered: '18 Nov 2026', completed: '19 Nov 2026', status: 'ready', summary: 'Within normal limits', range: 'See full report' },
  { id: '2', name: 'Lipid Panel', code: 'LIPID', specimen: 'Blood', orderedBy: 'Dr. S. Naidoo', ordered: '18 Nov 2026', completed: '20 Nov 2026', status: 'ready', summary: 'LDL slightly elevated', range: 'See full report' },
  { id: '3', name: 'HbA1c', code: 'HBA1C', specimen: 'Blood', orderedBy: 'Dr. L. Mokoena', ordered: '10 Nov 2026', completed: null, status: 'processing', summary: null, range: null },
  { id: '4', name: 'Thyroid Function (TSH)', code: 'TSH', specimen: 'Blood', orderedBy: 'Dr. S. Naidoo', ordered: '02 Oct 2026', completed: '03 Oct 2026', status: 'ready', summary: 'Normal', range: 'See full report' },
];

export type DocType = 'ID' | 'Medical Aid' | 'Referral' | 'Lab Result' | 'Other';

export type PatientDoc = {
  id: string;
  name: string;
  type: DocType;
  uploaded: string;
  status: 'approved' | 'pending' | 'rejected';
  size: string;
};

export const SEED_DOCUMENTS: PatientDoc[] = [
  { id: '1', name: 'National ID.pdf', type: 'ID', uploaded: '20 Nov 2026', status: 'approved', size: '1.2 MB' },
  { id: '2', name: 'Discovery medical aid card.jpg', type: 'Medical Aid', uploaded: '20 Nov 2026', status: 'approved', size: '840 KB' },
  { id: '3', name: 'Referral letter – Dr Naidoo.pdf', type: 'Referral', uploaded: '22 Nov 2026', status: 'pending', size: '320 KB' },
];

// Display-only summary for the "Your health" card on Home.
// Update from the patient's medical record once it is available from the API.
export const HEALTH_SUMMARY = {
  bloodType: 'Not recorded',
  allergies: 'None recorded',
  conditions: ['Hypertension', 'Diabetes'],
  emergencyContacts: 0,
};

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];