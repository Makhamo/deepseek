'use client';

import Link from 'next/link';
import { Users, Calendar, Activity, FlaskConical, Pill, Baby, ArrowRight, Clock, AlertTriangle } from 'lucide-react';

const CARDS = [
  { href: '/doctor/patients', title: 'Active patients', value: '128', icon: Users, color: 'bg-sky-50 text-sky-600' },
  { href: '/doctor/appointments', title: 'Today’s appointments', value: '9', icon: Calendar, color: 'bg-teal-50 text-teal-600' },
  { href: '/doctor/triage', title: 'Triage pending', value: '4', icon: Activity, color: 'bg-amber-50 text-amber-600' },
  { href: '/doctor/lab', title: 'Results to review', value: '3', icon: FlaskConical, color: 'bg-violet-50 text-violet-600' },
  { href: '/doctor/prescriptions', title: 'Prescriptions today', value: '12', icon: Pill, color: 'bg-rose-50 text-rose-600' },
  { href: '/doctor/nicu', title: 'NICU active', value: '3', icon: Baby, color: 'bg-indigo-50 text-indigo-600' },
];

const QUEUE = [
  { id: 'TRI-400', patient: 'Johan van Wyk', type: 'Triage – high', time: '18 min ago' },
  { id: 'LAB-2201', patient: 'Thandi Ndlovu', type: 'Lab result ready', time: '25 min ago' },
  { id: 'ENC-1001', patient: 'Thandi Ndlovu', type: 'Encounter in progress', time: '40 min ago' },
];

export default function DoctorDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clinician dashboard</h2>
          <p className="text-slate-500">Encounters, triage, orders and neonatal care in one place.</p>
        </div>
        <Link href="/doctor/encounters" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
          Start encounter <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${c.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{c.value}</p>
              <p className="mt-1 text-sm text-slate-500">{c.title}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-semibold text-slate-900">Needs attention</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {QUEUE.map((q) => (
              <li key={q.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{q.patient}</p>
                  <p className="text-xs text-slate-500">{q.type}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" /> {q.time}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Today’s focus</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>• Review 4 triage assessments requiring clinician confirmation</li>
            <li>• 2 critical lab results pending acknowledgment</li>
            <li>• NICU hand-over for bed 5 at 14:00</li>
            <li>• Complete encounter for Thandi Ndlovu</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
