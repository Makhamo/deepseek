'use client';

import { useState } from 'react';
import { Package, AlertTriangle, Search, MapPin, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

type Loc = {
  id: string;
  name: string;
  type: 'fridge' | 'ambient' | 'freezer' | 'bench';
  temp: string;
  capacity: number;
  used: number;
  items: string[];
};

const LOCATIONS: Loc[] = [
  { id: 'A-12', name: 'Fridge A-12', type: 'fridge', temp: '4°C', capacity: 40, used: 28, items: ['S-1046', 'S-1039'] },
  { id: 'B-03', name: 'Fridge B-03', type: 'fridge', temp: '4°C', capacity: 40, used: 12, items: [] },
  { id: 'C-01', name: 'Cold room C', type: 'freezer', temp: '–20°C', capacity: 100, used: 45, items: ['S-1021'] },
  { id: 'R-4', name: 'Ambient rack 4', type: 'ambient', temp: '22°C', capacity: 60, used: 18, items: ['S-1041'] },
  { id: 'MB', name: 'Microbiology bench', type: 'bench', temp: '22°C', capacity: 20, used: 6, items: [] },
];

const REAGENTS = [
  { sku: 'EDTA-5ML', name: 'EDTA tubes 5 ml', stock: 42, reorder: 50, location: 'Store A' },
  { sku: 'REAG-CRP', name: 'CRP reagent kit', stock: 3, reorder: 5, location: 'Cold room' },
  { sku: 'REAG-HBA1C', name: 'HbA1c reagent', stock: 8, reorder: 4, location: 'Chemistry' },
];

export default function LabStoragePage() {
  const [tab, setTab] = useState<'locations' | 'reagents'>('locations');
  const [q, setQ] = useState('');

  const locs = LOCATIONS.filter((l) => l.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Storage & inventory</h2>
          <p className="text-slate-500">Sample locations and reagent stock.</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          <button onClick={() => setTab('locations')} className={cn('rounded-md px-3 py-1 text-sm font-medium', tab === 'locations' ? 'bg-white shadow-sm' : 'text-slate-600')}>Locations</button>
          <button onClick={() => setTab('reagents')} className={cn('rounded-md px-3 py-1 text-sm font-medium', tab === 'reagents' ? 'bg-white shadow-sm' : 'text-slate-600')}>Reagents</button>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm" />
      </div>

      {tab === 'locations' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locs.map((l) => (
            <div key={l.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Thermometer className="h-3.5 w-3.5" /> {l.temp}
                </span>
              </div>
              <p className="mt-3 font-semibold text-slate-900">{l.name}</p>
              <p className="text-xs capitalize text-slate-500">{l.type}</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{l.used} / {l.capacity}</span>
                  <span>{Math.round((l.used / l.capacity) * 100)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-teal-500" style={{ width: `${(l.used / l.capacity) * 100}%` }} />
                </div>
              </div>
              {l.items.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">Samples: {l.items.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'reagents' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Reorder</th>
                <th className="px-4 py-3">Location</th>
              </tr>
            </thead>
            <tbody>
              {REAGENTS.map((r) => (
                <tr key={r.sku} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs">{r.sku}</td>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className={cn('px-4 py-3 font-semibold', r.stock <= r.reorder ? 'text-rose-600' : '')}>
                    {r.stock} {r.stock <= r.reorder && <AlertTriangle className="ml-1 inline h-3.5 w-3.5" />}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{r.reorder}</td>
                  <td className="px-4 py-3 text-slate-500">{r.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
