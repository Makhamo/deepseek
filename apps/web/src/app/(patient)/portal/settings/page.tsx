'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Trash2, ShieldCheck, AlertTriangle, TriangleAlert, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'personal', label: 'Personal' },
  { id: 'medical', label: 'Medical' },
  { id: 'emergency', label: 'Emergency contacts' },
  { id: 'security', label: 'Security' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'privacy', label: 'Privacy' },
] as const;

type TabId = (typeof TABS)[number]['id'];
type Contact = { id: string; name: string; relationship: string; phone: string };

const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500';
const labelCls = 'mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500';
const primaryBtn = 'rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50';
const outlineBtn = 'rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50';

const NOT_CONNECTED = 'This action isn’t connected to the server yet.';

function SettingsInner() {
  const params = useSearchParams();
  const requested = params.get('tab');
  const initial: TabId = TABS.some((t) => t.id === requested) ? (requested as TabId) : 'personal';

  const [tab, setTabState] = useState<TabId>(initial);
  const [notice, setNotice] = useState('');

  // Emergency contacts
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '' });

  // Security
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });

  // Privacy
  const [clearAck, setClearAck] = useState(false);
  const [clearPw, setClearPw] = useState('');
  const [deleteText, setDeleteText] = useState('');
  const [deletePw, setDeletePw] = useState('');

  const setTab = (t: TabId) => { setTabState(t); setNotice(''); };

  const addContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) return;
    setContacts((prev) => [...prev, { id: `c-${Date.now()}`, ...newContact }]);
    setNewContact({ name: '', relationship: '', phone: '' });
  };

  const passwordReady = pw.current && pw.next && pw.next === pw.confirm;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-medium text-teal-600">Your account</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your profile, medical record, security and privacy preferences.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-1 border-b border-slate-100 p-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium',
                tab === t.id ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* PERSONAL */}
          {tab === 'personal' && (
            <section>
              <h3 className="text-sm font-semibold text-slate-900">Personal information</h3>
              <p className="mt-1 text-xs text-slate-500">Keep your identity and contact details up to date.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>First name</label><input defaultValue="Thandi" className={inputCls} /></div>
                <div><label className={labelCls}>Surname</label><input defaultValue="Ndlovu" className={inputCls} /></div>
                <div><label className={labelCls}>Email address</label><input defaultValue="thandi@example.com" className={inputCls} /></div>
                <div><label className={labelCls}>Date of birth</label><input type="date" className={inputCls} /></div>
                <div>
                  <label className={labelCls}>Gender</label>
                  <select defaultValue="" className={inputCls}>
                    <option value="" disabled>Select</option>
                    <option>Female</option><option>Male</option><option>Other</option>
                  </select>
                </div>
                <div><label className={labelCls}>ID number</label><input className={inputCls} /></div>
                <div><label className={labelCls}>Phone number</label><input defaultValue="+27 82 123 4567" className={inputCls} /></div>
                <div className="sm:col-span-2"><label className={labelCls}>Address</label><textarea rows={3} className={inputCls} /></div>
              </div>
              <div className="mt-5 flex justify-end"><button className={primaryBtn}>Save changes</button></div>
            </section>
          )}

          {/* MEDICAL */}
          {tab === 'medical' && (
            <section>
              <h3 className="text-sm font-semibold text-slate-900">Medical information</h3>
              <p className="mt-1 text-xs text-slate-500">This helps your clinician prepare and keeps your record complete.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Blood type</label>
                  <select defaultValue="" className={inputCls}>
                    <option value="" disabled>Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Physician</label><input defaultValue="Dr. S. Naidoo" className={inputCls} /></div>
                <div><label className={labelCls}>Allergies</label><textarea rows={3} className={inputCls} /></div>
                <div><label className={labelCls}>Chronic conditions</label><textarea rows={3} defaultValue="Hypertension, Diabetes" className={inputCls} /></div>
                <div className="sm:col-span-2"><label className={labelCls}>Current medications</label><textarea rows={3} className={inputCls} /></div>
                <div><label className={labelCls}>Insurance provider</label><input defaultValue="Discovery Health" className={inputCls} /></div>
                <div><label className={labelCls}>Policy number</label><input className={inputCls} /></div>
                <div><label className={labelCls}>Plan name</label><input className={inputCls} /></div>
              </div>
              <div className="mt-5 flex justify-end"><button className={primaryBtn}>Save medical information</button></div>
            </section>
          )}

          {/* EMERGENCY CONTACTS */}
          {tab === 'emergency' && (
            <section>
              <h3 className="text-sm font-semibold text-slate-900">Emergency contacts</h3>
              <p className="mt-1 text-xs text-slate-500">People your care team can call if there’s an urgent concern.</p>

              <div className="mt-4 space-y-3">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">{[c.relationship, c.phone].filter(Boolean).join(' · ')}</p>
                    </div>
                    <button
                      onClick={() => setContacts((prev) => prev.filter((x) => x.id !== c.id))}
                      className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
                    No emergency contacts yet.
                  </p>
                )}
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Add a contact</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div><label className={labelCls}>Full name</label><input value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}>Relationship</label><input value={newContact.relationship} onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })} placeholder="Spouse, sibling…" className={inputCls} /></div>
                  <div><label className={labelCls}>Phone</label><input value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} className={inputCls} /></div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={addContact} disabled={!newContact.name.trim() || !newContact.phone.trim()} className={cn(outlineBtn, 'inline-flex items-center gap-2')}>
                    <Plus className="h-4 w-4" /> Add contact
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* SECURITY */}
          {tab === 'security' && (
            <section>
              <h3 className="text-sm font-semibold text-slate-900">Security</h3>
              <p className="mt-1 text-xs text-slate-500">Use a unique password and add a second step at sign-in.</p>

              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Change password</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div><label className={labelCls}>Current password</label><input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}>New password</label><input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}>Confirm new password</label><input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className={inputCls} /></div>
                </div>
                {pw.confirm && pw.next !== pw.confirm && (
                  <p className="mt-2 text-xs text-rose-600">The new passwords don’t match.</p>
                )}
                <div className="mt-4 flex justify-end">
                  {/* TODO: connect to the change-password API */}
                  <button disabled={!passwordReady} onClick={() => setNotice(NOT_CONNECTED)} className={outlineBtn}>Update password</button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600"><ShieldCheck className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Two-factor authentication</p>
                      <p className="text-xs text-slate-500">Add an authenticator app as a second step at sign-in.</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">OFF</span>
                </div>
                {/* TODO: connect to the MFA setup flow */}
                <button onClick={() => setNotice(NOT_CONNECTED)} className={cn(outlineBtn, 'mt-4')}>Set up two-factor authentication</button>
              </div>
            </section>
          )}

          {/* PREFERENCES */}
          {tab === 'preferences' && (
            <section>
              <h3 className="text-sm font-semibold text-slate-900">Preferences</h3>
              <p className="mt-1 text-xs text-slate-500">Personalise how the portal looks and how we contact you.</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelCls}>Appearance</label>
                  <select defaultValue="Light" className={inputCls}><option>Light</option><option>Dark</option><option>System</option></select>
                </div>
                <div>
                  <label className={labelCls}>Accent colour</label>
                  <select defaultValue="Teal" className={inputCls}><option>Teal</option><option>Blue</option><option>Violet</option></select>
                </div>
                <div>
                  <label className={labelCls}>Text size</label>
                  <select defaultValue="Default" className={inputCls}><option>Default</option><option>Large</option></select>
                </div>
              </div>

              <div className="mt-5">
                <p className={labelCls}>Notifications</p>
                <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                  <label className="flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-teal-600" /> Email updates about appointments, refills and messages</label>
                  <label className="flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" className="h-4 w-4 rounded accent-teal-600" /> SMS reminders for upcoming visits</label>
                  <label className="flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-teal-600" /> In-app notifications</label>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Email delivery uses the configured transactional email provider. SMS and push delivery require an additional provider to be configured.
                </p>
              </div>
              <div className="mt-5 flex justify-end"><button className={primaryBtn}>Save preferences</button></div>
            </section>
          )}

          {/* PRIVACY */}
          {tab === 'privacy' && (
            <section>
              <h3 className="text-sm font-semibold text-slate-900">Privacy &amp; data</h3>
              <p className="mt-1 text-xs text-slate-500">Control the health information stored against your account.</p>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Clear all health data</p>
                    <p className="text-xs text-amber-800">
                      This permanently deletes appointments, prescriptions, messages, documents, emergency contacts and symptom-checker history. Your account and personal details stay.
                    </p>
                  </div>
                </div>
                <label className="mt-3 flex items-center gap-2 text-xs text-amber-900">
                  <input type="checkbox" checked={clearAck} onChange={(e) => setClearAck(e.target.checked)} className="rounded accent-teal-600" />
                  I understand this cannot be undone.
                </label>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <div className="min-w-[200px] flex-1">
                    <label className={labelCls}>Password</label>
                    <input type="password" value={clearPw} onChange={(e) => setClearPw(e.target.value)} className={inputCls} />
                  </div>
                  {/* TODO: connect to the clear-health-data API */}
                  <button disabled={!clearAck || !clearPw} onClick={() => setNotice(NOT_CONNECTED)} className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">
                    Yes, clear all data
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-start gap-3">
                  <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Delete account</p>
                    <p className="text-xs text-rose-800">Deletes your account, health record and stored files permanently. Type <strong>DELETE</strong> and confirm with your password.</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <div className="min-w-[160px] flex-1">
                    <label className={labelCls}>Type DELETE</label>
                    <input value={deleteText} onChange={(e) => setDeleteText(e.target.value)} placeholder="DELETE" className={inputCls} />
                  </div>
                  <div className="min-w-[160px] flex-1">
                    <label className={labelCls}>Password</label>
                    <input type="password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} className={inputCls} />
                  </div>
                  {/* TODO: connect to the delete-account API */}
                  <button disabled={deleteText !== 'DELETE' || !deletePw} onClick={() => setNotice(NOT_CONNECTED)} className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">
                    Delete account
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Sign out</p>
                  <p className="text-xs text-slate-500">End your session on this device.</p>
                </div>
                {/* TODO: call the same sign-out the sidebar uses */}
                <button onClick={() => setNotice('Use Sign out in the sidebar for now.')} className={cn(outlineBtn, 'inline-flex items-center gap-2')}>
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </section>
          )}

          {notice && (
            <p className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <TriangleAlert className="h-3.5 w-3.5 shrink-0" /> {notice}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsInner />
    </Suspense>
  );
}