'use client';

import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

export default function MyDoctorPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-teal-600">Care team</p>
          <h2 className="text-3xl font-bold text-slate-900">My doctor</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your primary clinician, plus access to every doctor in the Unitac network.
          </p>
        </div>
        <Link
          href="/portal/doctors"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Stethoscope className="h-4 w-4 text-teal-600" /> Find a doctor
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Stethoscope className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-900">You don&apos;t have a doctor assigned yet</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            A clinician is assigned after your first visit request. You can still use the symptom checker and book an
            appointment.
          </p>
          <Link
            href="/portal/appointments"
            className="mt-5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Request a visit
          </Link>
        </div>
      </div>
    </div>
  );
}