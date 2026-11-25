'use client';

import { useState } from 'react';
import { Pill, Plus, Clock, CheckCircle2, Package, Truck, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const RX = [
  { id: 'RX-4821', patient: 'Thandi Ndlovu', drug: 'Amoxicillin 500 mg', qty: '21 caps', sig: '1 TDS × 7d', status: 'pending', date: '22 Nov 2026' },
  { id: 'RX-4820', patient: 'Johan van Wyk', drug: 'Insulin glargine', qty: '1 pen', sig: '10 U nocte', status: 'verified', date: '22 Nov 2026' },
  { id: 'RX-4819', patient: 'Aisha Patel', drug: 'Metformin 500 mg', qty: '60 tabs', sig: '1 BD', status: 'ready', date: '22 Nov 2026' },
  { id: 'RX-4815', patient: 'Sipho Khumalo', drug: 'Atorvastatin 20 mg', qty: '30 tabs', sig: '1 nocte', status: 'collected', date: '21 Nov 2026' },
];

export default function DoctorPrescriptionsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const detail = RX.find((r) => r.id === selected);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Prescriptions</h2>
          <p className="text-slate-500">Write and track prescriptions you have issued.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
          <Plus className="h-4 w-4" /> New prescription
        </button>
      </div>

      <div className="space-y-3">
        {RX.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r.id)}
            className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Pill className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{r.id}</span>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                  r.status === 'collected' ? 'bg-teal-50 text-teal-700' :
                  r.status === 'ready' ? 'bg-emerald-50 text-emerald-700' :
                  r.status === 'verified' ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-600'
                )}>{r.status}</span>
              </div>
              <p className="mt-1 font-semibold text-slate-900">{r.patient}</p>
              <p className="text-sm text-slate-600">{r.drug} · {r.qty}</p>
              <p className="text-xs text-slate-500">{r.sig}</p>
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
              <p className="font-medium">{detail.drug}</p>
              <p className="text-slate-600">{detail.qty} · {detail.sig}</p>
              <p className="text-slate-500">Issued {detail.date}</p>
              <p>Status: <span className="font-medium capitalize">{detail.status}</span></p>
            </div>
            <div className="mt-6 flex gap-2">
              <button className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm">Edit</button>
              <button className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white">Reprint</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
