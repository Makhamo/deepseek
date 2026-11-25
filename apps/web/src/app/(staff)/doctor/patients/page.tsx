'use client';

import { useState } from 'react';
import { Users, Search, User, Phone, Mail, Calendar, FileText, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const PATIENTS = [
  { id: '1', name: 'Thandi Ndlovu', mrn: 'MRN-88421', age: 34, gender: 'F', phone: '+27 82 123 4567', email: 'thandi@example.com', lastVisit: '22 Nov 2026', conditions: ['Hypertension', 'Type 2 DM'], status: 'active' },
  { id: '2', name: 'Johan van Wyk', mrn: 'MRN-77102', age: 58, gender: 'M', phone: '+27 83 987 6543', email: 'johan@example.com', lastVisit: '22 Nov 2026', conditions: ['CAD', 'Type 2 DM'], status: 'active' },
  { id: '3', name: 'Aisha Patel', mrn: 'MRN-55019', age: 42, gender: 'F', phone: '+27 71 222 3344', email: 'aisha@example.com', lastVisit: '20 Nov 2026', conditions: ['Asthma'], status: 'active' },
  { id: '4', name: 'Sipho Khumalo', mrn: 'MRN-33108', age: 51, gender: 'M', phone: '+27 84 555 6677', email: 'sipho@example.com', lastVisit: '21 Nov 2026', conditions: ['Hyperlipidaemia'], status: 'active' },
  { id: '5', name: 'Lerato Molefe', mrn: 'MRN-22991', age: 29, gender: 'F', phone: '+27 72 111 2233', email: 'lerato@example.com', lastVisit: '21 Nov 2026', conditions: [], status: 'active' },
  { id: '6', name: 'Nomsa Dlamini', mrn: 'MRN-11880', age: 67, gender: 'F', phone: '+27 76 333 4455', email: 'nomsa@example.com', lastVisit: '18 Nov 2026', conditions: ['AF', 'Warfarin'], status: 'active' },
];

export default function DoctorPatientsPage() {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.mrn.toLowerCase().includes(q.toLowerCase())
  );
  const detail = PATIENTS.find((p) => p.id === selected);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Patients</h2>
          <p className="text-slate-500">Your patient panel – search, view records and recent activity.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
          <Plus className="h-4 w-4" /> New patient
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or MRN…"
          className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-teal-500"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">MRN / Age</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Conditions</th>
              <th className="px-4 py-3 font-medium">Last visit</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
                      {p.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.gender}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-mono text-xs text-slate-600">{p.mrn}</p>
                  <p className="text-xs text-slate-500">{p.age}y</p>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {p.phone}</p>
                  <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> {p.email}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.conditions.length ? p.conditions.map((c) => (
                      <span key={c} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">{c}</span>
                    )) : <span className="text-xs text-slate-400">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{p.lastVisit}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(p.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                  >
                    Open <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="font-semibold text-slate-900">{detail.name}</h3>
              <button onClick={() => setSelected(null)} className="rounded p-1 hover:bg-slate-100">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-lg font-semibold text-teal-700">
                  {detail.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{detail.name}</p>
                  <p className="text-sm text-slate-500">{detail.mrn} · {detail.age}y · {detail.gender}</p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 text-sm space-y-2">
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {detail.phone}</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> {detail.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Conditions</p>
                <div className="flex flex-wrap gap-1">
                  {detail.conditions.length ? detail.conditions.map((c) => (
                    <span key={c} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-800">{c}</span>
                  )) : <span className="text-sm text-slate-500">None recorded</span>}
                </div>
              </div>
              <div className="pt-4 space-y-2">
                <a href="/doctor/encounters" className="block rounded-xl bg-teal-600 py-2.5 text-center text-sm font-semibold text-white">Start encounter</a>
                <a href="/doctor/appointments" className="block rounded-xl border border-slate-200 py-2.5 text-center text-sm font-medium">Book appointment</a>
                <a href="/doctor/messages" className="block rounded-xl border border-slate-200 py-2.5 text-center text-sm font-medium">Message patient</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
