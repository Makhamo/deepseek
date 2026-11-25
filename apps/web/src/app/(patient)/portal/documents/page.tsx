'use client';

import { useState } from 'react';
import { FileText, Upload, CheckCircle2, Plus, Download, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEED_DOCUMENTS, type DocType, type PatientDoc } from '@/lib/patient-data';

const REQUIRED = [
  { type: 'ID', label: 'Proof of identity', required: true },
  { type: 'Medical Aid', label: 'Medical aid card / membership', required: false },
  { type: 'Referral', label: 'Referral letter (if applicable)', required: false },
];

const CATEGORIES: DocType[] = ['Lab Result', 'ID', 'Medical Aid', 'Referral', 'Other'];

export default function MyDocumentsPage() {
  const [docs, setDocs] = useState<PatientDoc[]>(SEED_DOCUMENTS);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [category, setCategory] = useState<DocType>('Lab Result');

  const handleUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setTimeout(() => {
      const newDocs: PatientDoc[] = Array.from(files).map((f, i) => ({
        id: `new-${Date.now()}-${i}`,
        name: f.name,
        type: category,
        uploaded: 'Just now',
        status: 'pending' as const,
        size: `${(f.size / 1024).toFixed(0)} KB`,
      }));
      setDocs((prev) => [...newDocs, ...prev]);
      setUploading(false);
    }, 800);
  };

  const remove = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-medium text-teal-600">Health records</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">My documents</h2>
        <p className="mt-1 text-sm text-slate-500">Upload lab results, imaging reports and referrals so your care team has the full picture.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left: upload + checklist */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Upload a report</h3>
            <p className="mt-1 text-xs text-slate-500">PDF, JPG or PNG up to 10 MB.</p>

            <div className="mt-4">
              <label className="mb-1 block text-[10px] font-medium uppercase text-slate-500">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocType)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); handleUpload(e.dataTransfer.files); }}
              className={cn(
                'mt-4 rounded-xl border-2 border-dashed p-5 text-center transition',
                drag ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'
              )}
            >
              <Upload className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-2 text-xs font-medium text-slate-700">Drag files here or click to upload</p>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700">
                <Plus className="h-4 w-4" /> Choose files
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </label>
              {uploading && <p className="mt-2 text-xs text-teal-600">Uploading…</p>}
            </div>

            <p className="mt-3 text-[11px] text-slate-400">Files are stored privately against your account and only visible to you.</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Required documents</h3>
            <ul className="mt-3 space-y-2">
              {REQUIRED.map((r) => {
                const has = docs.some((d) => d.type === r.type && d.status !== 'rejected');
                return (
                  <li key={r.type} className="flex items-center gap-3 text-sm">
                    {has ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-amber-500" />}
                    <span className={has ? 'text-slate-700' : 'font-medium text-slate-900'}>{r.label}</span>
                    {r.required && !has && <span className="text-xs text-rose-600">Required</span>}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Right: your documents */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Your documents</h3>
            <span className="text-xs text-slate-400">{docs.length} files</span>
          </div>
          <div className="mt-4 space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{d.name}</p>
                  <p className="text-xs text-slate-500">{d.type} · {d.size} · {d.uploaded}</p>
                </div>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                  d.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                  d.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                )}>
                  {d.status}
                </span>
                <button className="rounded p-1 hover:bg-slate-100" title="Download">
                  <Download className="h-4 w-4 text-slate-400" />
                </button>
                <button onClick={() => remove(d.id)} className="rounded p-1 hover:bg-rose-50" title="Remove">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            ))}
            {docs.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No documents uploaded yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}