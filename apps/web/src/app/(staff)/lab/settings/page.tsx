'use client';

import { Settings, Bell, Users, Shield } from 'lucide-react';

export default function LabSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Lab settings</h2>
        <p className="text-slate-500">Catalogue, critical ranges, users and notifications.</p>
      </div>

      <div className="space-y-3">
        {[
          { icon: Settings, title: 'Test catalogue', desc: 'Manage available tests, codes and reference ranges.' },
          { icon: Shield, title: 'Critical ranges', desc: 'Age-band thresholds that trigger critical result tasks.' },
          { icon: Users, title: 'Lab users', desc: 'Technicians, pathologists and access roles.' },
          { icon: Bell, title: 'Notifications', desc: 'Critical result alerts and report release preferences.' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{s.title}</p>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
