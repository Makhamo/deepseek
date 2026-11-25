'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Send, Search, MessageSquare, Paperclip, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = { id: string; from: 'me' | 'them'; text: string; time: string };
type Thread = { id: string; name: string; role: string; last: string; unread: number; messages: Message[] };

const THREADS: Thread[] = [
  {
    id: '1',
    name: 'Dr. S. Naidoo',
    role: 'General Practice',
    last: 'Please bring your previous results to the appointment.',
    unread: 1,
    messages: [
      { id: 'm1', from: 'them', text: 'Good morning Thandi. Your lipid results are ready.', time: '09:12' },
      { id: 'm2', from: 'me', text: 'Thank you doctor. Should I be concerned about the LDL?', time: '09:18' },
      { id: 'm3', from: 'them', text: 'It is only mildly elevated. We can discuss lifestyle and whether a low-dose statin is appropriate at your visit.', time: '09:22' },
      { id: 'm4', from: 'them', text: 'Please bring your previous results to the appointment.', time: '09:23' },
    ],
  },
  {
    id: '2',
    name: 'Lab Reception',
    role: 'Laboratory',
    last: 'Your CBC sample has been received.',
    unread: 0,
    messages: [
      { id: 'm1', from: 'them', text: 'Your CBC sample has been received and is in processing.', time: 'Yesterday' },
      { id: 'm2', from: 'me', text: 'How long until results?', time: 'Yesterday' },
      { id: 'm3', from: 'them', text: 'Usually 24–48 hours. You will get a notification when ready.', time: 'Yesterday' },
    ],
  },
  {
    id: '3',
    name: 'Pharmacy A',
    role: 'Pharmacy',
    last: 'Your prescription is ready for collection.',
    unread: 0,
    messages: [
      { id: 'm1', from: 'them', text: 'Your prescription is ready for collection at Counter 2.', time: '2 days ago' },
    ],
  },
];

export default function MessagesPage() {
  const [activeId, setActiveId] = useState('1');
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [threads, setThreads] = useState(THREADS);
  const bottomRef = useRef<HTMLDivElement>(null);
  const active = threads.find((t) => t.id === activeId) ?? threads[0]!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, active.messages.length]);

  const send = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: `local-${Date.now()}`,
      from: 'me',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeId
          ? { ...t, messages: [...t.messages, msg], last: msg.text, unread: 0 }
          : t
      )
    );
    setText('');
  };

  const visibleThreads = threads.filter((t) => {
    const q = query.trim().toLowerCase();
    return !q || t.name.toLowerCase().includes(q) || t.role.toLowerCase().includes(q) || t.last.toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-teal-600">Care team</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Messages</h2>
          <p className="mt-1 text-sm text-slate-500">Send a note to your assigned clinician between visits.</p>
        </div>
        <Link
          href="/portal/appointments"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          <Calendar className="h-4 w-4" /> Book appointment
        </Link>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        {/* Conversation */}
        <section className="flex h-[calc(100vh-17rem)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{active.name}</p>
              <p className="text-xs text-slate-500">Replies happen during clinic hours · not for emergencies</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {active.messages.map((m) =>
              m.from === 'them' ? (
                <div key={m.id} className="max-w-[80%] rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Care team</p>
                  <p className="mt-1 text-sm text-slate-800">{m.text}</p>
                  <p className="mt-1.5 text-[10px] text-slate-400">{m.time}</p>
                </div>
              ) : (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[75%] rounded-2xl bg-teal-600 px-4 py-2.5 text-white">
                    <p className="text-sm">{m.text}</p>
                    <p className="mt-1 text-[10px] text-teal-100">{m.time}</p>
                  </div>
                </div>
              )
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-100 p-4">
            <div className="flex items-end gap-2">
              <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Attach">
                <Paperclip className="h-5 w-5" />
              </button>
              <textarea
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type a message…"
                className="max-h-24 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
              <button
                onClick={send}
                disabled={!text.trim()}
                className="rounded-xl bg-teal-600 p-2.5 text-white hover:bg-teal-700 disabled:opacity-40"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Right column */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Your care team</h3>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-500"
              />
            </div>
            <ul className="mt-3 space-y-1">
              {visibleThreads.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setActiveId(t.id)}
                    className={cn(
                      'w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50',
                      activeId === t.id && 'bg-teal-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-semibold text-slate-900">{t.name}</p>
                      {t.unread > 0 && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                          {t.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{t.role}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">{t.last}</p>
                  </button>
                </li>
              ))}
              {visibleThreads.length === 0 && (
                <li className="px-3 py-4 text-center text-xs text-slate-400">No conversations match your search.</li>
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="text-sm font-semibold text-slate-900">Response times</h3>
            <p className="mt-1 text-xs text-slate-700">
              Messages are reviewed during clinic hours. For symptoms that need same-day attention, request an urgent appointment or use the symptom checker.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}