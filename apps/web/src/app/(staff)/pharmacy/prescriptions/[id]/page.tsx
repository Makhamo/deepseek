'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Pill, User, Phone, MapPin, Mail, AlertTriangle, Shield,
  CheckCircle2, Clock, Package, Truck, MessageSquare, Calendar,
  ClipboardCheck, Ban, RotateCcw, FileText, Activity, Navigation,
  Stethoscope, Hash, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  RX_SEED,
  FLOW,
  STATUS_META,
  nextStatus,
  type Rx,
  type Status,
  type Fulfillment,
} from '@/lib/pharmacy-rx';

export default function PrescriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params.id as string) || '';

  const [rx, setRx] = useState<Rx | null>(() => RX_SEED.find((r) => r.id === id) ?? null);
  const [tab, setTab] = useState<'overview' | 'clinical' | 'fulfillment' | 'timeline'>('overview');

  const advance = (to?: Status) => {
    if (!rx) return;
    const target = to || nextStatus(rx.status, rx.fulfillment);
    if (!target) return;
    setRx({
      ...rx,
      status: target,
      timeline: [
        ...rx.timeline,
        {
          at: new Date().toISOString().slice(0, 16).replace('T', ' '),
          by: 'Pharm. K. Botha',
          action: `Moved to ${STATUS_META[target].label}`,
        },
      ],
    });
  };

  const hold = () => {
    if (!rx) return;
    setRx({
      ...rx,
      status: 'on_hold',
      timeline: [
        ...rx.timeline,
        {
          at: new Date().toISOString().slice(0, 16).replace('T', ' '),
          by: 'Pharm. K. Botha',
          action: 'Placed on hold',
        },
      ],
    });
  };

  const releaseHold = () => {
    if (!rx) return;
    setRx({
      ...rx,
      status: 'clinical_check',
      timeline: [
        ...rx.timeline,
        {
          at: new Date().toISOString().slice(0, 16).replace('T', ' '),
          by: 'Pharm. K. Botha',
          action: 'Released from hold → clinical check',
        },
      ],
    });
  };

  const setFulfillment = (f: Fulfillment) => {
    if (!rx) return;
    setRx({ ...rx, fulfillment: f });
  };

  if (!rx) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-16 text-center">
        <p className="text-lg font-semibold text-slate-900">Prescription not found</p>
        <p className="text-sm text-slate-500">No record for <span className="font-mono">{id}</span>.</p>
        <Link href="/pharmacy/prescriptions" className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to prescriptions
        </Link>
      </div>
    );
  }

  const step = STATUS_META[rx.status].step;
  const nxt = nextStatus(rx.status, rx.fulfillment);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Breadcrumb / back */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/pharmacy/prescriptions"
            className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All prescriptions
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{rx.id}</h1>
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_META[rx.status].color)}>
              {STATUS_META[rx.status].label}
            </span>
            {rx.priority !== 'normal' && (
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase',
                  rx.priority === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                )}
              >
                {rx.priority}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-500">
            {rx.patient} · {rx.mrn} · Received {rx.date}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {rx.status === 'on_hold' ? (
            <button
              type="button"
              onClick={releaseHold}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" /> Release hold
            </button>
          ) : (
            !['collected', 'delivered', 'cancelled'].includes(rx.status) && (
              <button
                type="button"
                onClick={hold}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
              >
                <Ban className="h-4 w-4" /> Put on hold
              </button>
            )
          )}
          {nxt && (
            <button
              type="button"
              onClick={() => advance()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Advance to {STATUS_META[nxt].label}
            </button>
          )}
        </div>
      </div>

      {/* Lifecycle stepper */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Lifecycle</p>
        <div className="flex flex-wrap items-center gap-1">
          {FLOW.slice(0, 7).map((s, i) => {
            const meta = STATUS_META[s];
            const active = rx.status === s;
            const done = step >= meta.step && step >= 0;
            return (
              <div key={s} className="flex items-center gap-1">
                <span
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[11px] font-semibold',
                    active && 'bg-teal-600 text-white shadow-md shadow-teal-600/20',
                    !active && done && 'bg-teal-50 text-teal-800',
                    !active && !done && 'bg-slate-100 text-slate-500'
                  )}
                >
                  {meta.label}
                </span>
                {i < 6 && <span className="mx-0.5 hidden text-slate-300 sm:inline">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {(
          [
            { id: 'overview' as const, label: 'Overview' },
            { id: 'clinical' as const, label: 'Clinical' },
            { id: 'fulfillment' as const, label: 'Fulfillment' },
            { id: 'timeline' as const, label: 'Timeline' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'border-b-2 px-4 py-2.5 text-sm font-medium transition',
              tab === t.id
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Medication card */}
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Pill className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-slate-900">
                    {rx.drug}{' '}
                    <span className="font-semibold text-slate-600">{rx.strength}</span>
                  </h2>
                  <p className="text-sm text-slate-500">
                    {rx.form} · Qty {rx.qty} · {rx.daysSupply} days supply · {rx.refills} refills
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
                  Directions (SIG)
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">{rx.sig}</p>
                {rx.description && (
                  <>
                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-teal-700">
                      Product information & counselling
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">{rx.description}</p>
                  </>
                )}
              </div>

              {rx.notes && (
                <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Internal notes</p>
                    <p className="mt-0.5">{rx.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Prescriber + diagnosis */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <Stethoscope className="h-3.5 w-3.5" /> Prescriber
                </p>
                <p className="font-semibold text-slate-900">{rx.doctor}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <Building2 className="h-3.5 w-3.5" /> {rx.facility}
                </p>
                {rx.diagnosis && (
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <span className="text-xs font-medium text-slate-400">Diagnosis · </span>
                    {rx.diagnosis}
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <Activity className="h-3.5 w-3.5" /> Quick actions
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/pharmacy/messages?with=${rx.doctorId}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <MessageSquare className="h-4 w-4 text-teal-600" /> Message doctor
                  </Link>
                  <Link
                    href={`/pharmacy/messages?with=${rx.patientId}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <MessageSquare className="h-4 w-4 text-sky-600" /> Notify patient
                  </Link>
                  <Link
                    href="/pharmacy/dispensing"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Package className="h-4 w-4 text-amber-600" /> Open dispensing
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Patient card */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <User className="h-3.5 w-3.5" /> Patient
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {rx.patient
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{rx.patient}</p>
                  <p className="text-xs text-slate-500">
                    {rx.age} yrs · {rx.mrn}
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" /> {rx.phone}
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" /> {rx.email}
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> {rx.address}
                </li>
              </ul>
            </div>

            <div
              className={cn(
                'rounded-2xl border p-5',
                rx.allergies.toLowerCase().includes('none')
                  ? 'border-slate-200 bg-white'
                  : 'border-rose-200 bg-rose-50'
              )}
            >
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Shield className="h-3.5 w-3.5" /> Allergies
              </p>
              <p
                className={cn(
                  'text-sm font-medium',
                  rx.allergies.toLowerCase().includes('none') ? 'text-slate-700' : 'text-rose-800'
                )}
              >
                {rx.allergies}
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'clinical' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <ClipboardCheck className="h-4 w-4 text-teal-600" /> Clinical check
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium text-slate-400">Indication / diagnosis</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{rx.diagnosis || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Directions</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{rx.sig}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Product counselling</dt>
                <dd className="mt-0.5 text-slate-700">{rx.description || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Days supply / refills</dt>
                <dd className="mt-0.5 text-slate-900">
                  {rx.daysSupply} days · {rx.refills} refills remaining
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Safety
            </h3>
            <div className="mt-4 space-y-3">
              <div
                className={cn(
                  'rounded-xl p-3 text-sm',
                  rx.allergies.toLowerCase().includes('none')
                    ? 'bg-slate-50 text-slate-700'
                    : 'bg-rose-50 text-rose-800'
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Allergies</p>
                <p className="mt-1 font-medium">{rx.allergies}</p>
              </div>
              {rx.interactions.length > 0 ? (
                <ul className="space-y-2">
                  {rx.interactions.map((ix, i) => (
                    <li
                      key={i}
                      className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      {ix}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  No significant interactions flagged.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'fulfillment' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">Fulfillment method</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(['collection', 'delivery'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFulfillment(f)}
                  className={cn(
                    'rounded-xl border px-4 py-4 text-left transition',
                    rx.fulfillment === f
                      ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  {f === 'collection' ? (
                    <Package className="mb-2 h-5 w-5 text-teal-600" />
                  ) : (
                    <Truck className="mb-2 h-5 w-5 text-sky-600" />
                  )}
                  <p className="font-semibold capitalize text-slate-900">{f}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {f === 'collection' ? 'Patient collects at counter' : 'Home / ward delivery'}
                  </p>
                </button>
              ))}
            </div>

            {rx.fulfillment === 'delivery' && (
              <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
                <p className="flex items-center gap-1.5 font-semibold">
                  <Navigation className="h-4 w-4" /> Delivery address
                </p>
                <p className="mt-1">{rx.address}</p>
                <p className="mt-1 text-sky-700">{rx.phone}</p>
                {rx.status === 'ready' && (
                  <button
                    type="button"
                    onClick={() => advance('out_for_delivery')}
                    className="mt-3 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                  >
                    Mark out for delivery
                  </button>
                )}
              </div>
            )}

            {rx.fulfillment === 'collection' && rx.status === 'ready' && (
              <button
                type="button"
                onClick={() => advance('collected')}
                className="mt-4 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Mark collected
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">Label preview</h3>
            <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-700">
              <p className="font-bold text-slate-900">{rx.patient.toUpperCase()}</p>
              <p>{rx.mrn}</p>
              <p className="mt-2 font-bold">
                {rx.drug.toUpperCase()} {rx.strength}
              </p>
              <p>
                {rx.form} · Qty {rx.qty}
              </p>
              <p className="mt-2">{rx.sig}</p>
              <p className="mt-2 text-slate-500">
                Dr {rx.doctor.replace('Dr. ', '')} · {rx.date.slice(0, 10)}
              </p>
              <p className="mt-1 text-slate-500">Keep out of reach of children</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <Clock className="h-4 w-4 text-teal-600" /> Activity timeline
          </h3>
          <ol className="relative space-y-0 border-l-2 border-slate-100 pl-6">
            {[...rx.timeline].reverse().map((t, i) => (
              <li key={i} className="relative pb-6 last:pb-0">
                <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-teal-500" />
                <p className="text-sm font-medium text-slate-900">{t.action}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {t.by} · {t.at}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
