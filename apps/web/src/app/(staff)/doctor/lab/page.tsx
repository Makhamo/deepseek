'use client';

import { useState } from 'react';
import { FlaskConical, Plus, Clock, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const ORDERS = [
  { id: 'LAB-2201', patient: 'Thandi Ndlovu', tests: 'CBC, Lipid panel', ordered: '22 Nov 2026', status: 'resulted', summary: 'LDL slightly elevated' },
  { id: 'LAB-2200', patient: 'Johan van Wyk', tests: 'HbA1c, Renal function', ordered: '22 Nov 2026', status: 'processing', summary: null },
  { id: 'LAB-2198', patient: 'Nomsa Dlamini', tests: 'INR', ordered: '20 Nov 2026', status: 'resulted', summary: 'INR 2.4 – therapeutic' },
  { id: 'LAB-2195', patient: 'Aisha Patel', tests: 'IgE, Spirometry', ordered: '18 Nov 2026', status: 'resulted', summary: 'Normal' },
];

export default function DoctorLabOrdersPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const detail = ORDERS.find((o) => o.id === selected);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Lab orders</h2>
          <p className="text-slate-500">Order tests and review results.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
          <Plus className="h-4 w-4" /> New order
        </button>
      </div>

      <div className="space-y-3">
        {ORDERS.map((o) => (
          <button
            key={o.id}
            onClick={() => setSelected(o.id)}
            className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{o.id}</span>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  o.status === 'resulted' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                )}>{o.status}</span>
              </div>
              <p className="mt-1 font-semibold text-slate-900">{o.patient}</p>
              <p className="text-sm text-slate-600">{o.tests}</p>
              <p className="mt-1 text-xs text-slate-400">Ordered {o.ordered}</p>
              {o.summary && <p className="mt-1 text-sm text-slate-700">{o.summary}</p>}
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300" />
          </button>
        ))}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-slate-400">{detail.id}</p>
                <h3 className="text-lg font-bold">{detail.patient}</h3>
              </div>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="text-slate-500">Tests:</span> {detail.tests}</p>
              <p><span className="text-slate-500">Status:</span> {detail.status}</p>
              {detail.summary && <p className="rounded-lg bg-slate-50 p-3">{detail.summary}</p>}
            </div>
            <div className="mt-6 flex gap-2">
              <button className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white">Acknowledge</button>
              <button className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm">Download</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
