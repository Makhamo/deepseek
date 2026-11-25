'use client';

import { ClipboardList, FlaskConical, Package, FileText, Users, Activity, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const KPIS = [
  { href: '/lab/queue', title: 'Sample queue', value: 14, delta: '+3 today', icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50' },
  { href: '/lab/samples', title: 'In processing', value: 8, delta: '2 overdue', icon: FlaskConical, color: 'text-sky-600', bg: 'bg-sky-50' },
  { href: '/lab/tests', title: 'Results to release', value: 5, delta: '1 critical', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
  { href: '/lab/inventory', title: 'Low stock', value: 3, delta: '1 expiring', icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
  { href: '/lab/reports', title: 'Reports today', value: 22, delta: '+8 vs yesterday', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { href: '/lab/patients', title: 'Patients with samples', value: 31, delta: '4 new', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
];

const VOLUME = [
  { day: 'Mon', samples: 18, tests: 24, released: 16 },
  { day: 'Tue', samples: 22, tests: 28, released: 19 },
  { day: 'Wed', samples: 15, tests: 20, released: 14 },
  { day: 'Thu', samples: 27, tests: 32, released: 21 },
  { day: 'Fri', samples: 24, tests: 30, released: 22 },
  { day: 'Sat', samples: 9, tests: 11, released: 8 },
  { day: 'Sun', samples: 6, tests: 7, released: 5 },
];

const STATUS = [
  { name: 'Pending', value: 14, color: '#f59e0b' },
  { name: 'Processing', value: 8, color: '#0ea5e9' },
  { name: 'Verified', value: 22, color: '#10b981' },
  { name: 'Critical', value: 2, color: '#ef4444' },
];

const TAT = [
  { hour: '08:00', minutes: 45 },
  { hour: '10:00', minutes: 38 },
  { hour: '12:00', minutes: 52 },
  { hour: '14:00', minutes: 41 },
  { hour: '16:00', minutes: 35 },
  { hour: '18:00', minutes: 48 },
];

export default function LabDashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Lab dashboard</h2>
          <p className="text-slate-500">Real-time workload, turnaround and quality metrics.</p>
        </div>
        <Link href="/lab/analysis" className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
          Full analysis
        </Link>
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <Link key={k.href} href={k.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${k.bg} ${k.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-slate-500">{k.delta}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{k.value}</p>
              <p className="text-sm text-slate-500">{k.title}</p>
            </Link>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-3 font-semibold text-slate-900">Weekly volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VOLUME}>
                <defs>
                  <linearGradient id="gSamples" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="samples" stroke="#0d9488" fill="url(#gSamples)" strokeWidth={2} />
                <Line type="monotone" dataKey="released" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-900">Status mix</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={STATUS} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {STATUS.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {STATUS.map((s) => (
              <span key={s.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} /> {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-900">Average turnaround (minutes)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TAT}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="minutes" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-900">Alerts</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3 rounded-xl bg-rose-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-600" />
              <div>
                <p className="font-medium text-rose-900">Critical CRP – Aisha Patel</p>
                <p className="text-xs text-rose-700">Result verified · awaiting acknowledgement</p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-xl bg-amber-50 p-3">
              <Clock className="mt-0.5 h-4 w-4 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">2 samples overdue &gt; 24 h</p>
                <p className="text-xs text-amber-700">S-1042, S-1038 in queue</p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900">22 reports released today</p>
                <p className="text-xs text-emerald-700">On track for daily target</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}