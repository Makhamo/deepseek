'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import {
  Calendar, Activity, MessageSquare, FlaskConical, Pill, Video, MapPin,
  AlertTriangle, FileText, HeartPulse, ArrowRight,
} from 'lucide-react';
import {
  SEED_APPOINTMENTS, SEED_MEDICINES, SEED_RESULTS, SEED_DOCUMENTS, DOCTORS, HEALTH_SUMMARY,
} from '@/lib/patient-data';

const TILES = [
  { href: '/portal/appointments', title: 'Book a visit', desc: 'Find a time that works', icon: Calendar, tone: 'bg-amber-50 text-amber-600' },
  { href: '/portal/triage', title: 'How am I feeling?', desc: 'Check symptoms safely', icon: Activity, tone: 'bg-teal-50 text-teal-600' },
  { href: '/portal/messages', title: 'Message my care team', desc: 'Ask a non-urgent question', icon: MessageSquare, tone: 'bg-sky-50 text-sky-600' },
  { href: '/portal/lab', title: 'See my results', desc: 'Verified tests and reports', icon: FlaskConical, tone: 'bg-violet-50 text-violet-600' },
];

const STATUS_LABEL: Record<string, string> = {
  ready: 'Ready', dispensed: 'Dispensed', delivered: 'Delivered', processing: 'Processing',
};

export default function PatientHomePage() {
  const { data: session, isPending } = authClient.useSession();
  const [firstName, setFirstName] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    fetch('/api/patients/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const profile = data?.patientProfile;
        if (profile?.firstName) setFirstName(profile.firstName);
        else if (session.user.name) setFirstName(session.user.name.split(' ')[0]);
      })
      .catch(() => {
        if (session.user?.name) setFirstName(session.user.name.split(' ')[0]);
      })
      .finally(() => setProfileLoading(false));
  }, [session?.user, isPending]);

  const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });
  const upcoming = SEED_APPOINTMENTS.filter((a) => a.status === 'confirmed' || a.status === 'pending');
  const next = upcoming[0];
  const readyResults = SEED_RESULTS.filter((r) => r.status === 'ready');
  const latestResult = readyResults[0];
  const careTeam = DOCTORS.filter((d) => upcoming.some((a) => a.doctor === d.name));
  const [nextDay = '', nextMonthRaw = ''] = next ? next.date.split(' ') : [];
  const nextMonth = nextMonthRaw.toUpperCase();
  const greetingName = profileLoading ? '' : (firstName || session?.user?.name?.split(' ')[0] || 'there');

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-xs font-medium text-teal-600">{today}</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          {profileLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
              Loading your profile…
            </span>
          ) : (
            <>Good afternoon, {greetingName}</>
          )}
        </h2>
        <p className="mt-1 text-sm text-slate-500">Here’s what’s happening with your health today.</p>
      </div>

      {/* Hero */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
              <HeartPulse className="h-3.5 w-3.5" /> Your health today
            </span>
            <h3 className="mt-4 text-3xl font-bold text-slate-900">Care that fits around your day.</h3>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Book a visit, ask your care team a question, or pick up where you left off. We’ll keep the clinical details tidy.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {TILES.map((t) => {
                const Icon = t.icon;
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="rounded-2xl border border-slate-200 p-4 transition hover:border-teal-200 hover:shadow-md"
                  >
                    <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${t.tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                    <p className="text-xs text-slate-500">{t.desc}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden min-h-[260px] rounded-3xl bg-slate-50 lg:block">
            {next && (
              <div className="absolute left-5 top-5 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <p className="text-[10px] font-medium uppercase text-slate-400">Next visit</p>
                <p className="text-sm font-semibold text-slate-900">{next.date}</p>
              </div>
            )}
            <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg">
              <HeartPulse className="h-10 w-10" />
            </div>
            <div className="absolute bottom-5 right-5 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <p className="text-[10px] font-medium uppercase text-slate-400">Medicines</p>
              <p className="text-sm font-semibold text-slate-900">{SEED_MEDICINES.length} on your list</p>
            </div>
          </div>
        </div>
      </section>

      {/* Next visit + Your health */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Coming up</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Your next visit</h3>
            </div>
            <Link href="/portal/appointments" className="text-xs font-medium text-teal-600 hover:underline">All visits</Link>
          </div>
          {next ? (
            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-teal-600 text-white">
                <span className="text-[10px] font-semibold">{nextMonth}</span>
                <span className="text-2xl font-bold leading-none">{nextDay}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{next.reason}</p>
                <p className="text-sm text-slate-500">{next.date} · {next.time}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  {next.type === 'Video' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                  {next.type === 'Video' ? 'Video visit' : 'In-person visit'} with {next.doctor}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/portal/appointments" className="rounded-lg bg-teal-600 px-4 py-1.5 text-center text-xs font-semibold text-white hover:bg-teal-700">View</Link>
                <Link href="/portal/messages" className="rounded-lg border border-slate-200 px-4 py-1.5 text-center text-xs font-medium text-slate-700 hover:bg-slate-50">Message</Link>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">
              You have no upcoming visits. <Link href="/portal/appointments" className="font-medium text-teal-600 hover:underline">Book a visit</Link>
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">At a glance</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Your health</h3>
            </div>
            <Link href="/portal/settings?tab=medical" className="text-xs font-medium text-teal-600 hover:underline">Edit</Link>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between"><dt className="text-slate-500">Blood type</dt><dd className="font-medium text-slate-900">{HEALTH_SUMMARY.bloodType}</dd></div>
            <div className="flex items-center justify-between"><dt className="text-slate-500">Allergies</dt><dd className="font-medium text-slate-900">{HEALTH_SUMMARY.allergies}</dd></div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Conditions</dt>
              <dd className="flex flex-wrap justify-end gap-1">
                {HEALTH_SUMMARY.conditions.map((c) => (
                  <span key={c} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">{c}</span>
                ))}
              </dd>
            </div>
            <div className="flex items-center justify-between"><dt className="text-slate-500">Emergency contacts</dt><dd className="font-medium text-slate-900">{HEALTH_SUMMARY.emergencyContacts}</dd></div>
          </dl>
          <Link href="/portal/settings" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline">
            Update my details <ArrowRight className="h-3 w-3" />
          </Link>
        </section>
      </div>

      {/* Medicines / Test results / Care team */}
      <div className="grid gap-6 md:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Medicines</h3>
            <Link href="/portal/prescriptions" className="text-xs font-medium text-teal-600 hover:underline">See all</Link>
          </div>
          <ul className="mt-4 space-y-3">
            {SEED_MEDICINES.slice(0, 2).map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Pill className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.quantity}</p>
                </div>
                <span className="text-[10px] font-medium uppercase text-slate-400">{STATUS_LABEL[m.status]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Test results</h3>
            <Link href="/portal/lab" className="text-xs font-medium text-teal-600 hover:underline">See all</Link>
          </div>
          {latestResult ? (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><FlaskConical className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{latestResult.name}</p>
                <p className="text-xs text-slate-500">{latestResult.summary}</p>
              </div>
              <span className="text-[10px] text-slate-400">{latestResult.completed}</span>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No results yet.</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Your care team</h3>
            <Link href="/portal/doctors" className="text-xs font-medium text-teal-600 hover:underline">Find a doctor</Link>
          </div>
          {careTeam.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {careTeam.map((d) => (
                <li key={d.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                    {d.name.replace('Dr. ', '').split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{d.name}</p>
                    <p className="text-xs text-slate-500">{d.specialty}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="mt-4 text-sm text-slate-500">Your care team will be assigned after your first visit request.</p>
              <Link href="/portal/appointments" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline">
                Request a visit <ArrowRight className="h-3 w-3" />
              </Link>
            </>
          )}
        </section>
      </div>

      {/* Emergency banner */}
      <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">Need help right now?</p>
          <p className="text-sm text-slate-600">
            For chest pain, difficulty breathing, severe bleeding or fainting, call 10177 or 112. For anything else, your care team is here.
          </p>
        </div>
        <Link href="/portal/triage" className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50">
          Check my symptoms <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Recent documents */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <FileText className="h-3.5 w-3.5" />
        <span>Recent documents:</span>
        {SEED_DOCUMENTS.slice(0, 2).map((d) => (
          <Link key={d.id} href="/portal/documents" className="font-medium text-slate-700 hover:text-teal-700">{d.name}</Link>
        ))}
        <Link href="/portal/documents" className="font-medium text-teal-600 hover:underline">View all</Link>
      </div>
    </div>
  );
}