'use client';

import { useState } from 'react';
import { Package, CheckCircle2, Scan, AlertTriangle, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Item = {
  id: string;
  patient: string;
  drug: string;
  qty: string;
  location: string;
  sig: string;
  description: string;
  warnings?: string;
  status: 'queued' | 'picking' | 'labelled' | 'ready';
};

const INITIAL: Item[] = [
  {
    id: 'RX-4819',
    patient: 'Aisha Patel',
    drug: 'Metformin 500 mg × 60',
    qty: '60 tabs',
    location: 'Shelf B-12',
    sig: '1 tablet twice daily with meals',
    description: 'Take with food to reduce stomach upset. Do not crush extended-release tablets.',
    status: 'queued',
  },
  {
    id: 'RX-4820',
    patient: 'Johan van Wyk',
    drug: 'Insulin glargine 100 U/mL',
    qty: '1 pen',
    location: 'Fridge F-2',
    sig: '10 units subcutaneously at night',
    description: 'Long-acting insulin. Inject at the same time each night. Keep refrigerated until first use.',
    warnings: 'High-alert medication — double-check dose',
    status: 'queued',
  },
  {
    id: 'RX-4815',
    patient: 'Sipho Khumalo',
    drug: 'Atorvastatin 20 mg × 30',
    qty: '30 tabs',
    location: 'Shelf A-04',
    sig: '1 tablet at night',
    description: 'Preferably taken in the evening. Avoid grapefruit juice.',
    status: 'picking',
  },
  {
    id: 'RX-4808',
    patient: 'Nomsa Dlamini',
    drug: 'Omeprazole 20 mg × 28',
    qty: '28 caps',
    location: 'Shelf C-08',
    sig: '1 capsule daily before breakfast',
    description: 'Swallow whole before meals. Do not crush or chew.',
    status: 'labelled',
  },
];

const STEPS = ['queued', 'picking', 'labelled', 'ready'] as const;

export default function DispensingPage() {
  const [items, setItems] = useState(INITIAL);
  const [active, setActive] = useState<string | null>(null);

  const advance = (id: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const idx = STEPS.indexOf(i.status);
        if (idx < STEPS.length - 1) return { ...i, status: STEPS[idx + 1] };
        return i;
      })
    );
  };

  const current = items.find((i) => i.id === active);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dispensing</h2>
        <p className="text-slate-500">
          Pick → label (with directions) → ready for collection / delivery.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">
              {items.filter((i) => i.status === s).length}
            </p>
            <p className="text-xs capitalize text-slate-500">{s}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Package className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{item.id}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                    item.status === 'ready'
                      ? 'bg-emerald-50 text-emerald-700'
                      : item.status === 'labelled'
                        ? 'bg-sky-50 text-sky-700'
                        : item.status === 'picking'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {item.status}
                </span>
                {item.warnings && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                    <AlertTriangle className="h-3 w-3" /> Alert
                  </span>
                )}
              </div>
              <p className="font-medium text-slate-900">{item.patient}</p>
              <p className="text-sm text-slate-500">
                {item.drug} · {item.location}
              </p>
              <p className="mt-0.5 text-xs text-teal-700">
                <FileText className="mr-1 inline h-3 w-3" />
                {item.sig}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActive(item.id)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
              >
                Details
              </button>
              {item.status !== 'ready' && (
                <button
                  onClick={() => advance(item.id)}
                  className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
                >
                  {item.status === 'queued'
                    ? 'Start pick'
                    : item.status === 'picking'
                      ? 'Labelled'
                      : 'Mark ready'}
                </button>
              )}
              {item.status === 'ready' && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Ready
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Dispense {current.id}</h3>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                <span className="text-slate-500">Patient:</span> {current.patient}
              </p>
              <p>
                <span className="text-slate-500">Drug:</span> {current.drug}
              </p>
              <p>
                <span className="text-slate-500">Qty / location:</span> {current.qty} ·{' '}
                {current.location}
              </p>
              <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
                  Directions (SIG)
                </p>
                <p className="mt-1 font-medium text-slate-900">{current.sig}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{current.description}</p>
              </div>
              {current.warnings && (
                <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {current.warnings}
                </div>
              )}
              <p>
                <span className="text-slate-500">Status:</span>{' '}
                <span className="font-medium capitalize">{current.status}</span>
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              <Scan className="h-5 w-5" /> Scan barcode to confirm product
            </div>
            <button
              onClick={() => {
                advance(current.id);
                setActive(null);
              }}
              className="mt-4 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Advance step
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
