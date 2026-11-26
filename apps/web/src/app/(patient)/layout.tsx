'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { authClient } from '@/lib/auth-client';

export default function PatientLayout({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const [profile, setProfile] = useState<{ firstName?: string; lastName?: string; phone?: string } | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/patients/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.patientProfile) setProfile(data.patientProfile);
      })
      .catch(() => {});
  }, [session?.user]);

  const user = session?.user;
  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : user?.name || 'Patient';
  const email = user?.email || '';

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading your portal…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role="patient" userName={displayName} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title="Patient Portal" role="patient" userName={displayName} userEmail={email} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
