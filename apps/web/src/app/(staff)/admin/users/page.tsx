'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type UserRow = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
  phone?: string;
};

type Org = { id: string; name: string; slug: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [newRole, setNewRole] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [orgId, setOrgId] = useState('');
  const [orgRole, setOrgRole] = useState('member');
  const [actionMsg, setActionMsg] = useState('');
  const [staff, setStaff] = useState({ specialty: '', licenseNumber: '', title: '', phone: '', organizationId: '', departmentId: '' });
  const [staffLoading, setStaffLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [uRes, oRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/organizations', { credentials: 'include' }),
      ]);
      if (!uRes.ok) throw new Error('Failed to load users');
      const uData = await uRes.json();
      setUsers(uData.users || []);
      if (oRes.ok) {
        const oData = await oRes.json();
        setOrgs(oData.organizations || []);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const doAction = async (path: string, body: any) => {
    if (!selected) return;
    setActionMsg('');
    try {
      const res = await fetch(`/api/admin/users/${selected.id}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      setActionMsg('Updated successfully');
      load();
    } catch (e) {
      setActionMsg((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users & Roles</h1>
          <p className="text-sm text-slate-500">Manage members, roles, passwords and organization membership.</p>
        </div>
        <Link href="/admin/register" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          Register new member
        </Link>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-xl border bg-white">
          {loading ? (
            <div className="flex items-center gap-3 p-8 text-sm text-slate-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
              Loading users…
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className={`hover:bg-slate-50 ${selected?.id === u.id ? 'bg-teal-50' : ''}`}>
                    <td className="px-4 py-3 font-medium">{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{u.role || 'user'}</span></td>
                    <td className="px-4 py-3">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => {
  setSelected(u);
  setNewRole(u.role || '');
  setActionMsg('');
  setStaffLoading(true);
  fetch(`/api/staff/user/${u.id}`, { credentials: 'include' })
    .then(r => r.ok ? r.json() : null)
    .then(d => {
      const sp = d?.staffProfile || {};
      setStaff({
        specialty: sp.specialty || '',
        licenseNumber: sp.licenseNumber || '',
        title: sp.title || '',
        phone: sp.phone || '',
        organizationId: sp.organizationId || '',
        departmentId: sp.departmentId || '',
      });
    })
    .finally(() => setStaffLoading(false));
}} className="text-xs text-teal-600 hover:underline">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-xl border bg-white p-5">
          {selected ? (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold">{[selected.firstName, selected.lastName].filter(Boolean).join(' ') || selected.email}</h3>
                <p className="text-xs text-slate-500">{selected.email}</p>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase text-slate-500">Role</label>
                <div className="mt-1 flex gap-2">
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm">
                    <option value="patient">patient</option>
                    <option value="doctor">doctor</option>
                    <option value="labTech">labTech</option>
                    <option value="pharmacist">pharmacist</option>
                    <option value="nurse">nurse</option>
                    <option value="admin">admin</option>
                    <option value="superadmin">superadmin</option>
                  </select>
                  <button onClick={() => doAction('role', { role: newRole })} className="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white">Set</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase text-slate-500">Set password</label>
                <div className="mt-1 flex gap-2">
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="min 8 chars" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                  <button onClick={() => doAction('password', { password: newPassword })} className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white">Update</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase text-slate-500">Assign organization</label>
                <div className="mt-1 space-y-2">
                  <select value={orgId} onChange={(e) => setOrgId(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
                    <option value="">Select organization</option>
                    {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                  <select value={orgRole} onChange={(e) => setOrgRole(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                    <option value="owner">owner</option>
                  </select>
                  <button onClick={() => doAction('organization', { organizationId: orgId, role: orgRole })} disabled={!orgId} className="w-full rounded-lg bg-teal-600 px-3 py-2 text-sm text-white disabled:opacity-50">
                    Assign
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium">Staff profile</h4>
                {staffLoading ? (
                  <p className="mt-2 text-xs text-slate-500">Loading…</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    <input placeholder="Title" value={staff.title} onChange={e => setStaff({...staff, title: e.target.value})} className="w-full rounded-lg border px-3 py-2 text-sm" />
                    <input placeholder="Specialty" value={staff.specialty} onChange={e => setStaff({...staff, specialty: e.target.value})} className="w-full rounded-lg border px-3 py-2 text-sm" />
                    <input placeholder="License number" value={staff.licenseNumber} onChange={e => setStaff({...staff, licenseNumber: e.target.value})} className="w-full rounded-lg border px-3 py-2 text-sm" />
                    <input placeholder="Phone" value={staff.phone} onChange={e => setStaff({...staff, phone: e.target.value})} className="w-full rounded-lg border px-3 py-2 text-sm" />
                    <input placeholder="Organization ID" value={staff.organizationId} onChange={e => setStaff({...staff, organizationId: e.target.value})} className="w-full rounded-lg border px-3 py-2 text-sm" />
                    <input placeholder="Department ID" value={staff.departmentId} onChange={e => setStaff({...staff, departmentId: e.target.value})} className="w-full rounded-lg border px-3 py-2 text-sm" />
                    <button
                      onClick={async () => {
                        setActionMsg('');
                        try {
                          const res = await fetch('/api/staff', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ userId: selected.id, ...staff }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Save failed');
                          setActionMsg('Staff profile saved');
                        } catch (e) {
                          setActionMsg((e as Error).message);
                        }
                      }}
                      className="w-full rounded-lg bg-teal-600 px-3 py-2 text-sm text-white"
                    >
                      Save staff profile
                    </button>
                  </div>
                )}
              </div>

              {actionMsg && <p className="text-sm text-slate-700">{actionMsg}</p>}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a user to manage role, password and organization membership.</p>
          )}
        </div>
      </div>
    </div>
  );
}
