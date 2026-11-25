import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role="patient" userName="Thandi Ndlovu" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title="Patient Portal" role="patient" userName="Thandi Ndlovu" userEmail="thandi@example.com" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}