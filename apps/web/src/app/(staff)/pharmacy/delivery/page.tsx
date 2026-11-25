'use client';

import { useState } from 'react';
import { Truck, MapPin, Phone, CheckCircle2, Clock, Navigation } from 'lucide-react';

const DELIVERIES = [
  { id: 'DEL-901', patient: 'Sipho Khumalo', address: '12 Oak Ave, Sandton', phone: '+27 82 111 2233', items: 'Atorvastatin 20 mg', driver: 'J. Mokoena', status: 'out', eta: '14:30' },
  { id: 'DEL-900', patient: 'Lerato Molefe', address: '45 Ridge Rd, Rosebank', phone: '+27 83 444 5566', items: 'Paracetamol 500 mg', driver: 'J. Mokoena', status: 'out', eta: '15:00' },
  { id: 'DEL-898', patient: 'Aisha Patel', address: '8 Park Lane, Illovo', phone: '+27 71 222 3344', items: 'Metformin 500 mg', driver: 'T. Ndlovu', status: 'delivered', eta: '—' },
  { id: 'DEL-895', patient: 'Johan van Wyk', address: '3 Willow Close, Fourways', phone: '+27 84 555 6677', items: 'Insulin glargine', driver: 'T. Ndlovu', status: 'scheduled', eta: '16:00' },
];

export default function DeliveryPage() {
  const [list, setList] = useState(DELIVERIES);

  const markDelivered = (id: string) => {
    setList((prev) => prev.map((d) => d.id === id ? { ...d, status: 'delivered', eta: '—' } : d));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Delivery</h2>
        <p className="text-slate-500">Track home deliveries and mark as completed.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{list.filter((d) => d.status === 'out').length}</p>
          <p className="text-xs text-slate-500">Out for delivery</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{list.filter((d) => d.status === 'scheduled').length}</p>
          <p className="text-xs text-slate-500">Scheduled</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{list.filter((d) => d.status === 'delivered').length}</p>
          <p className="text-xs text-slate-500">Delivered today</p>
        </div>
      </div>

      <div className="space-y-3">
        {list.map((d) => (
          <div key={d.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{d.id}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      d.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                      d.status === 'out' ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-600'
                    }`}>{d.status === 'out' ? 'Out for delivery' : d.status}</span>
                  </div>
                  <p className="mt-1 font-semibold text-slate-900">{d.patient}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5" /> {d.address}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                    <Phone className="h-3.5 w-3.5" /> {d.phone}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{d.items}</p>
                  <p className="mt-1 text-xs text-slate-400">Driver: {d.driver} {d.eta !== '—' && `· ETA ${d.eta}`}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {d.status === 'out' && (
                  <button
                    onClick={() => markDelivered(d.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark delivered
                  </button>
                )}
                {d.status === 'scheduled' && (
                  <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50">
                    <Navigation className="h-3.5 w-3.5" /> Assign driver
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
