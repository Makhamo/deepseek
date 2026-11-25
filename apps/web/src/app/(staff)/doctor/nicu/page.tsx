'use client';

import { useState } from 'react';
import { Baby, Activity, AlertTriangle, Clock, ChevronRight, Plus, Heart, Thermometer, Wind, Droplets, Utensils, FileText, MessageSquare, Shield, Users, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Infant = {
  id: string;
  name: string;
  birthOrder?: number;
  ga: string;
  weight: string;
  weightTrend: string;
  bed: string;
  status: 'stable' | 'critical' | 'improving' | 'discharged';
  alerts: number;
  parent: string;
  parentVerified: boolean;
  parentPhone: string;
  vitals: { hr: number; rr: number; spo2: number; temp: number; bp?: string; last: string };
  feeding: string;
  conditions: string[];
  internalNotes: string;
  familyUpdate: string;
  lastUpdateBy: string;
  lastUpdateAt: string;
  criticalTasks: { id: string; title: string; due: string; status: 'notified' | 'acknowledged' }[];
};

const INFANTS: Infant[] = [
  {
    id: 'NICU-03',
    name: 'Baby Molefe (Twin A)',
    birthOrder: 1,
    ga: '32+4',
    weight: '1.68 kg',
    weightTrend: '+40g',
    bed: 'Bed 3',
    status: 'stable',
    alerts: 0,
    parent: 'Lerato Molefe',
    parentVerified: true,
    parentPhone: '+27 72 111 2233',
    vitals: { hr: 142, rr: 42, spo2: 97, temp: 36.8, last: '12 min ago' },
    feeding: 'NG 8 ml q3h – tolerating',
    conditions: ['Prematurity', 'RDS – resolving'],
    internalNotes: 'Twin B in Bed 4. Plan for phototherapy if bilirubin rises.',
    familyUpdate: 'Baby is stable and feeding well. Weight is increasing.',
    lastUpdateBy: 'Nurse P. Sithole',
    lastUpdateAt: 'Today 14:20',
    criticalTasks: [],
  },
  {
    id: 'NICU-05',
    name: 'Baby Patel',
    ga: '28+1',
    weight: '1.12 kg',
    weightTrend: '–20g',
    bed: 'Bed 5',
    status: 'critical',
    alerts: 2,
    parent: 'Aisha Patel',
    parentVerified: true,
    parentPhone: '+27 71 222 3344',
    vitals: { hr: 168, rr: 58, spo2: 89, temp: 37.2, bp: '48/28', last: '4 min ago' },
    feeding: 'NPO – TPN',
    conditions: ['Extreme prematurity', 'Apnoea of prematurity', 'On CPAP'],
    internalNotes: 'Desaturation episode at 13:40. Increased FiO2 to 30%. Awaiting blood gas.',
    familyUpdate: 'Baby is receiving extra breathing support. The team is monitoring closely.',
    lastUpdateBy: 'Dr. L. Mokoena',
    lastUpdateAt: 'Today 13:55',
    criticalTasks: [
      { id: 'CT-12', title: 'Acknowledge critical blood gas', due: '15 min', status: 'notified' },
    ],
  },
  {
    id: 'NICU-07',
    name: 'Baby Ndlovu',
    ga: '34+6',
    weight: '2.05 kg',
    weightTrend: '+55g',
    bed: 'Bed 7',
    status: 'improving',
    alerts: 0,
    parent: 'Thandi Ndlovu',
    parentVerified: true,
    parentPhone: '+27 82 123 4567',
    vitals: { hr: 136, rr: 38, spo2: 98, temp: 36.6, last: '18 min ago' },
    feeding: 'Breast + top-up',
    conditions: ['Mild jaundice'],
    internalNotes: 'Phototherapy stopped. Bilirubin trending down. Plan for rooming-in tomorrow.',
    familyUpdate: 'Jaundice is improving. Baby is feeding well and gaining weight.',
    lastUpdateBy: 'Nurse P. Sithole',
    lastUpdateAt: 'Today 09:15',
    criticalTasks: [],
  },
];

export default function DoctorNicuPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'vitals' | 'feeding' | 'notes' | 'family' | 'tasks'>('overview');
  const detail = INFANTS.find((i) => i.id === selected);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">NICU</h2>
          <p className="text-slate-500">Neonatal admissions, observations, family updates and critical tasks.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
          <Plus className="h-4 w-4" /> New admission
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
          <p className="text-2xl font-bold text-rose-700">{INFANTS.filter(i => i.status === 'critical').length}</p>
          <p className="text-xs text-rose-600">Critical</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{INFANTS.reduce((a, i) => a + i.criticalTasks.length, 0)}</p>
          <p className="text-xs text-amber-600">Open critical tasks</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{INFANTS.filter(i => i.status === 'stable' || i.status === 'improving').length}</p>
          <p className="text-xs text-emerald-600">Stable / improving</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{INFANTS.length}</p>
          <p className="text-xs text-slate-500">Active admissions</p>
        </div>
      </div>

      <div className="space-y-3">
        {INFANTS.map((i) => (
          <button
            key={i.id}
            onClick={() => { setSelected(i.id); setTab('overview'); }}
            className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:shadow-md"
          >
            <div className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              i.status === 'critical' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
            )}>
              <Baby className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{i.id}</span>
                {i.birthOrder && <span className="text-[10px] text-slate-400">Twin {i.birthOrder}</span>}
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                  i.status === 'critical' ? 'bg-rose-100 text-rose-700' :
                  i.status === 'improving' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                )}>{i.status}</span>
                {i.criticalTasks.length > 0 && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">{i.criticalTasks.length} task</span>
                )}
              </div>
              <p className="mt-1 font-semibold text-slate-900">{i.name}</p>
              <p className="text-sm text-slate-600">GA {i.ga} · {i.weight} ({i.weightTrend}) · {i.bed}</p>
              <p className="mt-1 text-xs text-slate-500">Parent: {i.parent} {i.parentVerified && <span className="text-emerald-600">· verified</span>}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300" />
          </button>
        ))}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="font-mono text-xs text-slate-400">{detail.id} {detail.birthOrder && `· Twin ${detail.birthOrder}`}</p>
                <h3 className="font-semibold text-slate-900">{detail.name}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="rounded p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex border-b border-slate-100 px-2 overflow-x-auto">
              {(['overview', 'vitals', 'feeding', 'notes', 'family', 'tasks'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'whitespace-nowrap px-3 py-2.5 text-sm font-medium capitalize',
                    tab === t ? 'border-b-2 border-teal-600 text-teal-700' : 'text-slate-500'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {tab === 'overview' && (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-slate-400">Gestational age</p><p className="font-medium">{detail.ga}</p></div>
                    <div><p className="text-xs text-slate-400">Weight</p><p className="font-medium">{detail.weight} <span className="text-emerald-600">{detail.weightTrend}</span></p></div>
                    <div><p className="text-xs text-slate-400">Bed</p><p className="font-medium">{detail.bed}</p></div>
                    <div><p className="text-xs text-slate-400">Status</p><p className="font-medium capitalize">{detail.status}</p></div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-400">Parent / guardian</p>
                      {detail.parentVerified && <span className="flex items-center gap-1 text-[10px] text-emerald-600"><Shield className="h-3 w-3" /> verified</span>}
                    </div>
                    <p className="mt-1 font-medium">{detail.parent}</p>
                    <p className="text-slate-500">{detail.parentPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Conditions</p>
                    <div className="flex flex-wrap gap-1">
                      {detail.conditions.map((c) => (
                        <span key={c} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-800">{c}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {tab === 'vitals' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">Last recorded {detail.vitals.last}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 p-3"><Heart className="h-4 w-4 text-rose-500" /><p className="mt-1 text-lg font-bold">{detail.vitals.hr}</p><p className="text-xs text-slate-500">Heart rate</p></div>
                    <div className="rounded-xl border border-slate-200 p-3"><Wind className="h-4 w-4 text-sky-500" /><p className="mt-1 text-lg font-bold">{detail.vitals.rr}</p><p className="text-xs text-slate-500">Resp rate</p></div>
                    <div className="rounded-xl border border-slate-200 p-3"><Droplets className="h-4 w-4 text-teal-500" /><p className="mt-1 text-lg font-bold">{detail.vitals.spo2}%</p><p className="text-xs text-slate-500">SpO₂</p></div>
                    <div className="rounded-xl border border-slate-200 p-3"><Thermometer className="h-4 w-4 text-amber-500" /><p className="mt-1 text-lg font-bold">{detail.vitals.temp}°C</p><p className="text-xs text-slate-500">Temp</p></div>
                    {detail.vitals.bp && <div className="rounded-xl border border-slate-200 p-3 col-span-2"><Activity className="h-4 w-4 text-violet-500" /><p className="mt-1 text-lg font-bold">{detail.vitals.bp}</p><p className="text-xs text-slate-500">Blood pressure</p></div>}
                  </div>
                  <button className="w-full rounded-xl border border-slate-200 py-2 text-sm font-medium">Record new vitals</button>
                </div>
              )}

              {tab === 'feeding' && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium"><Utensils className="h-4 w-4 text-teal-600" /> Current plan</div>
                    <p className="mt-2 text-sm text-slate-700">{detail.feeding}</p>
                  </div>
                  <button className="w-full rounded-xl border border-slate-200 py-2 text-sm font-medium">Update feeding schedule</button>
                </div>
              )}

              {tab === 'notes' && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-50 p-4 text-sm">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Internal clinical notes (not published)</p>
                    <p className="text-slate-700">{detail.internalNotes}</p>
                  </div>
                  <textarea rows={3} placeholder="Add internal note…" className="w-full rounded-lg border border-slate-200 p-3 text-sm" />
                  <button className="w-full rounded-xl bg-teal-600 py-2 text-sm font-semibold text-white">Save note</button>
                </div>
              )}

              {tab === 'family' && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                    <p className="text-xs font-semibold text-emerald-800 mb-1">Published to family</p>
                    <p className="text-emerald-900">{detail.familyUpdate}</p>
                    <p className="mt-2 text-xs text-emerald-700">{detail.lastUpdateBy} · {detail.lastUpdateAt}</p>
                  </div>
                  <textarea rows={3} placeholder="Write family-facing update…" className="w-full rounded-lg border border-slate-200 p-3 text-sm" />
                  <button className="w-full rounded-xl bg-teal-600 py-2 text-sm font-semibold text-white">Publish update</button>
                  <p className="text-xs text-slate-400">Only approved content is visible to the parent. Internal notes stay private.</p>
                </div>
              )}

              {tab === 'tasks' && (
                <div className="space-y-3">
                  {detail.criticalTasks.length === 0 && <p className="text-sm text-slate-500">No open critical tasks.</p>}
                  {detail.criticalTasks.map((t) => (
                    <div key={t.id} className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                      <p className="font-medium text-rose-900">{t.title}</p>
                      <p className="text-xs text-rose-700">Due in {t.due} · {t.status}</p>
                      <button className="mt-2 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">Acknowledge</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-4 flex gap-2">
              <button className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium flex items-center justify-center gap-1">
                <MessageSquare className="h-4 w-4" /> Message parent
              </button>
              <button className="flex-1 rounded-xl bg-teal-600 py-2 text-sm font-semibold text-white">Update status</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
