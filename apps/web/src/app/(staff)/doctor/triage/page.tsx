'use client';

import { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock, User, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const TRIAGE = [
  { id: 'TRI-401', patient: 'Thandi Ndlovu', age: 34, symptoms: 'Fever, cough, mild SOB', severity: 4, priority: 'medium', time: '12 min ago', status: 'pending' },
  { id: 'TRI-400', patient: 'Johan van Wyk', age: 58, symptoms: 'Chest pain, dizziness', severity: 8, priority: 'high', time: '18 min ago', status: 'pending' },
  { id: 'TRI-398', patient: 'Aisha Patel', age: 42, symptoms: 'Wheeze, known asthma', severity: 5, priority: 'medium', time: '35 min ago', status: 'reviewed' },
  { id: 'TRI-395', patient: 'Sipho Khumalo', age: 51, symptoms: 'Headache, fatigue', severity: 2, priority: 'low', time: '1 h ago', status: 'completed' },
];

export default function DoctorTriagePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const detail = TRIAGE.find((t) => t.id === selected);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Triage queue</h2>
        <p className="text-slate-500">AI-assisted assessments awaiting clinician review.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
          <p className="text-2xl font-bold text-rose-700">{TRIAGE.filter(t => t.priority === 'high').length}</p>
          <p className="text-xs text-rose-600">High priority</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{TRIAGE.filter(t => t.priority === 'medium').length}</p>
          <p className="text-xs text-amber-600">Medium</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{TRIAGE.filter(t => t.status === 'pending').length}</p>
          <p className="text-xs text-slate-500">Pending review</p>
        </div>
      </div>

      <div className="space-y-3">
        {TRIAGE.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:shadow-md"
          >
            <div className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              t.priority === 'high' ? 'bg-rose-50 text-rose-600' :
              t.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
            )}>
              {t.priority === 'high' ? <AlertTriangle className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{t.id}</span>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                  t.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                  t.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                )}>{t.priority}</span>
                <span className="text-xs text-slate-400">{t.time}</span>
              </div>
              <p className="mt-1 font-semibold text-slate-900">{t.patient} · {t.age}y</p>
              <p className="text-sm text-slate-600">{t.symptoms}</p>
              <p className="mt-1 text-xs text-slate-500">Severity score: {t.severity}/10</p>
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
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                  detail.priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                )}>{detail.priority}</span>
                <h3 className="mt-2 text-lg font-bold">{detail.patient}</h3>
                <p className="text-sm text-slate-500">{detail.id} · {detail.age}y</p>
              </div>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <p><span className="text-slate-500">Symptoms:</span> {detail.symptoms}</p>
              <p><span className="text-slate-500">Severity:</span> {detail.severity}/10</p>
              <p><span className="text-slate-500">Submitted:</span> {detail.time}</p>
            </div>
            <div className="mt-6 flex gap-2">
              <button className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white">Accept & schedule</button>
              <button className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium">Request more info</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
