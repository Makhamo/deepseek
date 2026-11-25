'use client';

import { useMemo, useState, Fragment } from 'react';
import Link from 'next/link';
import {
  Search, AlertTriangle, Package, ShoppingCart, FileDown, ChevronDown, ChevronUp,
  Filter, Plus, CheckSquare, Square, Clock, Boxes, Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StockItem = {
  id: string;
  name: string;
  form: string;
  unit: string;
  qty: number;
  reorder: number;
  location: string;
  expiry: string;
  batch: string;
  manufacturer: string;
  description: string;
  category: string;
};

const SEED: StockItem[] = [
  {
    id: 'SKU-AMOX-500',
    name: 'Amoxicillin 500 mg',
    form: 'Capsules',
    unit: 'pack of 21',
    qty: 42,
    reorder: 50,
    location: 'Shelf A3',
    expiry: '2027-03-15',
    batch: 'BX-22901',
    manufacturer: 'Aspen Pharmacare',
    description: 'Broad-spectrum penicillin antibiotic. Take with or without food. Complete full course.',
    category: 'Antibiotic',
  },
  {
    id: 'SKU-INS-GLAR',
    name: 'Insulin glargine 100 U/mL',
    form: 'Pen',
    unit: '3 mL pen',
    qty: 18,
    reorder: 25,
    location: 'Fridge C1',
    expiry: '2026-12-08',
    batch: 'IG-88412',
    manufacturer: 'Sanofi',
    description: 'Long-acting basal insulin. Store refrigerated. Do not freeze. Subcutaneous use only.',
    category: 'Hormone',
  },
  {
    id: 'SKU-MET-500',
    name: 'Metformin 500 mg',
    form: 'Tablets',
    unit: 'pack of 60',
    qty: 210,
    reorder: 80,
    location: 'Shelf B2',
    expiry: '2027-08-20',
    batch: 'MF-11002',
    manufacturer: 'Cipla',
    description: 'Biguanide antidiabetic. Take with meals to reduce GI upset. Monitor renal function.',
    category: 'Antidiabetic',
  },
  {
    id: 'SKU-ATOR-20',
    name: 'Atorvastatin 20 mg',
    form: 'Tablets',
    unit: 'pack of 30',
    qty: 95,
    reorder: 40,
    location: 'Shelf B4',
    expiry: '2027-01-30',
    batch: 'AT-55011',
    manufacturer: 'Pfizer',
    description: 'HMG-CoA reductase inhibitor. Preferably taken at night. Avoid grapefruit juice.',
    category: 'Cardiovascular',
  },
  {
    id: 'SKU-PARA-500',
    name: 'Paracetamol 500 mg',
    form: 'Tablets',
    unit: 'pack of 100',
    qty: 8,
    reorder: 30,
    location: 'Shelf A1',
    expiry: '2026-11-28',
    batch: 'PR-33001',
    manufacturer: 'Adcock Ingram',
    description: 'Analgesic / antipyretic. Max 4 g/day in adults. Caution in hepatic impairment.',
    category: 'Analgesic',
  },
  {
    id: 'SKU-WAR-5',
    name: 'Warfarin 5 mg',
    form: 'Tablets',
    unit: 'pack of 28',
    qty: 3,
    reorder: 15,
    location: 'Controlled CD',
    expiry: '2027-05-12',
    batch: 'WF-77003',
    manufacturer: 'Aspen',
    description: 'Vitamin K antagonist anticoagulant. Dose adjusted by INR. High-alert medication.',
    category: 'Anticoagulant',
  },
  {
    id: 'SKU-AML-5',
    name: 'Amlodipine 5 mg',
    form: 'Tablets',
    unit: 'pack of 30',
    qty: 64,
    reorder: 25,
    location: 'Shelf B1',
    expiry: '2027-04-01',
    batch: 'AM-44120',
    manufacturer: 'Pharma Dynamics',
    description: 'Dihydropyridine calcium-channel blocker. Once daily. May cause ankle oedema.',
    category: 'Cardiovascular',
  },
  {
    id: 'SKU-OME-20',
    name: 'Omeprazole 20 mg',
    form: 'Capsules',
    unit: 'pack of 28',
    qty: 12,
    reorder: 20,
    location: 'Shelf C2',
    expiry: '2026-12-22',
    batch: 'OM-99014',
    manufacturer: 'Sandoz',
    description: 'Proton-pump inhibitor. Take before meals. Swallow whole — do not crush.',
    category: 'GI',
  },
];

function stockStatus(item: StockItem): 'ok' | 'low' | 'critical' | 'expiring' {
  const daysToExpiry = Math.ceil((new Date(item.expiry).getTime() - Date.now()) / 86400000);
  if (daysToExpiry <= 30) return 'expiring';
  if (item.qty <= Math.max(5, item.reorder * 0.25)) return 'critical';
  if (item.qty < item.reorder) return 'low';
  return 'ok';
}

export default function InventoryPage() {
  const [items] = useState(SEED);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'critical' | 'expiring'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<'name' | 'qty' | 'expiry'>('name');

  const filtered = useMemo(() => {
    let list = items.filter((s) => {
      const q = query.toLowerCase();
      const match =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.manufacturer.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);
      if (!match) return false;
      const st = stockStatus(s);
      if (filter === 'all') return true;
      if (filter === 'low') return st === 'low' || st === 'critical';
      if (filter === 'critical') return st === 'critical';
      if (filter === 'expiring') return st === 'expiring';
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortKey === 'qty') return a.qty - b.qty;
      if (sortKey === 'expiry') return a.expiry.localeCompare(b.expiry);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [items, query, filter, sortKey]);

  const counts = {
    all: items.length,
    low: items.filter((s) => ['low', 'critical'].includes(stockStatus(s))).length,
    critical: items.filter((s) => stockStatus(s) === 'critical').length,
    expiring: items.filter((s) => stockStatus(s) === 'expiring').length,
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((s) => s.id)));
  };

  const selectedItems = items.filter((s) => selected.has(s.id));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Stock management</h2>
          <p className="text-slate-500">
            Inventory levels, expiry, descriptions, bulk select and supplier orders.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/pharmacy/orders/bulk?ids=${Array.from(selected).join(',')}`}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
              selected.size
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'cursor-not-allowed bg-slate-100 text-slate-400'
            )}
            onClick={(e) => {
              if (!selected.size) e.preventDefault();
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            Bulk order ({selected.size})
          </Link>
          <Link
            href="/pharmacy/orders"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Truck className="h-4 w-4" />
            Orders
          </Link>
          <Link
            href="/pharmacy/orders?tab=restock"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileDown className="h-4 w-4" />
            Restock list
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        {(
          [
            { key: 'all' as const, label: 'All items', n: counts.all, tone: 'text-slate-900' },
            { key: 'low' as const, label: 'Below reorder', n: counts.low, tone: 'text-amber-600' },
            { key: 'critical' as const, label: 'Critical', n: counts.critical, tone: 'text-rose-600' },
            { key: 'expiring' as const, label: 'Expiring ≤30d', n: counts.expiring, tone: 'text-violet-600' },
          ] as const
        ).map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={cn(
              'rounded-2xl border bg-white p-4 text-left shadow-sm transition',
              filter === c.key ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <p className={cn('text-2xl font-bold', c.tone)}>{c.n}</p>
            <p className="text-xs font-medium text-slate-500">{c.label}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKU, name, manufacturer…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-teal-500"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {(['name', 'qty', 'expiry'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium capitalize',
                sortKey === k ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              {k === 'qty' ? 'Quantity' : k}
            </button>
          ))}
        </div>
        <button
          onClick={toggleAll}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          {selected.size === filtered.length && filtered.length > 0 ? (
            <CheckSquare className="h-3.5 w-3.5" />
          ) : (
            <Square className="h-3.5 w-3.5" />
          )}
          Select page
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-10 px-3 py-3" />
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Reorder</th>
              <th className="px-4 py-3 font-medium">Batch / Expiry</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s) => {
              const st = stockStatus(s);
              const isOpen = expanded === s.id;
              return (
                <Fragment key={s.id}>
                  <tr
                    className={cn(
                      'hover:bg-slate-50/80',
                      st === 'critical' && 'bg-rose-50/40',
                      st === 'expiring' && 'bg-violet-50/30',
                      st === 'low' && 'bg-amber-50/30'
                    )}
                  >
                    <td className="px-3 py-3">
                      <button type="button" onClick={() => toggle(s.id)} className="text-slate-500 hover:text-teal-600">
                        {selected.has(s.id) ? (
                          <CheckSquare className="h-4 w-4 text-teal-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : s.id)}
                        className="text-left"
                      >
                        <p className="font-mono text-[11px] text-slate-400">{s.id}</p>
                        <p className="font-medium text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">
                          {s.form} · {s.unit} · {s.manufacturer}
                        </p>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'font-semibold',
                          st === 'critical' || st === 'low' ? 'text-rose-600' : 'text-slate-900'
                        )}
                      >
                        {s.qty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.reorder}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-500">{s.batch}</p>
                      <p className={cn('text-sm', st === 'expiring' ? 'font-medium text-violet-700' : 'text-slate-700')}>
                        {s.expiry}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.location}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                          st === 'ok' && 'bg-emerald-50 text-emerald-700',
                          st === 'low' && 'bg-amber-50 text-amber-700',
                          st === 'critical' && 'bg-rose-50 text-rose-700',
                          st === 'expiring' && 'bg-violet-50 text-violet-700'
                        )}
                      >
                        {st === 'ok' ? 'In stock' : st}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/pharmacy/orders?sku=${encodeURIComponent(s.id)}`}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50"
                        >
                          Order
                        </Link>
                        <button
                          type="button"
                          onClick={() => setExpanded(isOpen ? null : s.id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-slate-50/80">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="sm:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Product description & instructions
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-700">{s.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                              <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                                Category: {s.category}
                              </span>
                              <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                                Batch: {s.batch}
                              </span>
                              <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                                Manufacturer: {s.manufacturer}
                              </span>
                            </div>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-xs font-semibold text-slate-500">Suggested order qty</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">
                              {Math.max(s.reorder * 2 - s.qty, s.reorder)}
                            </p>
                            <p className="text-xs text-slate-500">to reach 2× reorder level</p>
                            <Link
                              href={`/pharmacy/orders?sku=${encodeURIComponent(s.id)}&qty=${Math.max(s.reorder * 2 - s.qty, s.reorder)}`}
                              className="mt-3 inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                            >
                              <Plus className="h-3 w-3" /> Place order
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                  No stock items match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xl">
          <div className="flex items-center gap-2 text-sm">
            <Boxes className="h-4 w-4 text-teal-600" />
            <span className="font-semibold text-slate-900">{selectedItems.length} selected</span>
          </div>
          <Link
            href={`/pharmacy/orders/bulk?ids=${Array.from(selected).join(',')}`}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Continue to bulk order
          </Link>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
