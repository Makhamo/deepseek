'use client';

import { User, Bell, Shield, Clock } from 'lucide-react';

export default function DoctorSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500">Profile, notifications and preferences.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <User className="h-4 w-4 text-teal-600" /> Profile
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Display name</label>
            <input defaultValue="Dr. S. Naidoo" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Specialty</label>
            <input defaultValue="General Practice" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
            <input defaultValue="s.naidoo@unitachealth.co.za" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <button className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">Save</button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Bell className="h-4 w-4 text-teal-600" /> Notifications
        </div>
        <div className="space-y-3">
          {['New triage assessments', 'Critical lab results', 'Prescription queries', 'Appointment reminders', 'Patient messages'].map((label) => (
            <label key={label} className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{label}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-teal-600" />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Clock className="h-4 w-4 text-teal-600" /> Schedule
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Default consultation length</label>
          <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option>15 minutes</option>
            <option>20 minutes</option>
            <option>30 minutes</option>
          </select>
        </div>
      </section>
    </div>
  );
}
