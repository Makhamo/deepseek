'use client';

import { useState } from 'react';
import { Pill, MapPin, CheckCircle2, Truck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEED_MEDICINES, type Medicine } from '@/lib/patient-data';

const STATUS_LABEL: Record<Medicine['status'], string> = {
  ready: 'Ready',
  dispensed: 'Dispensed',
  delivered: 'Delivered',
  processing: 'Processing',
};

const STATUS_TONE: Record<Medicine['status'], string> = {
  ready: 'bg-amber-50 text-amber-700',
  dispensed: 'bg-emerald-50 text-emerald-700',
  delivered: 'bg-sky-50 text-sky-700',
  processing: 'bg-slate-100 text-slate-600',
};

function WhereIcon({ status }: { status: Medicine['status'] }) {
  if (status === 'dispensed') return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (status === 'delivered') return <Truck className="h-3.5 w-3.5" />;
  if (status === 'processing') return <Clock className="h-3.5 w-3.5" />;
  return <MapPin className="h-3.5 w-3.5" />;
}

export default function MedicinesPage() {
  const [meds, setMeds] = useState<Medicine[]>(SEED_MEDICINES);

  const confirmPickup = (id: string) =>
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'dispensed', where: 'Collected' } : m)));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-medium text-teal-600">Medications</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Your medicines</h2>
        <p className="mt-1 text-sm text-slate-500">{meds.length} prescriptions on file.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {meds.map((m) => (
          <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.quantity}</p>
                </div>
              </div>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium uppercase', STATUS_TONE[m.status])}>
                {STATUS_LABEL[m.status]}
              </span>
            </div>

            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{m.instructions}</p>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-400">Prescribed by</dt>
                <dd className="font-medium text-slate-900">{m.prescriber}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Issued</dt>
                <dd className="font-medium text-slate-900">{m.issued}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Status</dt>
                <dd className="font-medium text-slate-900">{STATUS_LABEL[m.status]}</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase text-slate-400">Pharmacy</p>
                <p className="flex items-center gap-1 text-xs font-medium text-slate-800">
                  <WhereIcon status={m.status} /> {m.where}
                </p>
              </div>
              {m.status === 'ready' && (
                <button
                  onClick={() => confirmPickup(m.id)}
                  className="shrink-0 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Confirm pickup
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Medication safety</p>
        <p className="mt-1 text-xs text-slate-500">
          Always take medication exactly as prescribed. If you notice a severe reaction, seek urgent care.
        </p>
      </section>
    </div>
  );
}