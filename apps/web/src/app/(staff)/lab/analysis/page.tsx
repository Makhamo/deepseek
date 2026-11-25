'use client';

import { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { cn } from '@/lib/utils';

const BY_TEST = [
  { name: 'FBC', count: 48, critical: 1 },
  { name: 'HbA1c', count: 22, critical: 0 },
  { name: 'CRP', count: 18, critical: 3 },
  { name: 'Lipids', count: 15, critical: 0 },
  { name: 'TSH', count: 12, critical: 0 },
  { name: 'U&E', count: 31, critical: 2 },
];

const BY_HOUR = [
  { h: '07', v: 4 }, { h: '08', v: 12 }, { h: '09', v: 18 }, { h: '10', v: 15 },
  { h: '11', v: 9 }, { h: '12', v: 6 }, { h: '13', v: 8 }, { h: '14', v: 14 },
  { h: '15', v: 11 }, { h: '16', v: 7 },
];

const QUALITY = [
  { month: 'Jul', onTime: 92, amended: 1.2, criticalAck: 98 },
  { month: 'Aug', onTime: 94, amended: 0.9, criticalAck: 99 },
  { month: 'Sep', onTime: 91, amended: 1.4, criticalAck: 97 },
  { month: 'Oct', onTime: 95, amended: 0.8, criticalAck: 100 },
  { month: 'Nov', onTime: 96, amended: 0.6, criticalAck: 99 },
];

const SOURCE = [
  { name: 'Outpatient', value: 45, color: '#0d9488' },
  { name: 'Inpatient', value: 28, color: '#0ea5e9' },
  { name: 'ED', value: 18, color: '#f59e0b' },
  { name: 'Research', value: 9, color: '#8b5cf6' },
];

export default function LabAnalysisPage() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Lab analysis</h2>
          <p className="text-slate-500">Volume, turnaround, quality and source mix.</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn('rounded-md px-3 py-1 text-sm font-medium', range === r ? 'bg-white shadow-sm' : 'text-slate-600')}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { l: 'Avg TAT', v: '42 min', s: '–6 min vs last period' },
          { l: 'On-time %', v: '96%', s: '+1.2 pts' },
          { l: 'Critical ack', v: '99%', s: 'within SLA' },
          { l: 'Amendment rate', v: '0.6%', s: '–0.2 pts' },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">{s.l}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{s.v}</p>
            <p className="text-xs text-emerald-600">{s.s}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold">Tests by type</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BY_TEST} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold">Orders by hour</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={BY_HOUR}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="h" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="v" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-3 font-semibold">Quality trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={QUALITY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="onTime" stroke="#0d9488" strokeWidth={2} name="On-time %" />
                <Line type="monotone" dataKey="criticalAck" stroke="#0ea5e9" strokeWidth={2} name="Critical ack %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold">Source of orders</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={SOURCE} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {SOURCE.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            {SOURCE.map((s) => (
              <div key={s.name} className="flex justify-between">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} /> {s.name}</span>
                <span className="font-medium">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
