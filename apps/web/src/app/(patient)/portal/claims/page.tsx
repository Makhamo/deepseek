'use client';

import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const CLAIMS = [
  { id: 'CLM-10482', date: '20 Nov 2026', service: 'Consultation + CBC', amount: 'R 1 240.00', status: 'submitted', payer: 'Discovery Health' },
  { id: 'CLM-10391', date: '05 Nov 2026', service: 'Cardiology consult', amount: 'R 2 150.00', status: 'paid', payer: 'Discovery Health' },
  { id: 'CLM-10220', date: '18 Oct 2026', service: 'Lab panel', amount: 'R 890.00', status: 'rejected', payer: 'Discovery Health' },
];

const statusMap = {
  submitted: { label: 'Submitted', color: 'bg-sky-50 text-sky-700', icon: Clock },
  paid: { label: 'Paid', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-rose-50 text-rose-700', icon: AlertCircle },
};

export default function ClaimsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Claims & billing</h2>
        <p className="text-slate-500">Track medical aid claims and remittances.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Claim</th>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {CLAIMS.map((c) => {
              const s = statusMap[c.status as keyof typeof statusMap];
              const Icon = s.icon;
              return (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{c.id}</p>
                    <p className="text-xs text-slate-500">{c.date} · {c.payer}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{c.service}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{c.amount}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${s.color}`}>
                      <Icon className="h-3.5 w-3.5" /> {s.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}