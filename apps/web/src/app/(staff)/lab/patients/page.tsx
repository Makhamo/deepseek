'use client';

import { Users, Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const PATIENTS = [
  { mrn: 'MRN-88421', name: 'Thandi Ndlovu', age: 34, samples: 3, last: '23 Nov' },
  { mrn: 'MRN-77102', name: 'Johan van Wyk', age: 58, samples: 5, last: '23 Nov' },
  { mrn: 'MRN-55019', name: 'Aisha Patel', age: 42, samples: 2, last: '23 Nov' },
  { mrn: 'MRN-33108', name: 'Sipho Khumalo', age: 51, samples: 4, last: '22 Nov' },
  { mrn: 'MRN-11880', name: 'Nomsa Dlamini', age: 67, samples: 1, last: '21 Nov' },
];

export default function LabPatientsPage() {
  const [q, setQ] = useState('');
  const filtered = PATIENTS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.mrn.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Patients</h2>
          <p className="text-slate-500">Patients with active or recent laboratory work.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm" />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((p) => (
          <div key={p.mrn} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-semibold text-sm">
              {p.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-slate-500">{p.mrn} · {p.age}y · {p.samples} samples · last {p.last}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
