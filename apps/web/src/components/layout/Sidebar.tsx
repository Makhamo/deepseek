'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Video, Activity, FlaskConical, Pill, FileText,
  Baby, Settings, Users, ClipboardList, BarChart3, MessageSquare,
  Stethoscope, Package, Truck, Shield, Home, LogOut, ChevronRight, ChevronDown,
  MessagesSquare, HeartPulse, ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
};

type NavGroup = {
  label: string;
  icon: React.ElementType;
  children: NavItem[];
};

type NavEntry = NavItem | NavGroup;

const isGroup = (entry: NavEntry): entry is NavGroup => 'children' in entry;

type SidebarProps = {
  role: 'patient' | 'doctor' | 'lab' | 'pharmacy' | 'admin';
  userName?: string;
};

const NAV: Record<string, NavEntry[]> = {
  // Patient menu is grouped so it stays short. Every page that was in the menu is still here.
  patient: [
    { label: 'Home', href: '/portal', icon: Home },
    {
      label: 'Care',
      icon: HeartPulse,
      children: [
        { label: 'My visits', href: '/portal/appointments', icon: Calendar },
        { label: 'Calendar', href: '/portal/calendar', icon: Calendar },
        { label: 'Find a doctor', href: '/portal/doctors', icon: Stethoscope },
        { label: 'Triage / Self-check', href: '/portal/triage', icon: Activity },
        { label: 'NICU', href: '/portal/nicu', icon: Baby },
      ],
    },
    {
      label: 'Communication',
      icon: MessagesSquare,
      children: [
        { label: 'Messages', href: '/portal/messages', icon: MessageSquare },
        { label: 'Video', href: '/video', icon: Video },
        { label: 'Lab results', href: '/portal/lab', icon: FlaskConical },
      ],
    },
    { label: 'Medicines', href: '/portal/prescriptions', icon: Pill },
    { label: 'My documents', href: '/portal/documents', icon: FileText },
    { label: 'Claims & Billing', href: '/portal/claims', icon: FileText },
    { label: 'Settings', href: '/portal/settings', icon: Settings },
  ],
  doctor: [
    { label: 'Dashboard', href: '/doctor', icon: LayoutDashboard },
    { label: 'Video', href: '/video', icon: Video },
    { label: 'Calendar', href: '/doctor/calendar', icon: Calendar },
    { label: 'Patients', href: '/doctor/patients', icon: Users },
    { label: 'Appointments', href: '/doctor/appointments', icon: Calendar },
    { label: 'Encounters', href: '/doctor/encounters', icon: Stethoscope },
    { label: 'Triage Queue', href: '/doctor/triage', icon: Activity },
    { label: 'Lab Orders', href: '/doctor/lab', icon: FlaskConical },
    { label: 'Prescriptions', href: '/doctor/prescriptions', icon: Pill },
    { label: 'NICU', href: '/doctor/nicu', icon: Baby },
    { label: 'Messages', href: '/doctor/messages', icon: MessageSquare },
    { label: 'Analytics', href: '/doctor/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/doctor/settings', icon: Settings },
  ],
  lab: [
    { label: 'Dashboard', href: '/lab', icon: LayoutDashboard },
    { label: 'Video', href: '/video', icon: Video },
    { label: 'Calendar', href: '/lab/calendar', icon: Calendar },
    { label: 'Work queue', href: '/lab/queue', icon: ClipboardList },
    { label: 'Samples', href: '/lab/samples', icon: FlaskConical },
    { label: 'Tests & Results', href: '/lab/tests', icon: Activity },
    { label: 'Storage', href: '/lab/inventory', icon: Package },
    { label: 'Reports', href: '/lab/reports', icon: FileText },
    { label: 'Analysis', href: '/lab/analysis', icon: BarChart3 },
    { label: 'Patients', href: '/lab/patients', icon: Users },
    { label: 'Messages', href: '/lab/messages', icon: MessageSquare },
    { label: 'Settings', href: '/lab/settings', icon: Settings },
  ],
  pharmacy: [
    { label: 'Dashboard', href: '/pharmacy', icon: LayoutDashboard },
    { label: 'Video', href: '/video', icon: Video },
    { label: 'Calendar', href: '/pharmacy/calendar', icon: Calendar },
    { label: 'Prescriptions', href: '/pharmacy/prescriptions', icon: Pill },
    { label: 'Dispensing', href: '/pharmacy/dispensing', icon: Package },
    { label: 'Delivery', href: '/pharmacy/delivery', icon: Truck },
    { label: 'Inventory', href: '/pharmacy/inventory', icon: ClipboardList },
    { label: 'Orders', href: '/pharmacy/orders', icon: ShoppingCart },
    { label: 'Patients', href: '/pharmacy/patients', icon: Users },
    { label: 'Messages', href: '/pharmacy/messages', icon: MessageSquare },
    { label: 'Analytics', href: '/pharmacy/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/pharmacy/settings', icon: Settings },
  ],
  admin: [
    { label: 'Platform', href: '/admin', icon: Shield },
    { label: 'Video', href: '/video', icon: Video },
    { label: 'Calendar', href: '/admin/calendar', icon: Calendar },
    { label: 'Organisations', href: '/admin/orgs', icon: Home },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Systems', href: '/admin/systems', icon: Settings },
    { label: 'Audit', href: '/admin/audit', icon: FileText },
  ],
};

export function Sidebar({ role, userName = 'User' }: SidebarProps) {
  const pathname = usePathname();
  const entries = NAV[role] || [];
  const isPatient = role === 'patient';
  const initials =
    userName
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  // Patient Home lives at /portal, which is the parent of every other patient page,
  // so it only counts as active on an exact match.
  const isActive = (href: string) =>
    href === '/portal'
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

  const groupHasActive = (group: NavGroup) => group.children.some((child) => isActive(child.href));

  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    entries.filter(isGroup).filter(groupHasActive).map((group) => group.label)
  );

  // Open the group that holds the current page whenever the page changes.
  useEffect(() => {
    const current = entries.filter(isGroup).filter(groupHasActive).map((group) => group.label);
    if (current.length) {
      setOpenGroups((prev) => Array.from(new Set([...prev, ...current])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  const renderItem = (item: NavItem, nested = false) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            nested && 'py-2',
            active
              ? 'bg-teal-50 text-teal-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          )}
        >
          <Icon className={cn('h-4.5 w-4.5', active ? 'text-teal-600' : 'text-slate-400')} />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">
              {item.badge}
            </span>
          )}
          {active && <ChevronRight className="h-4 w-4 text-teal-500" />}
        </Link>
      </li>
    );
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-sm">
          UH
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Unitac Health</p>
          <p className="text-xs capitalize text-slate-500">{role} portal</p>
        </div>
      </div>

      {isPatient && (
        <div className="px-3 pt-4">
          <div className="rounded-xl bg-teal-600 p-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-100">Your care</p>
            <p className="mt-1 text-sm font-semibold leading-snug">Everything about your health, in one calm place.</p>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {isPatient && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Your care</p>
        )}
        <ul className="space-y-1">
          {entries.map((entry) => {
            if (!isGroup(entry)) return renderItem(entry);

            const open = openGroups.includes(entry.label);
            const hasActive = groupHasActive(entry);
            const GroupIcon = entry.icon;
            return (
              <li key={entry.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(entry.label)}
                  aria-expanded={open}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    hasActive && !open
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <GroupIcon
                    className={cn('h-4.5 w-4.5', hasActive ? 'text-teal-600' : 'text-slate-400')}
                  />
                  <span className="flex-1 text-left">{entry.label}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-slate-400 transition-transform',
                      open && 'rotate-180'
                    )}
                  />
                </button>
                {open && (
                  <ul className="ml-5 mt-1 space-y-1 border-l border-slate-100 pl-2">
                    {entry.children.map((child) => renderItem(child, true))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {isPatient ? (
        <div className="border-t border-slate-100 p-3">
          <Link
            href="/platform"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            Sign out
          </Link>
          <div className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{userName}</p>
              <p className="text-xs capitalize text-slate-500">{role}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500 capitalize">{role}</p>
            </div>
            <Link href="/platform" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}