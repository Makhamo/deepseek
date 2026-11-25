'use client';

import { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, CheckCircle2, Trash2 } from 'lucide-react';

const CATALOG: Record<
  string,
  { name: string; unit: string; reorder: number; qtyOnHand: number; unitCost: number }
> = {
  'SKU-AMOX-500': { name: 'Amoxicillin 500 mg', unit: 'pack of 21', reorder: 50, qtyOnHand: 42, unitCost: 48 },
  'SKU-INS-GLAR': { name: 'Insulin glargine 100 U/mL', unit: '3 mL pen', reorder: 25, qtyOnHand: 18, unitCost: 310 },
  'SKU-MET-500': { name: 'Metformin 500 mg', unit: 'pack of 60', reorder: 80, qtyOnHand: 210, unitCost: 36 },
  'SKU-ATOR-20': { name: 'Atorvastatin 20 mg', unit: 'pack of 30', reorder: 40, qtyOnHand: 95, unitCost: 52 },
  'SKU-PARA-500': { name: 'Paracetamol 500 mg', unit: 'pack of 100', reorder: 30, qtyOnHand: 8, unitCost: 22 },
  'SKU-WAR-5': { name: 'Warfarin 5 mg', unit: 'pack of 28', reorder: 15, qtyOnHand: 3, unitCost: 65 },
  'SKU-AML-5': { name: 'Amlodipine 5 mg', unit: 'pack of 30', reorder: 25, qtyOnHand: 64, unitCost: 28 },
  'SKU-OME-20': { name: 'Omeprazole 20 mg', unit: 'pack of 28', reorder: 20, qtyOnHand: 12, unitCost: 41 },
};

const SUPPLIERS = ['MediSupply SA', 'PharmaDirect', 'Aspen Distribution', 'Cipla SA'];

function BulkOrderInner() {
  const params = useSearchParams();
  const router = useRouter();
  const idsParam = params.get('ids') || '';
  const initialIds = idsParam.split(',').filter((id) => id && CATALOG[id]);

  const [lines, setLines] = useState(
    (initialIds.length
      ? initialIds
      : Object.keys(CATALOG).filter((id) => CATALOG[id].qtyOnHand < CATALOG[id].reorder)
    ).map((id) => {
      const c = CATALOG[id];
      return {
        sku: id,
        qty: Math.max(c.reorder * 2 - c.qtyOnHand, c.reorder),
      };
    })
  );
  const [supplier, setSupplier] = useState(SUPPLIERS[0]);
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty * (CATALOG[l.sku]?.unitCost || 0), 0),
    [lines]
  );

  const updateQty = (sku: string, qty: number) => {
    setLines((prev) => prev.map((l) => (l.sku === sku ? { ...l, qty: Math.max(0, qty) } : l)));
  };

  const removeLine = (sku: string) => {
    setLines((prev) => prev.filter((l) => l.sku !== sku));
  };

  const addProduct = (sku: string) => {
    if (lines.some((l) => l.sku === sku)) return;
    const c = CATALOG[sku];
    setLines((prev) => [
      ...prev,
      { sku, qty: Math.max(c.reorder * 2 - c.qtyOnHand, c.reorder) },
    ]);
  };

  const submit = () => {
    if (!lines.length) return;
    setDone(true);
    setTimeout(() => router.push('/pharmacy/orders'), 1500);
  };

  if (done) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <h2 className="text-xl font-bold text-slate-900">Bulk order submitted</h2>
        <p className="text-sm text-slate-500">Redirecting to orders…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/pharmacy/inventory"
            className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to inventory
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Bulk order</h2>
          <p className="text-slate-500">Review quantities and submit to a supplier in one step.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {lines.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
              No items yet. Add products below or select stock from inventory.
            </div>
          )}
          {lines.map((l) => {
            const c = CATALOG[l.sku];
            if (!c) return null;
            return (
              <div
                key={l.sku}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] text-slate-400">{l.sku}</p>
                  <p className="font-medium text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    On hand {c.qtyOnHand} · Reorder {c.reorder} · {c.unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={l.qty}
                    onChange={(e) => updateQty(l.sku, Number(e.target.value))}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-500"
                  />
                </div>
                <p className="w-24 text-right text-sm font-semibold text-slate-900">
                  R {(l.qty * c.unitCost).toLocaleString('en-ZA')}
                </p>
                <button
                  type="button"
                  onClick={() => removeLine(l.sku)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Add product
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATALOG)
                .filter(([id]) => !lines.some((l) => l.sku === id))
                .map(([id, c]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => addProduct(id)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-teal-300 hover:text-teal-700"
                  >
                    + {c.name}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Order summary</h3>
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
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
              placeholder="PO reference, delivery window…"
            />
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm text-slate-500">{lines.length} line(s)</span>
            <span className="text-xl font-bold text-slate-900">
              R {total.toLocaleString('en-ZA')}
            </span>
          </div>
          <button
            type="button"
            disabled={!lines.length}
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            Submit bulk order
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BulkOrderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading bulk order…</div>}>
      <BulkOrderInner />
    </Suspense>
  );
}
