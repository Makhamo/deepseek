'use client';

import { useState } from 'react';
import { Calendar, Clock, Video, MapPin, User, Plus, CheckCircle2, X, AlertTriangle, Phone, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Appt = {
  id: string;
  patient: string;
  mrn: string;
  age: number;
  phone: string;
  time: string;
  date: string;
  type: 'In-person' | 'Video';
  reason: string;
  notes?: string;
  status: 'confirmed' | 'checked-in' | 'in-consultation' | 'completed' | 'no-show' | 'cancelled';
  room: string;
  insurance?: string;
};

const SEED: Appt[] = [
  { id: '1', patient: 'Thandi Ndlovu', mrn: 'MRN-88421', age: 34, phone: '+27 82 123 4567', time: '09:30', date: '23 Nov 2026', type: 'In-person', reason: 'Follow-up hypertension', notes: 'BP log attached', status: 'confirmed', room: 'Room 4', insurance: 'Discovery' },
  { id: '2', patient: 'Johan van Wyk', mrn: 'MRN-77102', age: 58, phone: '+27 83 987 6543', time: '10:15', date: '23 Nov 2026', type: 'Video', reason: 'Diabetes review', status: 'confirmed', room: 'Video', insurance: 'Momentum' },
  { id: '3', patient: 'Aisha Patel', mrn: 'MRN-55019', age: 42, phone: '+27 71 222 3344', time: '11:00', date: '23 Nov 2026', type: 'In-person', reason: 'Asthma check', status: 'checked-in', room: 'Room 2' },
  { id: '4', patient: 'Sipho Khumalo', mrn: 'MRN-33108', age: 51, phone: '+27 84 555 6677', time: '14:00', date: '24 Nov 2026', type: 'In-person', reason: 'Lipid review', status: 'confirmed', room: 'Room 4' },
  { id: '5', patient: 'Nomsa Dlamini', mrn: 'MRN-11880', age: 67, phone: '+27 76 333 4455', time: '15:30', date: '24 Nov 2026', type: 'Video', reason: 'INR discussion', status: 'confirmed', room: 'Video' },
];

export default function DoctorAppointmentsPage() {
  const [list, setList] = useState<Appt[]>(SEED);
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'all'>('today');
  const [selected, setSelected] = useState<string | null>(null);
  const detail = list.find((a) => a.id === selected);

  const updateStatus = (id: string, status: Appt['status']) => {
    setList((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const filtered = list.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'today') return a.date.includes('23 Nov');
    return a.date.includes('24 Nov') || a.date.includes('25 Nov');
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Appointments</h2>
          <p className="text-slate-500">Your schedule, patient context and visit workflow.</p>
        </div>
        <div className="flex gap-2">
          {(['today', 'upcoming', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium capitalize',
                filter === f ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelected(a.id)}
            className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              {a.type === 'Video' ? <Video className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">{a.patient}</p>
                <span className="text-xs text-slate-400">{a.mrn} · {a.age}y</span>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                  a.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                  a.status === 'checked-in' ? 'bg-sky-50 text-sky-700' :
                  a.status === 'in-consultation' ? 'bg-amber-50 text-amber-700' :
                  a.status === 'completed' ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-600'
                )}>{a.status.replace('-', ' ')}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{a.reason}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {a.date} · {a.time}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {a.room}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {a.phone}</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300" />
          </button>
        ))}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="font-semibold text-slate-900">{detail.patient}</h3>
                <p className="text-xs text-slate-500">{detail.mrn} · {detail.age}y</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-slate-400">Time</p><p className="font-medium">{detail.date} · {detail.time}</p></div>
                <div><p className="text-xs text-slate-400">Type</p><p className="font-medium">{detail.type}</p></div>
                <div><p className="text-xs text-slate-400">Location</p><p className="font-medium">{detail.room}</p></div>
                <div><p className="text-xs text-slate-400">Status</p><p className="font-medium capitalize">{detail.status.replace('-', ' ')}</p></div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 text-sm">
                <p className="text-xs font-semibold text-slate-400">Reason</p>
                <p className="mt-1">{detail.reason}</p>
                {detail.notes && <p className="mt-2 text-slate-600">{detail.notes}</p>}
              </div>
              {detail.insurance && (
                <p className="text-sm text-slate-600">Medical aid: {detail.insurance}</p>
              )}
              <div className="space-y-2 pt-2">
                {detail.status === 'confirmed' && (
                  <button onClick={() => updateStatus(detail.id, 'checked-in')} className="w-full rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white">Check in</button>
                )}
                {detail.status === 'checked-in' && (
                  <button onClick={() => updateStatus(detail.id, 'in-consultation')} className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white">Start consultation</button>
                )}
                {detail.status === 'in-consultation' && (
                  <button onClick={() => updateStatus(detail.id, 'completed')} className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white">Complete</button>
                )}
                {detail.type === 'Video' && detail.status === 'confirmed' && (
                  <a href="/doctor/video" className="block w-full rounded-xl border border-slate-200 py-2.5 text-center text-sm font-medium">Start video call</a>
                )}
                <button className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium">Open patient record</button>
                <button className="w-full rounded-xl border border-rose-200 py-2.5 text-sm font-medium text-rose-700">Mark no-show / cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
