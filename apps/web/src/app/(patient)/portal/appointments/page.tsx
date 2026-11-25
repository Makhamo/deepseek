'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, Video, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DOCTORS, SEED_APPOINTMENTS, MONTHS, type Appt } from '@/lib/patient-data';

const STATUS_LABEL: Record<Appt['status'], string> = {
  confirmed: 'Confirmed',
  pending: 'Requested',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const EMPTY_FORM = {
  doctorId: '',
  date: '2026-11-23',
  time: '',
  meetType: 'in-person' as 'in-person' | 'video',
  reason: '',
  notes: '',
  insurance: '',
  phone: '+27 82 123 4567',
  consent: false,
};

function formatDate(iso: string) {
  const d = new Date(iso + 'T12:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function VisitsInner() {
  const params = useSearchParams();
  const preselected = DOCTORS.some((d) => d.id === params.get('doctor')) ? (params.get('doctor') as string) : '';

  const [form, setForm] = useState({ ...EMPTY_FORM, doctorId: preselected });
  const [availabilityError, setAvailabilityError] = useState('');
  const [sent, setSent] = useState(false);
  const [booked, setBooked] = useState<Appt[]>(SEED_APPOINTMENTS);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  const selectedDoctor = DOCTORS.find((d) => d.id === form.doctorId);
  const availableSlots = selectedDoctor?.slots[form.date] || [];

  const checkAvailability = () => {
    if (!selectedDoctor || !form.time) {
      setAvailabilityError('Please select a doctor and time.');
      return false;
    }
    if (!availableSlots.includes(form.time)) {
      setAvailabilityError(`${selectedDoctor.name} is not available at ${form.time} on ${form.date}. Please choose another slot.`);
      return false;
    }
    setAvailabilityError('');
    return true;
  };

  const submitBooking = () => {
    if (!checkAvailability()) return;
    if (!form.consent) {
      setAvailabilityError('Please confirm the appointment details.');
      return;
    }
    const newAppt: Appt = {
      id: `new-${Date.now()}`,
      doctor: selectedDoctor!.name,
      specialty: selectedDoctor!.specialty,
      time: form.time,
      date: formatDate(form.date),
      type: form.meetType === 'video' ? 'Video' : 'In-person',
      reason: form.reason || 'General consultation',
      status: 'pending',
      location: form.meetType === 'video' ? 'Video link will be sent' : `${selectedDoctor!.facility} · Room to be assigned`,
      notes: form.notes,
    };
    setBooked((prev) => [newAppt, ...prev]);
    setForm({ ...EMPTY_FORM });
    setAvailabilityError('');
    setSent(true);
  };

  const cancelVisit = (id: string) =>
    setBooked((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a)));

  const filtered = booked.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return a.status === 'confirmed' || a.status === 'pending';
    return a.status === 'completed' || a.status === 'cancelled';
  });

  const heading = filter === 'upcoming' ? 'Upcoming visits' : filter === 'past' ? 'Past visits' : 'All visits';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-medium text-teal-600">Care visits</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Your visits</h2>
        <p className="mt-1 text-sm text-slate-500">Plan a visit, see what’s coming up and look back at your care.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* Visit list */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">{heading}</h3>
            <span className="text-xs text-slate-400">{filtered.length} scheduled</span>
          </div>

          <div className="flex gap-2">
            {(['upcoming', 'past', 'all'] as const).map((f) => (
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

          {filtered.map((a) => {
            const [day = '', mon = ''] = a.date.split(' ');
            return (
              <div key={a.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <span className="text-[10px] font-semibold">{mon.toUpperCase()}</span>
                  <span className="text-xl font-bold leading-none">{day}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{a.reason}</p>
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase',
                      a.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                      a.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                    )}>{STATUS_LABEL[a.status]}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{a.date} · {a.time}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      {a.type === 'Video' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                      {a.type === 'Video' ? 'Video visit' : 'In-person visit'} with {a.doctor}
                    </span>
                    <span>{a.location}</span>
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    {a.type === 'Video' && a.status === 'confirmed' && (
                      <a href="/portal/video" className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white">Join call</a>
                    )}
                    {(a.status === 'confirmed' || a.status === 'pending') && (
                      <button onClick={() => cancelVisit(a.id)} className="text-xs font-medium text-rose-600 hover:underline">
                        Cancel appointment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">No appointments in this view.</p>
          )}
        </section>

        {/* Booking panel */}
        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
            <Calendar className="h-3.5 w-3.5" /> Book a visit
          </span>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">Choose a time that works</h3>
          <p className="mt-1 text-xs text-slate-500">Pick a preferred day and time. Your care team will confirm the slot.</p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Who would you like to see?</label>
              <select
                value={form.doctorId}
                onChange={(e) => { setForm({ ...form, doctorId: e.target.value, time: '' }); setAvailabilityError(''); setSent(false); }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">Choose a doctor</option>
                {DOCTORS.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} · {d.specialty}</option>
                ))}
              </select>
              {selectedDoctor && (
                <p className="mt-1 text-[11px] text-teal-600">Next available: {selectedDoctor.nextAvailable}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Preferred date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => { setForm({ ...form, date: e.target.value, time: '' }); setAvailabilityError(''); setSent(false); }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Preferred time</label>
              {!selectedDoctor ? (
                <p className="text-xs text-slate-400">Choose a doctor to see available times.</p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-amber-700">No slots available on this date. Please choose another day.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setForm({ ...form, time: t }); setAvailabilityError(''); setSent(false); }}
                      className={cn(
                        'rounded-lg border px-2 py-2 text-xs font-medium',
                        form.time === t ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-500">How would you like to meet?</label>
              <select
                value={form.meetType}
                onChange={(e) => setForm({ ...form, meetType: e.target.value as 'in-person' | 'video' })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="in-person">In person</option>
                <option value="video">Video visit</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Reason for visit</label>
              <input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="e.g. Blood pressure review"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Additional notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Anything your clinician should know beforehand?"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Contact phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Medical aid</label>
                <input
                  value={form.insurance}
                  onChange={(e) => setForm({ ...form, insurance: e.target.value })}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                className="mt-0.5 rounded accent-teal-600"
              />
              I confirm these details are correct and agree to the cancellation policy.
            </label>

            {availabilityError && (
              <p className="flex items-center gap-1 text-xs text-rose-600">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {availabilityError}
              </p>
            )}
            {sent && (
              <p className="flex items-center gap-1 text-xs text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Request sent. Your care team will confirm the slot.
              </p>
            )}

            <button
              onClick={submitBooking}
              disabled={!form.consent}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              <Calendar className="h-4 w-4" /> Send request
            </button>

            <p className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-800">
              Requests are reviewed during clinic hours. For urgent symptoms, use the symptom checker or call your clinic.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function PatientVisitsPage() {
  return (
    <Suspense fallback={null}>
      <VisitsInner />
    </Suspense>
  );
}