'use client';

import { useState } from 'react';
import { FlaskConical, Search, CheckCircle2, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const SAMPLES = [
  { id: 'SP-2201', patient: 'Thandi Ndlovu', type: 'EDTA blood', tests: 'FBC, ESR', collected: '23 Nov 08:10', status: 'processing', location: 'Haematology' },
  { id: 'SP-2202', patient: 'Johan van Wyk', type: 'SST serum', tests: 'HbA1c, Lipids', collected: '23 Nov 08:40', status: 'received', location: 'Chemistry' },
  { id: 'SP-2203', patient: 'Aisha Patel', type: 'EDTA + SST', tests: 'CRP, PCT', collected: '23 Nov 09:00', status: 'collected', location: 'ED phlebotomy' },
  { id: 'SP-2204', patient: 'Sipho Khumalo', type: 'Urine', tests: 'MCS', collected: '22 Nov 16:20', status: 'completed', location: 'Microbiology' },
];

export default function LabSamplesPage() {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = SAMPLES.filter((s) => s.patient.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase()));
  const detail = SAMPLES.find((s) => s.id === selected);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Samples</h2>
          <p className="text-slate-500">Specimen tracking from collection to result.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient or ID…" className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm" />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((s) => (
          <button key={s.id} onClick={() => setSelected(s.id)} className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{s.id}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                  s.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  s.status === 'processing' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'
                )}>{s.status}</span>
              </div>
              <p className="mt-1 font-medium">{s.patient}</p>
              <p className="text-sm text-slate-600">{s.type} · {s.tests}</p>
            </div>
            <span className="text-xs text-slate-400">{s.location}</span>
          </button>
        ))}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="w-full max-w-md bg-white p-5 shadow-2xl">
            <div className="flex justify-between">
              <h3 className="font-semibold">{detail.id}</h3>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <p><span className="text-slate-400">Patient:</span> {detail.patient}</p>
              <p><span className="text-slate-400">Type:</span> {detail.type}</p>
              <p><span className="text-slate-400">Tests:</span> {detail.tests}</p>
              <p><span className="text-slate-400">Collected:</span> {detail.collected}</p>
              <p><span className="text-slate-400">Location:</span> {detail.location}</p>
              <p><span className="text-slate-400">Status:</span> {detail.status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
