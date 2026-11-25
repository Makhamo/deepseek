'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search, ChevronRight, AlertTriangle, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  RX_SEED,
  FLOW,
  STATUS_META,
  type Status,
} from '@/lib/pharmacy-rx';

export default function PrescriptionsListPage() {
  const [list] = useState(RX_SEED);
  const [filter, setFilter] = useState<string>('active');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    return list.filter((r) => {
      const matchQ =
        !q ||
        r.id.toLowerCase().includes(q.toLowerCase()) ||
        r.patient.toLowerCase().includes(q.toLowerCase()) ||
        r.drug.toLowerCase().includes(q.toLowerCase()) ||
        r.mrn.toLowerCase().includes(q.toLowerCase());
      if (!matchQ) return false;
      if (filter === 'all') return true;
      if (filter === 'active')
        return !['collected', 'delivered', 'cancelled'].includes(r.status);
      if (filter === 'urgent') return r.priority !== 'normal';
      if (filter === 'hold') return r.status === 'on_hold';
      if (filter === 'collection') return r.fulfillment === 'collection';
      if (filter === 'delivery') return r.fulfillment === 'delivery';
      if (FLOW.includes(filter as Status) || filter === 'on_hold' || filter === 'cancelled')
        return r.status === filter;
      return true;
    });
  }, [list, filter, q]);

  const counts = {
    active: list.filter((r) => !['collected', 'delivered', 'cancelled'].includes(r.status)).length,
    urgent: list.filter((r) => r.priority !== 'normal').length,
    hold: list.filter((r) => r.status === 'on_hold').length,
    collection: list.filter((r) => r.fulfillment === 'collection').length,
    delivery: list.filter((r) => r.fulfillment === 'delivery').length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Prescriptions</h2>
          <p className="text-slate-500">
            Full lifecycle — open a prescription for the advanced detail page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'active', label: 'Active', n: counts.active },
            { key: 'urgent', label: 'Urgent', n: counts.urgent },
            { key: 'hold', label: 'On hold', n: counts.hold },
            { key: 'collection', label: 'Collection', n: counts.collection },
            { key: 'delivery', label: 'Delivery', n: counts.delivery },
            { key: 'all', label: 'All', n: list.length },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                filter === f.key
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {f.label} ({f.n})
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {FLOW.map((s) => {
          const n = list.filter((r) => r.status === s).length;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                'rounded-xl border p-3 text-center transition',
                filter === s
                  ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <p className="text-lg font-bold text-slate-900">{n}</p>
              <p className="text-[10px] font-medium text-slate-500">{STATUS_META[s].label}</p>
            </button>
          );
        })}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ID, patient, drug, MRN…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-teal-500"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Rx / Patient</th>
              <th className="px-4 py-3 font-medium">Medication</th>
              <th className="px-4 py-3 font-medium">Directions</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => {
              const step = STATUS_META[r.status].step;
              return (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs text-slate-400">{r.id}</span>
                      {r.priority !== 'normal' && (
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                            r.priority === 'urgent'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          )}
                        >
                          {r.priority}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-slate-900">{r.patient}</p>
                    <p className="text-xs text-slate-500">{r.mrn}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {r.drug} {r.strength}
                    </p>
                    <p className="text-xs text-slate-500">
                      {r.form} · Qty {r.qty}
                    </p>
                  </td>
                  <td className="max-w-[200px] px-4 py-3">
                    <p className="truncate text-xs text-slate-600" title={r.sig}>
                      {r.sig}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-medium',
                        STATUS_META[r.status].color
                      )}
                    >
                      {STATUS_META[r.status].label}
                    </span>
                    {r.fulfillment !== 'pending' && (
                      <p className="mt-0.5 text-[10px] capitalize text-slate-400">{r.fulfillment}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {step >= 0 ? (
                      <div className="flex gap-0.5">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <span
                            key={i}
                            className={cn(
                              'h-1.5 w-4 rounded-full',
                              i <= step ? 'bg-teal-500' : 'bg-slate-200'
                            )}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-600">
                        <AlertTriangle className="h-3 w-3" /> Hold
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/pharmacy/prescriptions/${r.id}`}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                    >
                      Open <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                  No prescriptions match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
