'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FlaskConical, Clock, User, Package, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const SAMPLE = {
  id: 'S-1042',
  patient: 'Thandi Ndlovu',
  mrn: 'MRN-88421',
  dob: '1992-04-12',
  test: 'FBC + ESR',
  priority: 'routine',
  status: 'awaiting',
  source: 'Dr. S. Naidoo',
  received: '23 Nov 2026 08:12',
  type: 'EDTA blood',
  volume: '4 ml',
  storage: '—',
  notes: 'Patient fasting confirmed.',
  timeline: [
    { time: '08:12', event: 'Order received', by: 'System' },
    { time: '08:15', event: 'Accessioned', by: 'M. Dlamini' },
  ],
};

export default function SampleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-slate-400">{id}</p>
            <h2 className="text-xl font-bold text-slate-900">{SAMPLE.patient}</h2>
            <p className="text-sm text-slate-500">{SAMPLE.mrn} · DOB {SAMPLE.dob}</p>
          </div>
          <span className={cn(
            'rounded-full px-3 py-1 text-xs font-medium capitalize',
            SAMPLE.status === 'awaiting' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
          )}>{SAMPLE.status}</span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FlaskConical, label: 'Test', value: SAMPLE.test },
            { icon: User, label: 'Source', value: SAMPLE.source },
            { icon: Clock, label: 'Received', value: SAMPLE.received },
            { icon: Package, label: 'Storage', value: SAMPLE.storage },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Icon className="h-3.5 w-3.5" /> {f.label}
                </div>
                <p className="mt-1 text-sm font-medium text-slate-900">{f.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase text-slate-400">Notes</p>
          <p className="mt-1 text-sm text-slate-700">{SAMPLE.notes}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900">Timeline</h3>
        <ul className="mt-4 space-y-4">
          {SAMPLE.timeline.map((t, i) => (
            <li key={i} className="flex gap-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
              <div>
                <p className="text-sm font-medium">{t.event}</p>
                <p className="text-xs text-slate-500">{t.time} · {t.by}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <button className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white">Collect & store</button>
        <button className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white">Start process</button>
        <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium">Place on hold</button>
      </div>
    </div>
  );
}
