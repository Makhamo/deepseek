'use client';

import { useState } from 'react';
import {
  Bell, Video, Search, Settings, User, ChevronDown, CheckCircle2, AlertTriangle, Info, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CommandPalette from '@/components/layout/CommandPalette';

type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
};

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Lab result ready', body: 'Your CBC results are available for review.', time: '12 min ago', type: 'success', read: false },
  { id: '2', title: 'Appointment reminder', body: 'Dr. Naidoo – tomorrow 09:30 at Main Clinic.', time: '1 h ago', type: 'info', read: false },
  { id: '3', title: 'Prescription ready', body: 'Your prescription is ready for collection at Pharmacy A.', time: '3 h ago', type: 'success', read: true },
  { id: '4', title: 'Triage follow-up', body: 'Please complete the symptom check-in.', time: 'Yesterday', type: 'warning', read: true },
];

type TopbarProps = {
  title: string;
  role: string;
  userName?: string;
  userEmail?: string;
};

export function Topbar({ title, role, userName = 'Demo User', userEmail = 'demo@unitachealth.co.za' }: TopbarProps) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unread = DEMO_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        <p className="text-xs text-slate-500 capitalize">{role} workspace</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        {role === 'patient' ? (
          <div className="hidden w-64 md:block">
            <CommandPalette variant="topbar" />
          </div>
        ) : (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search patients, orders, results…"
              className="h-9 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        )}

        {/* Video conference */}
        <a
          href="/video"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          title="Video conference"
        >
          <Video className="h-5 w-5" />
        </a>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setOpen(!open); setProfileOpen(false); }}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-slate-100">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {DEMO_NOTIFICATIONS.map((n) => {
                  const Icon = n.type === 'success' ? CheckCircle2 : n.type === 'warning' ? AlertTriangle : Info;
                  const color = n.type === 'success' ? 'text-emerald-500' : n.type === 'warning' ? 'text-amber-500' : 'text-sky-500';
                  return (
                    <li key={n.id} className={cn('flex gap-3 border-b border-slate-50 px-4 py-3 hover:bg-slate-50', !n.read && 'bg-teal-50/40')}>
                      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', color)} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{n.title}</p>
                        <p className="truncate text-xs text-slate-500">{n.body}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{n.time}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-slate-100 px-4 py-2 text-center">
                <button className="text-sm font-medium text-teal-600 hover:text-teal-700">View all</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setOpen(false); }}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
              {userName.charAt(0).toUpperCase()}
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">{userEmail}</p>
              </div>
              <ul className="py-1">
                <li>
                  <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <User className="h-4 w-4" /> Profile
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Settings className="h-4 w-4" /> Settings
                  </a>
                </li>
                <li>
                  <a href="/platform" className="flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
                    Sign out
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}