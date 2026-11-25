'use client';

import { useState } from 'react';
import { Activity, CheckCircle2, AlertTriangle, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const RESULTS = [
  { id: 'R-881', patient: 'Thandi Ndlovu', test: 'Haemoglobin', value: '11.2', unit: 'g/dL', flag: 'low', status: 'preliminary', verified: false },
  { id: 'R-882', patient: 'Johan van Wyk', test: 'HbA1c', value: '7.8', unit: '%', flag: 'high', status: 'final', verified: true },
  { id: 'R-883', patient: 'Aisha Patel', test: 'CRP', value: '42', unit: 'mg/L', flag: 'critical', status: 'final', verified: true },
  { id: 'R-884', patient: 'Sipho Khumalo', test: 'LDL', value: '3.1', unit: 'mmol/L', flag: 'normal', status: 'preliminary', verified: false },
  { id: 'R-885', patient: 'Nomsa Dlamini', test: 'TSH', value: '2.4', unit: 'mIU/L', flag: 'normal', status: 'final', verified: true },
];

export default function LabTestsPage() {
  const [list, setList] = useState(RESULTS);
  const [selected, setSelected] = useState<string | null>(null);
  const detail = list.find((r) => r.id === selected);

  const verify = (id: string) => {
    setList((prev) => prev.map((r) => (r.id === id ? { ...r, verified: true, status: 'final' } : r)));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tests & results</h2>
        <p className="text-slate-500">Versioned results, verification and critical flags.</p>
      </div>

      <div className="space-y-2">
        {list.map((r) => (
          <button key={r.id} onClick={() => setSelected(r.id)} className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:shadow-md">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl',
              r.flag === 'critical' ? 'bg-rose-50 text-rose-600' :
              r.flag === 'high' || r.flag === 'low' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            )}>
              {r.flag === 'critical' ? <AlertTriangle className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{r.id}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
                  r.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                )}>{r.verified ? 'Verified' : 'Pending verify'}</span>
                {r.flag !== 'normal' && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700 capitalize">{r.flag}</span>}
              </div>
              <p className="mt-1 font-medium">{r.patient}</p>
              <p className="text-sm text-slate-600">{r.test}: <span className="font-semibold">{r.value}</span> {r.unit}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300" />
          </button>
        ))}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="font-semibold">{detail.test}</h3>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-4 p-5 text-sm">
              <p className="text-2xl font-bold">{detail.value} <span className="text-base font-normal text-slate-500">{detail.unit}</span></p>
              <p><span className="text-slate-400">Patient:</span> {detail.patient}</p>
              <p><span className="text-slate-400">Flag:</span> {detail.flag}</p>
              <p><span className="text-slate-400">Status:</span> {detail.status}</p>
              {!detail.verified && (
                <button onClick={() => verify(detail.id)} className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white">
                  Verify result
                </button>
              )}
              {detail.verified && <p className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Verified</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
