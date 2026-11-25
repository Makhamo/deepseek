'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList, Clock, CheckCircle2, AlertTriangle, Play, Pause, FlaskConical,
  Package, ChevronRight, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Priority = 'routine' | 'urgent' | 'stat';
type Status = 'awaiting' | 'on_hold' | 'in_progress' | 'collected' | 'ready';

type WorkItem = {
  id: string;
  patient: string;
  mrn: string;
  test: string;
  priority: Priority;
  received: string;
  status: Status;
  source: string;
  holdReason?: string;
  storage?: string;
};

const SEED: WorkItem[] = [
  { id: 'S-1042', patient: 'Thandi Ndlovu', mrn: 'MRN-88421', test: 'FBC + ESR', priority: 'routine', received: '08:12', status: 'awaiting', source: 'Dr. Naidoo' },
  { id: 'S-1043', patient: 'Johan van Wyk', mrn: 'MRN-77102', test: 'HbA1c', priority: 'urgent', received: '08:45', status: 'in_progress', source: 'Dr. Mokoena' },
  { id: 'S-1044', patient: 'Aisha Patel', mrn: 'MRN-55019', test: 'CRP + PCT', priority: 'stat', received: '09:02', status: 'awaiting', source: 'ED' },
  { id: 'S-1045', patient: 'Sipho Khumalo', mrn: 'MRN-33108', test: 'Lipid panel', priority: 'routine', received: '09:30', status: 'on_hold', source: 'Dr. Naidoo', holdReason: 'Awaiting fasting confirmation' },
  { id: 'S-1046', patient: 'Nomsa Dlamini', mrn: 'MRN-11880', test: 'TSH', priority: 'routine', received: '10:15', status: 'collected', source: 'Dr. Botha', storage: 'Fridge A-12' },
];

const STORAGES = ['Fridge A-12', 'Fridge B-03', 'Ambient rack 4', 'Cold room C', 'Microbiology bench'];

export default function LabQueuePage() {
  const router = useRouter();
  const [items, setItems] = useState(SEED);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [collecting, setCollecting] = useState<string | null>(null);
  const [storage, setStorage] = useState(STORAGES[0]);
  const [holdReason, setHoldReason] = useState('');

  const update = (id: string, patch: Partial<WorkItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const filtered = items.filter((i) => filter === 'all' || i.status === filter);

  const counts = {
    awaiting: items.filter((i) => i.status === 'awaiting').length,
    on_hold: items.filter((i) => i.status === 'on_hold').length,
    in_progress: items.filter((i) => i.status === 'in_progress').length,
    collected: items.filter((i) => i.status === 'collected').length,
  };

  const doCollect = (id: string) => {
    update(id, { status: 'collected', storage });
    setCollecting(null);
  };

  const doHold = (id: string) => {
    if (!holdReason.trim()) return;
    update(id, { status: 'on_hold', holdReason });
    setHoldReason('');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Work queue</h2>
        <p className="text-slate-500">Accession, collect, hold or start processing.</p>
      </div>

      {/* Status counts */}
      <div className="grid gap-3 sm:grid-cols-4">
        {([
          ['awaiting', 'Awaiting', counts.awaiting, 'bg-amber-50 text-amber-700'],
          ['on_hold', 'On hold', counts.on_hold, 'bg-slate-100 text-slate-700'],
          ['in_progress', 'In progress', counts.in_progress, 'bg-sky-50 text-sky-700'],
          ['collected', 'Collected', counts.collected, 'bg-emerald-50 text-emerald-700'],
        ] as const).map(([key, label, n, cls]) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? 'all' : key)}
            className={cn('rounded-xl border p-4 text-center transition', filter === key ? 'border-teal-500 ring-2 ring-teal-200' : 'border-slate-200', cls)}
          >
            <p className="text-2xl font-bold">{n}</p>
            <p className="text-xs">{label}</p>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start gap-4">
              <div className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                item.priority === 'stat' ? 'bg-rose-50 text-rose-600' :
                item.priority === 'urgent' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
              )}>
                <FlaskConical className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{item.id}</span>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                    item.priority === 'stat' ? 'bg-rose-100 text-rose-700' :
                    item.priority === 'urgent' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  )}>{item.priority}</span>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                    item.status === 'ready' || item.status === 'collected' ? 'bg-emerald-100 text-emerald-700' :
                    item.status === 'in_progress' ? 'bg-sky-100 text-sky-700' :
                    item.status === 'on_hold' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700'
                  )}>{item.status.replace('_', ' ')}</span>
                </div>
                <p className="mt-1 font-semibold text-slate-900">{item.patient} <span className="text-xs font-normal text-slate-400">{item.mrn}</span></p>
                <p className="text-sm text-slate-600">{item.test} · {item.source} · {item.received}</p>
                {item.holdReason && <p className="mt-1 text-xs text-amber-700">Hold: {item.holdReason}</p>}
                {item.storage && <p className="mt-1 text-xs text-teal-700">Stored: {item.storage}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              {(item.status === 'awaiting' || item.status === 'on_hold') && (
                <>
                  <button
                    onClick={() => { setCollecting(item.id); setStorage(STORAGES[0]); }}
                    className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                  >
                    <Package className="h-3.5 w-3.5" /> Collect
                  </button>
                  <button
                    onClick={() => update(item.id, { status: 'in_progress' })}
                    className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                  >
                    <Play className="h-3.5 w-3.5" /> Start process
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for hold?');
                      if (reason) update(item.id, { status: 'on_hold', holdReason: reason });
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                  >
                    <Pause className="h-3.5 w-3.5" /> Hold
                  </button>
                </>
              )}
              {item.status === 'in_progress' && (
                <button
                  onClick={() => update(item.id, { status: 'ready' })}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mark ready
                </button>
              )}
              {item.status === 'collected' && (
                <button
                  onClick={() => update(item.id, { status: 'in_progress' })}
                  className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  <Play className="h-3.5 w-3.5" /> Start process
                </button>
              )}
              <button
                onClick={() => router.push(`/lab/samples/${item.id}`)}
                className="ml-auto inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
              >
                Open <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Inline collect panel */}
            {collecting === item.id && (
              <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 p-4">
                <p className="text-sm font-medium text-teal-900">Select storage location</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {STORAGES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStorage(s)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-xs font-medium',
                        storage === s ? 'border-teal-500 bg-white text-teal-800' : 'border-teal-200 bg-white/60'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => doCollect(item.id)} className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white">
                    Confirm collection
                  </button>
                  <button onClick={() => setCollecting(null)} className="rounded-lg border border-teal-200 px-4 py-1.5 text-xs">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
