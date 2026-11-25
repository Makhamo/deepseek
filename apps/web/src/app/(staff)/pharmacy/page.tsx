'use client';

import Link from 'next/link';
import {
  Truck, Clock, CheckCircle2, ArrowRight, CalendarDays,
  Activity, Timer, ShieldCheck, PackageSearch,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const METRICS = [
  { label: 'Avg. wait time', value: '14 min', delta: '−3 min vs yesterday', icon: Timer, tone: 'text-teal-600 bg-teal-50' },
  { label: 'SLA compliance', value: '96%', delta: '2 breaches today', icon: ShieldCheck, tone: 'text-emerald-600 bg-emerald-50' },
  { label: 'Dispensed today', value: '28', delta: '+6 vs avg', icon: CheckCircle2, tone: 'text-sky-600 bg-sky-50' },
  { label: 'On-time deliveries', value: '92%', delta: '1 delayed', icon: Truck, tone: 'text-violet-600 bg-violet-50' },
];

const QUEUE = [
  { id: 'RX-4821', patient: 'Thandi Ndlovu', drug: 'Amoxicillin 500 mg × 21', priority: 'normal', status: 'pending', time: '12 min ago' },
  { id: 'RX-4820', patient: 'Johan van Wyk', drug: 'Insulin glargine 100 U/mL', priority: 'high', status: 'pending', time: '18 min ago' },
  { id: 'RX-4819', patient: 'Aisha Patel', drug: 'Metformin 500 mg × 60', priority: 'normal', status: 'dispensing', time: '25 min ago' },
  { id: 'RX-4815', patient: 'Sipho Khumalo', drug: 'Atorvastatin 20 mg × 30', priority: 'normal', status: 'ready', time: '40 min ago' },
];

const EVENTS = [
  { id: 1, date: '2026-11-24', time: '09:30', title: 'Scheduled delivery — Ward 3B', detail: '4 prescriptions · Insulin & antibiotics', type: 'delivery', status: 'upcoming' },
  { id: 2, date: '2026-11-24', time: '11:00', title: 'Stock count — Cold chain fridge', detail: 'Monthly verification · Pharmacy B', type: 'inventory', status: 'upcoming' },
  { id: 3, date: '2026-11-24', time: '14:00', title: 'Supplier delivery expected', detail: 'MediSupply · Amoxicillin, Metformin', type: 'supply', status: 'upcoming' },
  { id: 4, date: '2026-11-25', time: '08:00', title: 'Controlled substances audit', detail: 'Monthly controlled-drug register check', type: 'audit', status: 'scheduled' },
  { id: 5, date: '2026-11-25', time: '10:30', title: 'Home delivery run — North zone', detail: '6 patients · Estimated 2.5 hrs', type: 'delivery', status: 'scheduled' },
  { id: 6, date: '2026-11-26', time: '09:00', title: 'Staff shift handover', detail: 'Morning team → Afternoon team', type: 'ops', status: 'scheduled' },
];

const THROUGHPUT = [
  { hour: '08', n: 4 }, { hour: '09', n: 9 }, { hour: '10', n: 14 }, { hour: '11', n: 11 },
  { hour: '12', n: 7 }, { hour: '13', n: 6 }, { hour: '14', n: 12 }, { hour: '15', n: 15 },
];

const STOCK_HEALTH = [
  { name: 'Insulin glargine', level: 18, reorder: 25, status: 'low' },
  { name: 'Amoxicillin 500 mg', level: 42, reorder: 50, status: 'low' },
  { name: 'Metformin 500 mg', level: 210, reorder: 80, status: 'ok' },
  { name: 'Atorvastatin 20 mg', level: 95, reorder: 40, status: 'ok' },
];

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
}

function eventTypeStyles(type: string) {
  switch (type) {
    case 'delivery': return 'bg-sky-50 text-sky-700 border-sky-100';
    case 'inventory': return 'bg-violet-50 text-violet-700 border-violet-100';
    case 'supply': return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'audit': return 'bg-rose-50 text-rose-700 border-rose-100';
    default: return 'bg-slate-50 text-slate-700 border-slate-100';
  }
}

export default function PharmacyDashboard() {
  const eventsByDate = EVENTS.reduce<Record<string, typeof EVENTS>>((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pharmacy dashboard</h2>
          <p className="text-slate-500">Operational overview, schedule and live queue.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pharmacy/calendar" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <CalendarDays className="h-4 w-4" /> Full calendar
          </Link>
          <Link href="/pharmacy/dispensing" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
            Open dispensing queue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${m.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-slate-500">{m.delta}</span>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{m.value}</p>
              <p className="text-sm font-medium text-slate-600">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-teal-600" />
                <h3 className="font-semibold text-slate-900">Live prescription queue</h3>
              </div>
              <Link href="/pharmacy/prescriptions" className="text-sm font-medium text-teal-600 hover:underline">View all</Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {QUEUE.map((q) => (
                <li key={q.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">{q.id}</span>
                      {q.priority === 'high' && (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">HIGH</span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        q.status === 'ready' ? 'bg-emerald-50 text-emerald-700' :
                        q.status === 'dispensing' ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-600'
                      }`}>{q.status}</span>
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-slate-900">{q.patient}</p>
                    <p className="text-xs text-slate-500">{q.drug}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" /> {q.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Dispensing throughput (today)</h3>
              <span className="text-xs text-slate-500">Prescriptions completed per hour</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={THROUGHPUT} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickFormatter={(h) => `${h}:00`} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} labelFormatter={(h) => `${h}:00`} formatter={(value: number) => [value, 'Dispensed']} />
                  <Area type="monotone" dataKey="n" stroke="#0d9488" fill="url(#throughputGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-teal-600" />
                <h3 className="font-semibold text-slate-900">Upcoming schedule</h3>
              </div>
              <Link href="/pharmacy/calendar" className="text-sm font-medium text-teal-600 hover:underline">Calendar</Link>
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              {Object.entries(eventsByDate).map(([date, events]) => (
                <div key={date} className="border-b border-slate-50 last:border-0">
                  <div className="sticky top-0 bg-slate-50/90 px-5 py-2 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {formatEventDate(date)}
                      <span className="ml-2 font-normal normal-case text-slate-400">
                        {new Date(date + 'T00:00:00').toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </p>
                  </div>
                  <ul className="divide-y divide-slate-50">
                    {events.map((ev) => (
                      <li key={ev.id} className="flex gap-3 px-5 py-3 hover:bg-slate-50/60">
                        <div className="mt-0.5 w-11 shrink-0 text-right">
                          <p className="text-xs font-semibold text-slate-700">{ev.time}</p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-slate-900">{ev.title}</p>
                            <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${eventTypeStyles(ev.type)}`}>{ev.type}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">{ev.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageSearch className="h-4 w-4 text-teal-600" />
                <h3 className="font-semibold text-slate-900">Stock health</h3>
              </div>
              <Link href="/pharmacy/inventory" className="text-sm font-medium text-teal-600 hover:underline">Inventory</Link>
            </div>
            <ul className="space-y-3">
              {STOCK_HEALTH.map((item) => {
                const pct = Math.min(100, Math.round((item.level / (item.reorder * 2)) * 100));
                const isLow = item.status === 'low';
                return (
                  <li key={item.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">{item.name}</span>
                      <span className={`text-xs font-medium ${isLow ? 'text-rose-600' : 'text-slate-500'}`}>{item.level} units</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full transition-all ${isLow ? 'bg-rose-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    {isLow && <p className="mt-0.5 text-[11px] text-rose-600">Below reorder level ({item.reorder})</p>}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
