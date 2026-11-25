'use client';

import { useState } from 'react';
import { Stethoscope, User, Clock, FileText, Plus, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ENCOUNTERS = [
  { id: 'ENC-1001', patient: 'Thandi Ndlovu', mrn: 'MRN-88421', date: '22 Nov 2026', type: 'Follow-up', status: 'in-progress', diagnosis: 'Hypertension – controlled', notes: 'BP 128/82. Continue current meds.' },
  { id: 'ENC-1000', patient: 'Johan van Wyk', mrn: 'MRN-77102', date: '22 Nov 2026', type: 'Review', status: 'completed', diagnosis: 'Type 2 DM', notes: 'HbA1c pending. Adjust metformin if needed.' },
  { id: 'ENC-0998', patient: 'Aisha Patel', mrn: 'MRN-55019', date: '20 Nov 2026', type: 'New', status: 'completed', diagnosis: 'Asthma – mild', notes: 'Started on inhaled corticosteroid.' },
  { id: 'ENC-0995', patient: 'Sipho Khumalo', mrn: 'MRN-33108', date: '18 Nov 2026', type: 'Follow-up', status: 'completed', diagnosis: 'Hyperlipidaemia', notes: 'Atorvastatin 20 mg continued.' },
];

export default function DoctorEncountersPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const detail = ENCOUNTERS.find((e) => e.id === selected);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Encounters</h2>
          <p className="text-slate-500">Clinical visits, notes and diagnoses.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
          <Plus className="h-4 w-4" /> New encounter
        </button>
      </div>

      <div className="space-y-3">
        {ENCOUNTERS.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelected(e.id)}
            className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{e.id}</span>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  e.status === 'in-progress' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                )}>{e.status}</span>
              </div>
              <p className="mt-1 font-semibold text-slate-900">{e.patient}</p>
              <p className="text-sm text-slate-600">{e.type} · {e.diagnosis}</p>
              <p className="mt-1 text-xs text-slate-400">{e.date}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300" />
          </button>
        ))}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="font-mono text-xs text-slate-400">{detail.id}</p>
                <h3 className="font-semibold text-slate-900">{detail.patient}</h3>
              </div>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Type</p>
                  <p className="font-medium">{detail.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Date</p>
                  <p className="font-medium">{detail.date}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Diagnosis</p>
                  <p className="font-medium">{detail.diagnosis}</p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">Clinical notes</p>
                <p className="text-sm text-slate-700">{detail.notes}</p>
              </div>
              <div className="pt-2 space-y-2">
                <a href="/doctor/lab" className="block rounded-xl border border-slate-200 py-2.5 text-center text-sm font-medium">Order labs</a>
                <a href="/doctor/prescriptions" className="block rounded-xl border border-slate-200 py-2.5 text-center text-sm font-medium">Write prescription</a>
                {detail.status === 'in-progress' && (
                  <button className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white">Complete encounter</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
