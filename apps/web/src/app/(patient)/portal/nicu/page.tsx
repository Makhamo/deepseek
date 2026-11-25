'use client';

import { useState } from 'react';
import { Baby, Heart, Thermometer, Wind, Droplets, Utensils, MessageSquare, Calendar, Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const BABY = {
  name: 'Baby Ndlovu',
  ga: '34+6 weeks',
  weight: '2.05 kg',
  weightTrend: '+55 g since yesterday',
  bed: 'Bed 7 – NICU',
  status: 'improving',
  parent: 'Thandi Ndlovu',
  verified: true,
  vitals: { hr: 136, rr: 38, spo2: 98, temp: 36.6, last: '18 min ago' },
  feeding: 'Breastfeeding + top-up formula',
  nextFeed: 'in 45 min',
  conditions: ['Mild jaundice – under observation'],
  updates: [
    { time: 'Today 14:20', author: 'Nurse P. Sithole', text: 'Weight up 55 g from yesterday. Feeding well and looking more alert.', published: true },
    { time: 'Today 09:15', author: 'Nurse P. Sithole', text: 'Phototherapy has been stopped. Bilirubin is coming down. Baby is stable.', published: true },
    { time: 'Yesterday 18:40', author: 'Dr. L. Mokoena', text: 'Stable overnight. No apnoeas. Continue current feeding plan.', published: true },
  ],
  notifications: [
    { id: 1, text: 'New update available for Baby Ndlovu', time: '2 h ago', read: false },
  ],
};

export default function PatientNicuPage() {
  const [tab, setTab] = useState<'overview' | 'vitals' | 'feeding' | 'updates'>('overview');
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My baby</h2>
          <p className="text-slate-500">Approved NICU updates for {BABY.name}</p>
        </div>
      </div>

      {/* Status banner */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600">
            <Baby className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-emerald-900">{BABY.name}</p>
            <p className="text-sm text-emerald-700">GA {BABY.ga} · {BABY.weight} · {BABY.bed}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 capitalize">
                {BABY.status}
              </span>
              {BABY.verified && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-700">
                  <Shield className="h-3 w-3" /> Verified parent access
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {(['overview', 'vitals', 'feeding', 'updates'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium capitalize transition',
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <Heart className="h-5 w-5 text-rose-500" />
              <p className="mt-2 text-xl font-bold">{BABY.vitals.hr}</p>
              <p className="text-xs text-slate-500">Heart rate</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <Droplets className="h-5 w-5 text-teal-500" />
              <p className="mt-2 text-xl font-bold">{BABY.vitals.spo2}%</p>
              <p className="text-xs text-slate-500">Oxygen</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Weight</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{BABY.weight}</p>
            <p className="text-xs text-emerald-600">{BABY.weightTrend}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Conditions (approved)</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {BABY.conditions.map((c) => (
                <span key={c} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-800">{c}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium flex items-center justify-center gap-1">
              <MessageSquare className="h-4 w-4" /> Message care team
            </button>
            <button className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium flex items-center justify-center gap-1">
              <Calendar className="h-4 w-4" /> Visit schedule
            </button>
          </div>
          <p className="text-xs text-slate-400">Only approved updates are shown. For urgent concerns please contact the NICU directly.</p>
        </div>
      )}

      {tab === 'vitals' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Last updated {BABY.vitals.last}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Heart, label: 'Heart rate', value: BABY.vitals.hr, unit: 'bpm', color: 'text-rose-500' },
              { icon: Wind, label: 'Resp rate', value: BABY.vitals.rr, unit: '/min', color: 'text-sky-500' },
              { icon: Droplets, label: 'SpO₂', value: BABY.vitals.spo2, unit: '%', color: 'text-teal-500' },
              { icon: Thermometer, label: 'Temperature', value: BABY.vitals.temp, unit: '°C', color: 'text-amber-500' },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.label} className="rounded-xl border border-slate-200 bg-white p-4">
                  <Icon className={cn('h-5 w-5', v.color)} />
                  <p className="mt-2 text-xl font-bold">{v.value}<span className="text-sm font-normal text-slate-500"> {v.unit}</span></p>
                  <p className="text-xs text-slate-500">{v.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'feeding' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Utensils className="h-4 w-4 text-teal-600" /> Feeding plan
            </div>
            <p className="mt-2 text-sm text-slate-700">{BABY.feeding}</p>
            <p className="mt-2 text-xs text-slate-500">Next feed {BABY.nextFeed}</p>
          </div>
        </div>
      )}

      {tab === 'updates' && (
        <div className="space-y-3">
          {BABY.updates.map((u, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">{u.time}</p>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> Published
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-800">{u.text}</p>
              <p className="mt-1 text-xs text-slate-500">{u.author}</p>
            </div>
          ))}
        </div>
      )}

      {notifOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <button onClick={() => setNotifOpen(false)}>✕</button>
            </div>
            <div className="mt-3 space-y-2">
              {BABY.notifications.map((n) => (
                <div key={n.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p>{n.text}</p>
                  <p className="text-xs text-slate-400">{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}