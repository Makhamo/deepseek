'use client';

import { useState } from 'react';
import { Users, Search, Pill, Phone, Mail } from 'lucide-react';

const PATIENTS = [
  { id: '1', name: 'Thandi Ndlovu', mrn: 'MRN-88421', phone: '+27 82 123 4567', email: 'thandi@example.com', lastRx: 'Amoxicillin 500 mg', lastDate: '22 Nov 2026', activeRx: 2 },
  { id: '2', name: 'Johan van Wyk', mrn: 'MRN-77102', phone: '+27 83 987 6543', email: 'johan@example.com', lastRx: 'Insulin glargine', lastDate: '22 Nov 2026', activeRx: 1 },
  { id: '3', name: 'Aisha Patel', mrn: 'MRN-55019', phone: '+27 71 222 3344', email: 'aisha@example.com', lastRx: 'Metformin 500 mg', lastDate: '22 Nov 2026', activeRx: 3 },
  { id: '4', name: 'Sipho Khumalo', mrn: 'MRN-33108', phone: '+27 84 555 6677', email: 'sipho@example.com', lastRx: 'Atorvastatin 20 mg', lastDate: '21 Nov 2026', activeRx: 1 },
  { id: '5', name: 'Lerato Molefe', mrn: 'MRN-22991', phone: '+27 72 111 2233', email: 'lerato@example.com', lastRx: 'Paracetamol 500 mg', lastDate: '21 Nov 2026', activeRx: 0 },
];

export default function PharmacyPatientsPage() {
  const [q, setQ] = useState('');
  const filtered = PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.mrn.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Patients</h2>
        <p className="text-slate-500">Patients with active or recent prescriptions at this pharmacy.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or MRN…"
          className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-teal-500"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                {p.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-500">{p.mrn}</p>
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {p.phone}</p>
                  <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> {p.email}</p>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Pill className="h-4 w-4 text-amber-500" />
                  <span className="text-slate-700">{p.lastRx}</span>
                  <span className="text-xs text-slate-400">· {p.lastDate}</span>
                </div>
                {p.activeRx > 0 && (
                  <span className="mt-2 inline-block rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                    {p.activeRx} active Rx
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
