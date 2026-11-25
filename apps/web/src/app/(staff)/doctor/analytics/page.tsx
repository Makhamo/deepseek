'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Calendar, Activity, Pill, TrendingUp } from 'lucide-react';

const WEEK = [
  { day: 'Mon', encounters: 18, appointments: 22 },
  { day: 'Tue', encounters: 15, appointments: 19 },
  { day: 'Wed', encounters: 21, appointments: 24 },
  { day: 'Thu', encounters: 17, appointments: 20 },
  { day: 'Fri', encounters: 19, appointments: 23 },
  { day: 'Sat', encounters: 8, appointments: 10 },
  { day: 'Sun', encounters: 4, appointments: 5 },
];

export default function DoctorAnalyticsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
        <p className="text-slate-500">Encounter volume, appointment utilisation and activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Encounters this week', value: '102', icon: Activity, change: '+8%' },
          { label: 'Appointments', value: '123', icon: Calendar, change: '+5%' },
          { label: 'Prescriptions issued', value: '67', icon: Pill, change: '+12%' },
          { label: 'Active patients', value: '128', icon: Users, change: '+2' },
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">Weekly activity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEK}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="encounters" name="Encounters" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="appointments" name="Appointments" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
