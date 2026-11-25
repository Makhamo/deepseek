'use client';

import { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingCart, Package, FileDown, CheckCircle2, Clock, Truck,
  Search, Plus, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PlacedOrder = {
  id: string;
  supplier: string;
  items: { sku: string; name: string; qty: number }[];
  status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'received';
  created: string;
  total: number;
};

const CATALOG: Record<string, { name: string; unit: string; reorder: number; qtyOnHand: number }> = {
  'SKU-AMOX-500': { name: 'Amoxicillin 500 mg', unit: 'pack of 21', reorder: 50, qtyOnHand: 42 },
  'SKU-INS-GLAR': { name: 'Insulin glargine 100 U/mL', unit: '3 mL pen', reorder: 25, qtyOnHand: 18 },
  'SKU-MET-500': { name: 'Metformin 500 mg', unit: 'pack of 60', reorder: 80, qtyOnHand: 210 },
  'SKU-ATOR-20': { name: 'Atorvastatin 20 mg', unit: 'pack of 30', reorder: 40, qtyOnHand: 95 },
  'SKU-PARA-500': { name: 'Paracetamol 500 mg', unit: 'pack of 100', reorder: 30, qtyOnHand: 8 },
  'SKU-WAR-5': { name: 'Warfarin 5 mg', unit: 'pack of 28', reorder: 15, qtyOnHand: 3 },
  'SKU-AML-5': { name: 'Amlodipine 5 mg', unit: 'pack of 30', reorder: 25, qtyOnHand: 64 },
  'SKU-OME-20': { name: 'Omeprazole 20 mg', unit: 'pack of 28', reorder: 20, qtyOnHand: 12 },
};

const SEED_ORDERS: PlacedOrder[] = [
  {
    id: 'PO-1042',
    supplier: 'MediSupply SA',
    items: [
      { sku: 'SKU-PARA-500', name: 'Paracetamol 500 mg', qty: 40 },
      { sku: 'SKU-AMOX-500', name: 'Amoxicillin 500 mg', qty: 30 },
    ],
    status: 'shipped',
    created: '2026-11-20',
    total: 4280,
  },
  {
    id: 'PO-1041',
    supplier: 'PharmaDirect',
    items: [{ sku: 'SKU-INS-GLAR', name: 'Insulin glargine 100 U/mL', qty: 20 }],
    status: 'confirmed',
    created: '2026-11-18',
    total: 6120,
  },
  {
    id: 'PO-1038',
    supplier: 'MediSupply SA',
    items: [{ sku: 'SKU-WAR-5', name: 'Warfarin 5 mg', qty: 15 }],
    status: 'received',
    created: '2026-11-12',
    total: 980,
  },
];

const SUPPLIERS = ['MediSupply SA', 'PharmaDirect', 'Aspen Distribution', 'Cipla SA'];

function OrdersInner() {
  const params = useSearchParams();
  const preSku = params.get('sku') || '';
  const preQty = Number(params.get('qty') || 0);
  const tabParam = params.get('tab') || 'orders';

  const [tab, setTab] = useState<'orders' | 'new' | 'restock'>(
    tabParam === 'restock' ? 'restock' : preSku ? 'new' : 'orders'
  );
  const [orders, setOrders] = useState(SEED_ORDERS);
  const [sku, setSku] = useState(preSku || 'SKU-PARA-500');
  const [qty, setQty] = useState(preQty || 20);
  const [supplier, setSupplier] = useState(SUPPLIERS[0]);
  const [notes, setNotes] = useState('');
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const catalogList = Object.entries(CATALOG).map(([id, v]) => ({ id, ...v }));
  const lowStock = catalogList.filter((c) => c.qtyOnHand < c.reorder);

  const filteredOrders = useMemo(() => {
    if (!query) return orders;
    const q = query.toLowerCase();
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.supplier.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
    );
  }, [orders, query]);

  const placeOrder = () => {
    const item = CATALOG[sku];
    if (!item || qty < 1) return;
    const id = `PO-${1043 + orders.length}`;
    setOrders((prev) => [
      {
        id,
        supplier,
        items: [{ sku, name: item.name, qty }],
        status: 'submitted',
        created: new Date().toISOString().slice(0, 10),
        total: qty * 45,
      },
      ...prev,
    ]);
    setSubmitted(true);
    setTab('orders');
    setTimeout(() => setSubmitted(false), 3000);
  };

  const statusStyle = (s: PlacedOrder['status']) => {
    switch (s) {
      case 'submitted':
        return 'bg-sky-50 text-sky-700';
      case 'confirmed':
        return 'bg-violet-50 text-violet-700';
      case 'shipped':
        return 'bg-amber-50 text-amber-700';
      case 'received':
        return 'bg-emerald-50 text-emerald-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Orders & restock</h2>
          <p className="text-slate-500">
            Place supplier orders, track deliveries, and generate restock lists.
          </p>
        </div>
        <Link
          href="/pharmacy/orders/bulk"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <ShoppingCart className="h-4 w-4" />
          Bulk order
        </Link>
      </div>

      {submitted && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          Order submitted successfully.
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-200 pb-px">
        {(
          [
            { id: 'orders' as const, label: 'Placed orders', icon: Package },
            { id: 'new' as const, label: 'New order', icon: Plus },
            { id: 'restock' as const, label: 'Restock list', icon: FileDown },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition',
              tab === t.id
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-teal-500"
            />
          </div>
          <div className="space-y-3">
            {filteredOrders.map((o) => (
              <div
                key={o.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-900">{o.id}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase', statusStyle(o.status))}>
                        {o.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {o.supplier} · {o.created}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    R {o.total.toLocaleString('en-ZA')}
                  </p>
                </div>
                <ul className="mt-3 divide-y divide-slate-100 rounded-xl bg-slate-50">
                  {o.items.map((it) => (
                    <li key={it.sku} className="flex justify-between px-3 py-2 text-sm">
                      <span className="text-slate-700">
                        <span className="font-mono text-xs text-slate-400">{it.sku}</span>{' '}
                        {it.name}
                      </span>
                      <span className="font-medium text-slate-900">× {it.qty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'new' && (
        <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Place supplier order</h3>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Product</label>
            <select
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
            >
              {catalogList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (on hand: {c.qtyOnHand})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Quantity</label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Supplier</label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
              >
                {SUPPLIERS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Delivery instructions, PO reference…"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
            />
          </div>
          {CATALOG[sku] && CATALOG[sku].qtyOnHand < CATALOG[sku].reorder && (
            <div className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              This item is below reorder level ({CATALOG[sku].qtyOnHand} / {CATALOG[sku].reorder}).
            </div>
          )}
          <button
            type="button"
            onClick={placeOrder}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <ShoppingCart className="h-4 w-4" />
            Submit order
          </button>
        </div>
      )}

      {tab === 'restock' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Items below reorder level — export or convert to bulk order.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const rows = [
                    ['SKU', 'Name', 'On hand', 'Reorder', 'Suggested qty'],
                    ...lowStock.map((c) => [
                      c.id,
                      c.name,
                      String(c.qtyOnHand),
                      String(c.reorder),
                      String(Math.max(c.reorder * 2 - c.qtyOnHand, c.reorder)),
                    ]),
                  ];
                  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `restock-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <FileDown className="h-3.5 w-3.5" />
                Export CSV
              </button>
              <Link
                href={`/pharmacy/orders/bulk?ids=${lowStock.map((c) => c.id).join(',')}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
              >
                Order all low stock
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">SKU / Product</th>
                  <th className="px-4 py-3">On hand</th>
                  <th className="px-4 py-3">Reorder</th>
                  <th className="px-4 py-3">Suggested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStock.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-slate-400">{c.id}</p>
                      <p className="font-medium text-slate-900">{c.name}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-rose-600">{c.qtyOnHand}</td>
                    <td className="px-4 py-3 text-slate-600">{c.reorder}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {Math.max(c.reorder * 2 - c.qtyOnHand, c.reorder)}
                    </td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                      All stock levels are healthy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading orders…</div>}>
      <OrdersInner />
    </Suspense>
  );
}
