'use client';

import { useMemo, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, Video,
  X, Calendar as CalIcon, Users, Ban, Check, XCircle, Link2,
  FileText, Bell, Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type EventType =
  | 'meeting'
  | 'video'
  | 'appointment'
  | 'collection'
  | 'delivery'
  | 'shift'
  | 'unavailable'
  | 'followup'
  | 'other';

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

export type Participant = {
  id: string;
  name: string;
  role: string;
  status: InviteStatus;
};

export type CalEvent = {
  id: string;
  title: string;
  type: EventType;
  date: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
  videoLink?: string;
  notes?: string;
  organizer: string;
  organizerId: string;
  participants: Participant[];
  status: 'scheduled' | 'completed' | 'cancelled';
  isAvailabilityBlock?: boolean;
};

const TYPE_META: Record<EventType, { label: string; color: string; bg: string }> = {
  meeting: { label: 'Meeting', color: 'text-indigo-700', bg: 'bg-indigo-100 border-indigo-200' },
  video: { label: 'Video call', color: 'text-sky-700', bg: 'bg-sky-100 border-sky-200' },
  appointment: { label: 'Appointment', color: 'text-teal-700', bg: 'bg-teal-100 border-teal-200' },
  collection: { label: 'Collection', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200' },
  delivery: { label: 'Delivery', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200' },
  shift: { label: 'Shift', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200' },
  unavailable: { label: 'Unavailable', color: 'text-rose-700', bg: 'bg-rose-100 border-rose-200' },
  followup: { label: 'Follow-up', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200' },
  other: { label: 'Other', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
};

const DIRECTORY: { id: string; name: string; role: string }[] = [
  { id: 'u1', name: 'Dr. S. Naidoo', role: 'Doctor' },
  { id: 'u2', name: 'Dr. L. Mokoena', role: 'Doctor' },
  { id: 'u3', name: 'Pharm. K. Botha', role: 'Pharmacy' },
  { id: 'u4', name: 'Lab Tech M. Dlamini', role: 'Lab' },
  { id: 'u5', name: 'Thandi Ndlovu', role: 'Patient' },
  { id: 'u6', name: 'Johan van Wyk', role: 'Patient' },
  { id: 'u7', name: 'Aisha Patel', role: 'Patient' },
  { id: 'u8', name: 'Admin – Unitac', role: 'Admin' },
  { id: 'u9', name: 'Nurse P. Sithole', role: 'Nurse' },
];

function pad(n: number) {
  return n.toString().padStart(2, '0');
}
function toKey(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}
function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function startWeekday(y: number, m: number) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SEED: CalEvent[] = [
  {
    id: 'e1',
    title: 'Multidisciplinary case review',
    type: 'video',
    date: '2026-11-22',
    start: '10:00',
    end: '11:00',
    videoLink: 'https://meet.unitachealth.co.za/case-review-22',
    notes: 'Discuss complex diabetes + cardiac patient pathway.',
    organizer: 'Dr. S. Naidoo',
    organizerId: 'u1',
    participants: [
      { id: 'u1', name: 'Dr. S. Naidoo', role: 'Doctor', status: 'accepted' },
      { id: 'u2', name: 'Dr. L. Mokoena', role: 'Doctor', status: 'accepted' },
      { id: 'u3', name: 'Pharm. K. Botha', role: 'Pharmacy', status: 'pending' },
      { id: 'u4', name: 'Lab Tech M. Dlamini', role: 'Lab', status: 'tentative' },
    ],
    status: 'scheduled',
  },
  {
    id: 'e2',
    title: 'Patient consult – Thandi Ndlovu',
    type: 'appointment',
    date: '2026-11-23',
    start: '09:30',
    end: '10:00',
    location: 'Room 4 – Main Clinic',
    videoLink: 'https://meet.unitachealth.co.za/thandi-23',
    organizer: 'Dr. S. Naidoo',
    organizerId: 'u1',
    participants: [
      { id: 'u1', name: 'Dr. S. Naidoo', role: 'Doctor', status: 'accepted' },
      { id: 'u5', name: 'Thandi Ndlovu', role: 'Patient', status: 'accepted' },
    ],
    status: 'scheduled',
  },
  {
    id: 'e3',
    title: 'Unavailable – personal',
    type: 'unavailable',
    date: '2026-11-24',
    start: '13:00',
    end: '17:00',
    notes: 'Blocked – do not book',
    organizer: 'You',
    organizerId: 'me',
    participants: [],
    status: 'scheduled',
    isAvailabilityBlock: true,
  },
  {
    id: 'e4',
    title: 'Pharmacy delivery window',
    type: 'delivery',
    date: '2026-11-22',
    start: '14:00',
    end: '16:30',
    location: 'Route Sandton',
    organizer: 'Pharm. K. Botha',
    organizerId: 'u3',
    participants: [{ id: 'u3', name: 'Pharm. K. Botha', role: 'Pharmacy', status: 'accepted' }],
    status: 'scheduled',
  },
  {
    id: 'e5',
    title: 'Lab critical results huddle',
    type: 'video',
    date: '2026-11-25',
    start: '08:30',
    end: '09:00',
    videoLink: 'https://meet.unitachealth.co.za/lab-huddle',
    organizer: 'Lab Tech M. Dlamini',
    organizerId: 'u4',
    participants: [
      { id: 'u4', name: 'Lab Tech M. Dlamini', role: 'Lab', status: 'accepted' },
      { id: 'u1', name: 'Dr. S. Naidoo', role: 'Doctor', status: 'pending' },
      { id: 'u2', name: 'Dr. L. Mokoena', role: 'Doctor', status: 'pending' },
    ],
    status: 'scheduled',
  },
  {
    id: 'e6',
    title: 'Team standup',
    type: 'meeting',
    date: '2026-11-26',
    start: '08:00',
    end: '08:20',
    location: 'Staff room',
    videoLink: 'https://meet.unitachealth.co.za/standup',
    organizer: 'Admin – Unitac',
    organizerId: 'u8',
    participants: [
      { id: 'u8', name: 'Admin – Unitac', role: 'Admin', status: 'accepted' },
      { id: 'u1', name: 'Dr. S. Naidoo', role: 'Doctor', status: 'accepted' },
      { id: 'u3', name: 'Pharm. K. Botha', role: 'Pharmacy', status: 'declined' },
    ],
    status: 'scheduled',
  },
];

type Props = {
  role: 'patient' | 'doctor' | 'lab' | 'pharmacy' | 'admin';
  currentUserName?: string;
};

export function AdvancedCalendar({ role, currentUserName = 'You' }: Props) {
  const [cursor, setCursor] = useState({ y: 2026, m: 10 });
  const [view, setView] = useState<'month' | 'week'>('month');
  const [events, setEvents] = useState<CalEvent[]>(SEED);
  const [selectedDate, setSelectedDate] = useState<string | null>('2026-11-22');
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<'event' | 'unavailable'>('event');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [inviteFilter, setInviteFilter] = useState<'all' | 'pending'>('all');

  const [form, setForm] = useState({
    title: '',
    type: 'meeting' as EventType,
    date: '2026-11-22',
    start: '09:00',
    end: '10:00',
    allDay: false,
    location: '',
    videoLink: '',
    notes: '',
    participantIds: [] as string[],
  });

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (inviteFilter === 'pending') {
        const mine = e.participants.find((p) => p.name === currentUserName || p.id === 'me');
        // show events where current user has pending invite, or any pending for demo
        return e.participants.some((p) => p.status === 'pending');
      }
      return true;
    });
  }, [events, typeFilter, inviteFilter, currentUserName]);

  const byDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    filteredEvents.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.start.localeCompare(b.start)));
    return map;
  }, [filteredEvents]);

  const cells = useMemo(() => {
    const dim = daysInMonth(cursor.y, cursor.m);
    const start = startWeekday(cursor.y, cursor.m);
    const list: { key: string; day: number; inMonth: boolean }[] = [];
    const prevDim = daysInMonth(cursor.y, cursor.m - 1 < 0 ? 11 : cursor.m - 1);
    for (let i = start - 1; i >= 0; i--) {
      const d = prevDim - i;
      const m = cursor.m === 0 ? 11 : cursor.m - 1;
      const y = cursor.m === 0 ? cursor.y - 1 : cursor.y;
      list.push({ key: toKey(y, m, d), day: d, inMonth: false });
    }
    for (let d = 1; d <= dim; d++) {
      list.push({ key: toKey(cursor.y, cursor.m, d), day: d, inMonth: true });
    }
    while (list.length < 42) {
      const idx = list.length - (start + dim) + 1;
      const m = cursor.m === 11 ? 0 : cursor.m + 1;
      const y = cursor.m === 11 ? cursor.y + 1 : cursor.y;
      list.push({ key: toKey(y, m, idx), day: idx, inMonth: false });
    }
    return list.slice(0, 42);
  }, [cursor]);

  const weekStart = useMemo(() => {
    const base = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date(2026, 10, 22);
    const day = base.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const mon = new Date(base);
    mon.setDate(base.getDate() + mondayOffset);
    return mon;
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return {
        key: toKey(d.getFullYear(), d.getMonth(), d.getDate()),
        label: WEEKDAYS[i],
        day: d.getDate(),
      };
    });
  }, [weekStart]);

  const dayEvents = selectedDate ? byDate[selectedDate] || [] : [];
  const pendingInvites = events.filter((e) =>
    e.participants.some((p) => p.status === 'pending')
  ).length;

  const respondInvite = (eventId: string, status: InviteStatus) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        return {
          ...e,
          participants: e.participants.map((p) =>
            p.status === 'pending' || p.name === currentUserName
              ? { ...p, status }
              : p
          ),
        };
      })
    );
    setSelectedEvent((se) => {
      if (!se || se.id !== eventId) return se;
      return {
        ...se,
        participants: se.participants.map((p) =>
          p.status === 'pending' || p.name === currentUserName ? { ...p, status } : p
        ),
      };
    });
  };

  const toggleParticipant = (id: string) => {
    setForm((f) => ({
      ...f,
      participantIds: f.participantIds.includes(id)
        ? f.participantIds.filter((x) => x !== id)
        : [...f.participantIds, id],
    }));
  };

  const createEvent = () => {
    if (createMode === 'unavailable') {
      const ev: CalEvent = {
        id: `e-${Date.now()}`,
        title: form.title.trim() || 'Unavailable',
        type: 'unavailable',
        date: form.date,
        start: form.allDay ? '00:00' : form.start,
        end: form.allDay ? '23:59' : form.end,
        allDay: form.allDay,
        notes: form.notes || 'Marked unavailable',
        organizer: currentUserName,
        organizerId: 'me',
        participants: [],
        status: 'scheduled',
        isAvailabilityBlock: true,
      };
      setEvents((prev) => [...prev, ev]);
    } else {
      if (!form.title.trim()) return;
      const participants: Participant[] = form.participantIds.map((id) => {
        const u = DIRECTORY.find((d) => d.id === id)!;
        return { id: u.id, name: u.name, role: u.role, status: 'pending' as InviteStatus };
      });
      // organizer accepted
      participants.unshift({
        id: 'me',
        name: currentUserName,
        role: role,
        status: 'accepted',
      });
      const ev: CalEvent = {
        id: `e-${Date.now()}`,
        title: form.title.trim(),
        type: form.type,
        date: form.date,
        start: form.start,
        end: form.end,
        allDay: form.allDay,
        location: form.location || undefined,
        videoLink: form.videoLink || undefined,
        notes: form.notes || undefined,
        organizer: currentUserName,
        organizerId: 'me',
        participants,
        status: 'scheduled',
      };
      setEvents((prev) => [...prev, ev]);
    }
    setSelectedDate(form.date);
    setShowCreate(false);
    setForm({
      title: '',
      type: 'meeting',
      date: form.date,
      start: '09:00',
      end: '10:00',
      allDay: false,
      location: '',
      videoLink: '',
      notes: '',
      participantIds: [],
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Calendar</h2>
          <p className="text-slate-500">
            Meetings, video calls, availability, invites and shared events across the platform.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setView('month')}
              className={cn('rounded-md px-3 py-1.5 text-xs font-semibold', view === 'month' ? 'bg-teal-600 text-white' : 'text-slate-600')}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={cn('rounded-md px-3 py-1.5 text-xs font-semibold', view === 'week' ? 'bg-teal-600 text-white' : 'text-slate-600')}
            >
              Week
            </button>
          </div>
          <button
            onClick={() => {
              setCreateMode('unavailable');
              setForm((f) => ({ ...f, date: selectedDate || '2026-11-22', title: 'Unavailable' }));
              setShowCreate(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
          >
            <Ban className="h-4 w-4" /> Mark unavailable
          </button>
          <button
            onClick={() => {
              setCreateMode('event');
              setForm((f) => ({ ...f, date: selectedDate || '2026-11-22', title: '' }));
              setShowCreate(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" /> New event
          </button>
        </div>
      </div>

      {/* Filters + pending invites */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTypeFilter('all')}
          className={cn('rounded-full px-3 py-1 text-xs font-semibold', typeFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600')}
        >
          All types
        </button>
        {(Object.keys(TYPE_META) as EventType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-semibold',
              typeFilter === t ? TYPE_META[t].bg + ' ' + TYPE_META[t].color : 'bg-white text-slate-600 border-slate-200'
            )}
          >
            {TYPE_META[t].label}
          </button>
        ))}
        <button
          onClick={() => setInviteFilter(inviteFilter === 'pending' ? 'all' : 'pending')}
          className={cn(
            'ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            inviteFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200'
          )}
        >
          <Bell className="h-3.5 w-3.5" />
          Pending invites ({pendingInvites})
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Grid */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <button onClick={() => setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }))} className="rounded-lg p-2 hover:bg-slate-100">
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h3 className="text-sm font-semibold text-slate-900">
              {MONTHS[cursor.m]} {cursor.y}
            </h3>
            <button onClick={() => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }))} className="rounded-lg p-2 hover:bg-slate-100">
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {view === 'month' ? (
            <>
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((c) => {
                  const isSelected = selectedDate === c.key;
                  const isToday = c.key === '2026-11-22';
                  const evs = byDate[c.key] || [];
                  const hasBlock = evs.some((e) => e.isAvailabilityBlock);
                  return (
                    <button
                      key={c.key}
                      onClick={() => setSelectedDate(c.key)}
                      className={cn(
                        'min-h-[92px] border-b border-r border-slate-100 p-1.5 text-left transition hover:bg-slate-50',
                        !c.inMonth && 'bg-slate-50/60 text-slate-400',
                        isSelected && 'bg-teal-50 ring-2 ring-inset ring-teal-500',
                        hasBlock && !isSelected && 'bg-rose-50/40'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                          isToday && 'bg-teal-600 text-white',
                          !isToday && isSelected && 'text-teal-700',
                          !isToday && !isSelected && c.inMonth && 'text-slate-800'
                        )}
                      >
                        {c.day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {evs.slice(0, 3).map((e) => (
                          <div
                            key={e.id}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setSelectedEvent(e);
                            }}
                            className={cn(
                              'truncate rounded border px-1 py-0.5 text-[10px] font-medium leading-tight',
                              TYPE_META[e.type].bg,
                              TYPE_META[e.type].color,
                              e.status === 'completed' && 'opacity-50 line-through'
                            )}
                          >
                            {e.isAvailabilityBlock ? '🚫 ' : e.type === 'video' ? '📹 ' : ''}
                            {e.start} {e.title}
                          </div>
                        ))}
                        {evs.length > 3 && (
                          <p className="text-[10px] text-slate-400">+{evs.length - 3} more</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-7 divide-x divide-slate-100">
              {weekDays.map((d) => {
                const evs = byDate[d.key] || [];
                const isSelected = selectedDate === d.key;
                const isToday = d.key === '2026-11-22';
                return (
                  <div key={d.key} className="min-h-[340px]">
                    <button
                      onClick={() => setSelectedDate(d.key)}
                      className={cn('flex w-full flex-col items-center border-b border-slate-100 py-2', isSelected && 'bg-teal-50')}
                    >
                      <span className="text-[10px] font-semibold uppercase text-slate-400">{d.label}</span>
                      <span className={cn('mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold', isToday ? 'bg-teal-600 text-white' : 'text-slate-800')}>
                        {d.day}
                      </span>
                    </button>
                    <div className="space-y-1 p-1.5">
                      {evs.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setSelectedEvent(e)}
                          className={cn('w-full rounded border px-1.5 py-1 text-left text-[10px] font-medium', TYPE_META[e.type].bg, TYPE_META[e.type].color)}
                        >
                          <p className="font-semibold">{e.start}</p>
                          <p className="truncate">{e.title}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Day agenda */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="font-semibold text-slate-900">
              {selectedDate
                ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-ZA', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })
                : 'Select a day'}
            </h3>
            <p className="text-xs text-slate-500">{dayEvents.length} event(s)</p>
          </div>
          <div className="max-h-[540px] space-y-2 overflow-y-auto p-3">
            {dayEvents.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">No events. Create one or mark unavailable.</p>
            )}
            {dayEvents.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelectedEvent(e)}
                className={cn(
                  'flex w-full gap-3 rounded-xl border p-3 text-left transition hover:shadow-sm',
                  TYPE_META[e.type].bg,
                  e.status === 'completed' && 'opacity-60'
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-semibold', TYPE_META[e.type].color, e.status === 'completed' && 'line-through')}>
                    {e.isAvailabilityBlock && '🚫 '}
                    {e.type === 'video' && '📹 '}
                    {e.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                    <Clock className="h-3 w-3" /> {e.allDay ? 'All day' : `${e.start} – ${e.end}`}
                  </p>
                  {e.participants.length > 0 && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <Users className="h-3 w-3" /> {e.participants.length} participant(s)
                    </p>
                  )}
                  {e.videoLink && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-sky-600">
                      <Video className="h-3 w-3" /> Video link
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Event detail */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', TYPE_META[selectedEvent.type].bg, TYPE_META[selectedEvent.type].color)}>
                  {TYPE_META[selectedEvent.type].label}
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-900">{selectedEvent.title}</h3>
                <p className="text-xs text-slate-500">Organised by {selectedEvent.organizer}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="rounded p-1 hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <CalIcon className="h-4 w-4 text-slate-400" /> {selectedEvent.date}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                {selectedEvent.allDay ? 'All day' : `${selectedEvent.start} – ${selectedEvent.end}`}
              </p>
              {selectedEvent.location && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" /> {selectedEvent.location}
                </p>
              )}
              {selectedEvent.videoLink && (
                <a
                  href={selectedEvent.videoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sky-600 hover:underline"
                >
                  <Video className="h-4 w-4" />
                  <span className="truncate">{selectedEvent.videoLink}</span>
                </a>
              )}
              {selectedEvent.notes && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <FileText className="h-3.5 w-3.5" /> Notes
                  </p>
                  <p className="mt-1 text-slate-700">{selectedEvent.notes}</p>
                </div>
              )}
            </div>

            {/* Participants / invites */}
            {selectedEvent.participants.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <Users className="h-3.5 w-3.5" /> Participants
                </p>
                <ul className="space-y-2">
                  {selectedEvent.participants.map((p) => (
                    <li key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.role}</p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
                          p.status === 'accepted' && 'bg-emerald-50 text-emerald-700',
                          p.status === 'pending' && 'bg-amber-50 text-amber-700',
                          p.status === 'declined' && 'bg-rose-50 text-rose-700',
                          p.status === 'tentative' && 'bg-sky-50 text-sky-700'
                        )}
                      >
                        {p.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Accept / decline if pending invites exist */}
            {selectedEvent.participants.some((p) => p.status === 'pending') && !selectedEvent.isAvailabilityBlock && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">Respond to invite</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => respondInvite(selectedEvent.id, 'accepted')}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <Check className="h-3.5 w-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => respondInvite(selectedEvent.id, 'tentative')}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    Tentative
                  </button>
                  <button
                    onClick={() => respondInvite(selectedEvent.id, 'declined')}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Decline / Not available
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              {selectedEvent.videoLink && (
                <a
                  href={selectedEvent.videoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  <Video className="h-4 w-4" /> Join video
                </a>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {createMode === 'unavailable' ? 'Mark unavailable' : 'New event'}
              </h3>
              <button onClick={() => setShowCreate(false)} className="rounded p-1 hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder={createMode === 'unavailable' ? 'e.g. Annual leave / blocked' : 'Event title'}
                />
              </div>

              {createMode === 'event' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    {(Object.keys(TYPE_META) as EventType[])
                      .filter((t) => t !== 'unavailable')
                      .map((t) => (
                        <option key={t} value={t}>{TYPE_META[t].label}</option>
                      ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Start</label>
                  <input
                    type="time"
                    value={form.start}
                    disabled={form.allDay}
                    onChange={(e) => setForm({ ...form, start: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">End</label>
                  <input
                    type="time"
                    value={form.end}
                    disabled={form.allDay}
                    onChange={(e) => setForm({ ...form, end: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.allDay}
                  onChange={(e) => setForm({ ...form, allDay: e.target.checked })}
                  className="rounded accent-teal-600"
                />
                All-day event
              </label>

              {createMode === 'event' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Location</label>
                    <input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Room, clinic, virtual…"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Video className="h-3.5 w-3.5" /> Video conference link
                    </label>
                    <input
                      value={form.videoLink}
                      onChange={(e) => setForm({ ...form, videoLink: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="https://meet.unitachealth.co.za/…"
                    />
                  </div>

                  {/* Share with users */}
                  <div>
                    <label className="mb-2 flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Share2 className="h-3.5 w-3.5" /> Invite / share with
                    </label>
                    <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
                      {DIRECTORY.map((u) => (
                        <label
                          key={u.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50',
                            form.participantIds.includes(u.id) && 'bg-teal-50'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={form.participantIds.includes(u.id)}
                            onChange={() => toggleParticipant(u.id)}
                            className="rounded accent-teal-600"
                          />
                          <span className="font-medium text-slate-800">{u.name}</span>
                          <span className="text-xs text-slate-400">{u.role}</span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Selected users receive an invite (accept / decline / not available).
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Agenda, reason for unavailability, prep notes…"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={createEvent}
                className={cn(
                  'flex-1 rounded-xl py-2.5 text-sm font-semibold text-white',
                  createMode === 'unavailable' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-600 hover:bg-teal-700'
                )}
              >
                {createMode === 'unavailable' ? 'Block time' : 'Create & send invites'}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
