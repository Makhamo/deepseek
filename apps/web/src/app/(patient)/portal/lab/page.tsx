'use client';

import { useState } from 'react';
import { FlaskConical, Download } from 'lucide-react';
import { SEED_RESULTS } from '@/lib/patient-data';

export default function TestResultsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const detail = SEED_RESULTS.find((r) => r.id === selected);
  const readyCount = SEED_RESULTS.filter((r) => r.status === 'ready').length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-medium text-teal-600">Diagnostics</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Your lab results</h2>
        <p className="mt-1 text-sm text-slate-500">
          Labs ordered by your clinicians, with results and the laboratory that released them.
        </p>
      </div>

      <div className="space-y-4">
        {SEED_RESULTS.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r.id)}
            className="block w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.code} · {r.specimen}</p>
                  <p className="text-xs text-slate-500">Ordered by {r.orderedBy}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                  r.status === 'ready' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {r.status === 'ready' ? 'Ready' : 'Processing'}
              </span>
            </div>

            <div className="mt-4 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-medium uppercase text-slate-400">Result</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{r.summary ?? 'Awaiting result'}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase text-slate-400">Reference range</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{r.range ?? '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase text-slate-400">Released</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{r.completed ?? 'Pending'}</p>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400">Ordered {r.ordered}{r.completed && ` · Collected ${r.completed}`}</p>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400">
        Showing your latest {SEED_RESULTS.length} tests ({readyCount} released). Preliminary values remain with the laboratory and ordering clinician until they are released.
      </p>

      {detail && detail.status === 'ready' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{detail.name}</h3>
                <p className="text-sm text-slate-500">Completed {detail.completed}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100">✕</button>
            </div>
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-medium">Summary</p>
              <p className="mt-1">{detail.summary}</p>
              <p className="mt-4 text-xs text-slate-500">
                Full report includes reference ranges and historical comparison. This is a demo view.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium">
                <Download className="h-4 w-4" /> Download PDF
              </button>
              <button onClick={() => setSelected(null)} className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}