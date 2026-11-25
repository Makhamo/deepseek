'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  Command,
  FileText,
  FlaskConical,
  Home,
  MessageSquare,
  Pill,
  Search,
  Settings,
  Sparkles,
  Stethoscope,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Item = { label: string; href: string; icon: LucideIcon; group: 'Go to' | 'Quick actions' };

// Same destinations as the prototype's palette, named the way the portal's own menu names them.
const ITEMS: Item[] = [
  { label: 'Home', href: '/portal', icon: Home, group: 'Go to' },
  { label: 'My visits', href: '/portal/appointments', icon: Calendar, group: 'Go to' },
  { label: 'Book a visit', href: '/portal/appointments', icon: Calendar, group: 'Quick actions' },
  { label: 'Find a doctor', href: '/portal/doctors', icon: Stethoscope, group: 'Go to' },
  { label: 'Check my symptoms', href: '/portal/triage', icon: Sparkles, group: 'Quick actions' },
  { label: 'Medicines', href: '/portal/prescriptions', icon: Pill, group: 'Go to' },
  { label: 'Test results', href: '/portal/lab', icon: FlaskConical, group: 'Go to' },
  { label: 'My documents', href: '/portal/documents', icon: FileText, group: 'Go to' },
  { label: 'Messages', href: '/portal/messages', icon: MessageSquare, group: 'Go to' },
  { label: 'My doctor', href: '/portal/my-doctor', icon: Stethoscope, group: 'Go to' },
  { label: 'Settings', href: '/portal/settings', icon: Settings, group: 'Go to' },
];

/** Search button plus the full-screen palette it opens (Ctrl/⌘ + K). */
export default function CommandPalette({ variant = 'sidebar' }: { variant?: 'sidebar' | 'topbar' }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ITEMS.filter((i) => i.label.toLowerCase().includes(q)) : ITEMS;
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  function go(item: Item | undefined) {
    if (!item) return;
    setOpen(false);
    router.push(item.href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[index]);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex w-full items-center gap-2 border border-slate-200 bg-slate-50 text-sm text-slate-500 hover:bg-slate-100',
          variant === 'topbar' ? 'h-9 rounded-lg px-3' : 'rounded-xl px-3 py-2',
        )}
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 truncate text-left">
          {variant === 'topbar' ? 'Search visits, medicines, results…' : 'Search'}
        </span>
        <Command className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {open &&
        createPortal(
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-label="Search"
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Where would you like to go?"
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-slate-500 hover:text-slate-900">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-slate-500">No matches. Try another word.</p>
              )}
              {results.map((item, i) => {
                const Icon = item.icon;
                const showGroup = i === 0 || results[i - 1]?.group !== item.group;
                return (
                  <div key={`${item.label}-${i}`}>
                    {showGroup && (
                      <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {item.group}
                      </p>
                    )}
                    <button
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => go(item)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm',
                        i === index ? 'bg-teal-50 text-slate-900' : 'text-slate-700',
                      )}
                    >
                      <Icon className="h-4 w-4 text-slate-500" />
                      <span className="flex-1 font-medium">{item.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-200 px-4 py-2 text-[11px] text-slate-500">
              <span>↑↓ to navigate · Enter to open · Esc to close</span>
            </div>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}