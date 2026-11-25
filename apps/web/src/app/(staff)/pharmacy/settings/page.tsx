'use client';

import { Settings, Building2, Bell, Clock, Printer } from 'lucide-react';

export default function PharmacySettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Pharmacy settings</h2>
        <p className="text-slate-500">Site preferences, notifications and printers.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Building2 className="h-4 w-4 text-teal-600" /> Site
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Pharmacy name</label>
            <input defaultValue="Unitac Pharmacy – Main" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Address</label>
            <input defaultValue="100 Health Blvd, Johannesburg" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Dispensing hours</label>
            <input defaultValue="Mon–Fri 08:00–18:00 · Sat 08:00–13:00" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Bell className="h-4 w-4 text-teal-600" /> Notifications
        </div>
        <div className="space-y-3">
          {['New prescription received', 'High-priority / controlled drug', 'Stock below reorder', 'Delivery failed / delayed', 'Patient collection reminder'].map((label) => (
            <label key={label} className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{label}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-teal-600" />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Printer className="h-4 w-4 text-teal-600" /> Labels & printers
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Default label printer</label>
            <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option>Zebra ZD420 – Counter</option>
              <option>Brother QL-820NWB</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Label template</label>
            <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option>Standard SA (patient + sig + warnings)</option>
              <option>Compact</option>
            </select>
          </div>
        </div>
        <button className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
          Save settings
        </button>
      </section>
    </div>
  );
}
