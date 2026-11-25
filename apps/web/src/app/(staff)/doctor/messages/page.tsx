'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Search, User, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = { id: string; from: 'me' | 'them'; text: string; time: string };
type Thread = { id: string; name: string; role: string; last: string; unread: number; messages: Message[] };

const THREADS: Thread[] = [
  {
    id: '1',
    name: 'Thandi Ndlovu',
    role: 'Patient',
    last: 'Thank you doctor.',
    unread: 0,
    messages: [
      { id: 'm1', from: 'me', text: 'Your results look good overall. We can discuss at the next visit.', time: '10:05' },
      { id: 'm2', from: 'them', text: 'Thank you doctor.', time: '10:12' },
    ],
  },
  {
    id: '2',
    name: 'Lab – Sample queue',
    role: 'Internal',
    last: 'CBC for patient #4821 is critical.',
    unread: 1,
    messages: [
      { id: 'm1', from: 'them', text: 'CBC for patient #4821 is critical. Please acknowledge.', time: '09:40' },
    ],
  },
];

export default function StaffMessagesPage() {
  const [activeId, setActiveId] = useState('1');
  const [text, setText] = useState('');
  const [threads, setThreads] = useState(THREADS);
  const bottomRef = useRef<HTMLDivElement>(null);
  const active = threads.find((t) => t.id === activeId)!;

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
        t.id === activeId ? { ...t, messages: [...t.messages, msg], last: msg.text, unread: 0 } : t
      )
    );
    setText('');
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex w-80 flex-col border-r border-slate-200">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-lg font-bold text-slate-900">Messages</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input placeholder="Search…" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-500" />
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setActiveId(t.id)}
                className={cn(
                  'flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50',
                  activeId === t.id && 'bg-teal-50/60'
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-slate-900">{t.name}</p>
                    {t.unread > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">{t.unread}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{t.role}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{t.last}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{active.name}</p>
            <p className="text-xs text-slate-500">{active.role}</p>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-5">
          {active.messages.map((m) => (
            <div key={m.id} className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                m.from === 'me' ? 'rounded-br-md bg-teal-600 text-white' : 'rounded-bl-md bg-white text-slate-800 shadow-sm'
              )}>
                <p>{m.text}</p>
                <p className={cn('mt-1 text-[10px]', m.from === 'me' ? 'text-teal-100' : 'text-slate-400')}>{m.time}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-end gap-2">
            <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Paperclip className="h-5 w-5" /></button>
            <textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Type a message…"
              className="max-h-24 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
            <button onClick={send} disabled={!text.trim()} className="rounded-xl bg-teal-600 p-2.5 text-white hover:bg-teal-700 disabled:opacity-40">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
