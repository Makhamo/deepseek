'use client';

import { FileText, Download, CheckCircle2, Clock, Filter } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const REPORTS = [
  { id: 'REP-301', patient: 'Thandi Ndlovu', type: 'FBC report', date: '23 Nov 2026', status: 'released', by: 'M. Dlamini', tests: 6 },
  { id: 'REP-302', patient: 'Johan van Wyk', type: 'HbA1c report', date: '23 Nov 2026', status: 'released', by: 'M. Dlamini', tests: 1 },
  { id: 'REP-303', patient: 'Aisha Patel', type: 'Critical CRP alert', date: '23 Nov 2026', status: 'pending', by: '—', tests: 2 },
  { id: 'REP-304', patient: 'Sipho Khumalo', type: 'Lipid panel', date: '22 Nov 2026', status: 'released', by: 'J. Botha', tests: 4 },
  { id: 'REP-305', patient: 'Nomsa Dlamini', type: 'Thyroid panel', date: '22 Nov 2026', status: 'released', by: 'M. Dlamini', tests: 3 },
  { id: 'REP-306', patient: 'Peter Mahlangu', type: 'U&E + LFT', date: '21 Nov 2026', status: 'amended', by: 'J. Botha', tests: 8 },
];

const BY_DAY = [
  { day: 'Mon', released: 18, pending: 4 },
  { day: 'Tue', released: 22, pending: 3 },
  { day: 'Wed', released: 15, pending: 5 },
  { day: 'Thu', released: 24, pending: 2 },
  { day: 'Fri', released: 20, pending: 6 },
];

export default function LabReportsPage() {
  const [filter, setFilter] = useState<'all' | 'released' | 'pending'>('all');
  const filtered = REPORTS.filter((r) => filter === 'all' || r.status === filter);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
          <p className="text-slate-500">Released, pending and amended laboratory reports.</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {(['all', 'released', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn('rounded-md px-3 py-1 text-sm font-medium capitalize', filter === f ? 'bg-white shadow-sm' : 'text-slate-600')}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-semibold">Reports by day</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BY_DAY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="released" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Tests</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">By</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                <td className="px-4 py-3 font-medium">{r.patient}</td>
                <td className="px-4 py-3 text-slate-600">{r.type}</td>
                <td className="px-4 py-3">{r.tests}</td>
                <td className="px-4 py-3 text-slate-500">{r.date}</td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                    r.status === 'released' ? 'bg-emerald-100 text-emerald-700' :
                    r.status === 'amended' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'
                  )}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">{r.by}</td>
                <td className="px-4 py-3">
                  {r.status !== 'pending' && (
                    <button className="rounded p-1 hover:bg-slate-100"><Download className="h-4 w-4 text-slate-400" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
