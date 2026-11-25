'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { TrendingUp, Pill, Truck, Clock, Package, AlertTriangle } from 'lucide-react';

const DAILY = [
  { day: 'Mon', dispensed: 42, delivered: 8, collected: 31, avgWait: 16 },
  { day: 'Tue', dispensed: 38, delivered: 11, collected: 29, avgWait: 18 },
  { day: 'Wed', dispensed: 51, delivered: 9, collected: 40, avgWait: 14 },
  { day: 'Thu', dispensed: 47, delivered: 14, collected: 35, avgWait: 19 },
  { day: 'Fri', dispensed: 55, delivered: 12, collected: 42, avgWait: 15 },
  { day: 'Sat', dispensed: 28, delivered: 6, collected: 22, avgWait: 12 },
  { day: 'Sun', dispensed: 12, delivered: 2, collected: 9, avgWait: 10 },
];

const HOURLY = [
  { hour: '08', n: 6 }, { hour: '09', n: 14 }, { hour: '10', n: 22 },
  { hour: '11', n: 18 }, { hour: '12', n: 11 }, { hour: '13', n: 9 },
  { hour: '14', n: 16 }, { hour: '15', n: 21 }, { hour: '16', n: 19 },
  { hour: '17', n: 12 }, { hour: '18', n: 5 },
];

const STATUS_PIE = [
  { name: 'Ready / Collected', value: 48, color: '#14b8a6' },
  { name: 'In progress', value: 22, color: '#0ea5e9' },
  { name: 'On hold', value: 6, color: '#f43f5e' },
  { name: 'Out for delivery', value: 9, color: '#8b5cf6' },
];

const TOP_DRUGS = [
  { drug: 'Paracetamol 500 mg', count: 86, pct: 18 },
  { drug: 'Metformin 500 mg', count: 64, pct: 13 },
  { drug: 'Amoxicillin 500 mg', count: 51, pct: 11 },
  { drug: 'Atorvastatin 20 mg', count: 43, pct: 9 },
  { drug: 'Omeprazole 20 mg', count: 37, pct: 8 },
  { drug: 'Amlodipine 5 mg', count: 29, pct: 6 },
  { drug: 'Insulin glargine', count: 24, pct: 5 },
];

const TRACKING = [
  { id: 'RX-4821', patient: 'Thandi Ndlovu', drug: 'Amoxicillin 500 mg', stage: 'Received', ageMin: 48, sla: 'OK' },
  { id: 'RX-4820', patient: 'Johan van Wyk', drug: 'Insulin glargine', stage: 'Clinical check', ageMin: 72, sla: 'Watch' },
  { id: 'RX-4819', patient: 'Aisha Patel', drug: 'Metformin 500 mg', stage: 'Verified', ageMin: 95, sla: 'OK' },
  { id: 'RX-4815', patient: 'Sipho Khumalo', drug: 'Atorvastatin 20 mg', stage: 'Ready', ageMin: 110, sla: 'OK' },
  { id: 'RX-4802', patient: 'Nomsa Dlamini', drug: 'Warfarin 5 mg', stage: 'On hold', ageMin: 2800, sla: 'Breach' },
  { id: 'RX-4798', patient: 'Peter Botha', drug: 'Losartan 50 mg', stage: 'Dispensing', ageMin: 35, sla: 'OK' },
  { id: 'RX-4791', patient: 'Fatima Ismail', drug: 'Salbutamol inhaler', stage: 'Out for delivery', ageMin: 180, sla: 'OK' },
];

export default function PharmacyAnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Pharmacy analytics & tracking</h2>
        <p className="text-slate-500">Volume, wait times, status mix and live SLA tracking.</p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Dispensed (7d)', value: '273', change: '+12%', icon: Pill },
          { label: 'Avg wait to ready', value: '16 min', change: '−3 min', icon: Clock },
          { label: 'Deliveries (7d)', value: '62', change: '+8%', icon: Truck },
          { label: 'SLA breaches', value: '1', change: '1 open', icon: AlertTriangle },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{k.value}</p>
              <p className="text-sm text-slate-500">{k.label}</p>
              <p className="mt-1 text-xs font-medium text-emerald-600">{k.change}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-900">Daily volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAILY} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="dispensed" name="Dispensed" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" name="Delivered" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-900">Average wait (minutes)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="avgWait"
                  name="Avg wait (min)"
                  stroke="#14b8a6"
                  fill="#99f6e4"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h3 className="mb-4 font-semibold text-slate-900">Status mix (today)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={STATUS_PIE}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {STATUS_PIE.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 font-semibold text-slate-900">Hourly intake (today)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HOURLY} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="n"
                  name="Prescriptions"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top drugs + tracking table */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 font-semibold text-slate-900">Top medicines (7 days)</h3>
          <ul className="space-y-3">
            {TOP_DRUGS.map((t, i) => (
              <li key={t.drug}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800">
                    <span className="mr-2 text-slate-400">{i + 1}.</span>
                    {t.drug}
                  </span>
                  <span className="font-semibold text-slate-900">{t.count}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${t.pct * 4}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-semibold text-slate-900">Live tracking & SLA</h3>
            <p className="text-xs text-slate-500">Age in minutes since receipt · SLA target 120 min to ready</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">RX</th>
                  <th className="px-4 py-2.5 font-medium">Patient / Drug</th>
                  <th className="px-4 py-2.5 font-medium">Stage</th>
                  <th className="px-4 py-2.5 font-medium">Age</th>
                  <th className="px-4 py-2.5 font-medium">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TRACKING.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{t.id}</td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-slate-900">{t.patient}</p>
                      <p className="text-xs text-slate-500">{t.drug}</p>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{t.stage}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {t.ageMin >= 60 ? `${Math.round(t.ageMin / 60)}h` : `${t.ageMin}m`}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          t.sla === 'OK'
                            ? 'bg-emerald-50 text-emerald-700'
                            : t.sla === 'Watch'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {t.sla}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
