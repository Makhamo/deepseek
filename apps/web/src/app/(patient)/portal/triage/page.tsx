'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, CheckCircle2, ChevronRight, MessageSquare, Plus, Sparkles, Stethoscope } from 'lucide-react';

const SYMPTOMS = [
  'Fever / chills', 'Cough', 'Shortness of breath', 'Chest pain',
  'Headache', 'Abdominal pain', 'Nausea / vomiting', 'Rash',
  'Fatigue', 'Dizziness', 'Sore throat', 'Other',
];

function AssistantBox({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="max-w-[88%] rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-teal-600">{label}</p>
      <div className="text-sm leading-relaxed text-slate-900">{children}</div>
    </div>
  );
}

function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-xl bg-teal-600 px-4 py-2 text-sm text-white">{children}</div>
    </div>
  );
}

export default function TriagePage() {
  // Same assessment logic as before: symptoms -> severity -> recommendation.
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [severity, setSeverity] = useState(3);
  const [result, setResult] = useState<'low' | 'medium' | 'high' | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step]);

  const toggle = (s: string) => {
    setSelected((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const submit = () => {
    if (severity >= 7 || selected.includes('Chest pain') || selected.includes('Shortness of breath')) {
      setResult('high');
    } else if (severity >= 4 || selected.length >= 3) {
      setResult('medium');
    } else {
      setResult('low');
    }
    setStep(2);
  };

  const reset = () => {
    setStep(0);
    setSelected([]);
    setSeverity(3);
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-teal-600">AI health assistant</p>
          <h2 className="text-3xl font-bold text-slate-900">Symptom checker</h2>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            AI-assisted self-assessment. Results are reviewed by a clinician when needed.
          </p>
        </div>
        <Link
          href="/portal/my-doctor"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Stethoscope className="h-4 w-4 text-teal-600" /> Talk to my doctor
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        {/* Left column */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Your chats</span>
              <button onClick={reset} aria-label="New assessment" className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex w-full items-start gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-left">
              <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-slate-900">Symptom check</span>
                <span className="block text-[11px] text-slate-500">Today</span>
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-teal-700">When to call emergency services</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Chest pain, difficulty breathing, stroke signs, severe bleeding, fainting or thoughts of self-harm need
              immediate help. Don&apos;t wait for the chat.
            </p>
          </div>
        </aside>

        {/* Chat card */}
        <section className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Triage assistant</p>
                <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                  Online · guidance, not a diagnosis
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" /> New chat
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5" style={{ maxHeight: 620 }}>
            {/* Step 0: symptoms */}
            <AssistantBox label="Symptom check">
              <p className="font-medium">What symptoms are you experiencing?</p>
              {step === 0 && (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {SYMPTOMS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggle(s)}
                        className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                          selected.includes(s)
                            ? 'border-teal-500 bg-teal-50 text-teal-800'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={selected.length === 0}
                    onClick={() => setStep(1)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-40"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </AssistantBox>

            {step >= 1 && <UserBubble>{selected.join(', ')}</UserBubble>}

            {/* Step 1: severity */}
            {step >= 1 && (
              <AssistantBox label="Symptom check">
                <p className="font-medium">How severe are your symptoms overall?</p>
                <p className="mt-1 text-slate-500">1 = mild · 10 = emergency</p>
                {step === 1 && (
                  <>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={severity}
                      onChange={(e) => setSeverity(Number(e.target.value))}
                      className="mt-5 w-full accent-teal-600"
                    />
                    <div className="mt-2 flex justify-between text-sm font-medium text-slate-700">
                      <span>1</span>
                      <span className="text-lg text-teal-700">{severity}</span>
                      <span>10</span>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button onClick={() => setStep(0)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium">
                        Back
                      </button>
                      <button onClick={submit} className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
                        Get recommendation
                      </button>
                    </div>
                  </>
                )}
              </AssistantBox>
            )}

            {step === 2 && <UserBubble>{severity} out of 10</UserBubble>}

            {/* Step 2: recommendation */}
            {step === 2 && result && (
              <AssistantBox label={result === 'high' ? 'Urgent care' : result === 'medium' ? 'See a clinician' : 'Routine care'}>
                {result === 'high' && (
                  <div className="flex gap-4">
                    <AlertTriangle className="h-10 w-10 shrink-0 text-rose-500" />
                    <div>
                      <p className="text-lg font-semibold text-slate-900">Seek urgent care</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Based on your answers, please go to the nearest emergency department or call emergency services.
                        A clinician has been notified of this high-priority assessment.
                      </p>
                    </div>
                  </div>
                )}
                {result === 'medium' && (
                  <div className="flex gap-4">
                    <Activity className="h-10 w-10 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-lg font-semibold text-slate-900">Book a consultation soon</p>
                      <p className="mt-1 text-sm text-slate-600">
                        We recommend an appointment within 24–48 hours. You can book from the My visits page.
                      </p>
                      <a href="/portal/appointments" className="mt-3 inline-block text-sm font-medium text-teal-600 hover:underline">
                        Book appointment →
                      </a>
                    </div>
                  </div>
                )}
                {result === 'low' && (
                  <div className="flex gap-4">
                    <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-500" />
                    <div>
                      <p className="text-lg font-semibold text-slate-900">Self-care recommended</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Your symptoms appear mild. Rest, hydrate and monitor. Book an appointment if they worsen.
                      </p>
                    </div>
                  </div>
                )}
                <button onClick={reset} className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium">
                  Start another assessment
                </button>
              </AssistantBox>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-slate-200 p-4">
            <p className="text-[11px] text-slate-500">
              Unitac Health provides triage guidance only, not a diagnosis. For emergencies, call your local emergency number.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}