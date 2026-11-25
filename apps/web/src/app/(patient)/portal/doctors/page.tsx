'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DOCTORS } from '@/lib/patient-data';

const initials = (name: string) =>
  name.replace('Dr. ', '').replace('Dr ', '').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function FindDoctorPage() {
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('All specialties');

  const specialties = useMemo(
    () => ['All specialties', ...Array.from(new Set(DOCTORS.map((d) => d.specialty)))],
    []
  );

  const results = DOCTORS.filter((d) => {
    const matchesSpecialty = specialty === 'All specialties' || d.specialty === specialty;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || [d.name, d.specialty, d.facility].some((v) => v.toLowerCase().includes(q));
    return matchesSpecialty && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-medium text-teal-600">Care marketplace</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Find a doctor</h2>
        <p className="mt-1 text-sm text-slate-500">
          {DOCTORS.length} clinicians across the network. Search, then request a visit at their clinic.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, specialty or clinic"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {specialties.map((s) => (
          <button
            key={s}
            onClick={() => setSpecialty(s)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium',
              specialty === s ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400">{results.length} clinicians</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {results.map((d) => (
          <div key={d.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-semibold text-teal-700">
                {initials(d.name)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{d.name}</p>
                <p className="text-sm text-teal-600">{d.specialty}</p>
                <p className="text-xs text-slate-500">{d.facility}</p>
              </div>
            </div>
            <p className="mt-3 flex-1 text-sm text-slate-600">{d.bio}</p>
            <p className="mt-2 text-[11px] text-slate-400">★ {d.rating} · Next available: {d.nextAvailable}</p>
            <Link
              href={`/portal/appointments?doctor=${d.id}`}
              className="mt-4 flex items-center justify-between rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Book with {d.name}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-400">No clinicians match your search.</p>
      )}

      <p className="text-center text-xs text-slate-400">
        Booking with a clinician at another clinic creates a secure care relationship for that visit. Your other clinic records are not shared with them.
      </p>
    </div>
  );
}