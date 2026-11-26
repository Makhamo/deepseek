'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'doctor' | 'labTech' | 'pharmacist' | 'nurse' | 'admin' | 'patient';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('doctor');
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    licenseNumber: '',
    specialty: '',
    practiceNumber: '',
    organizationId: '',
    departmentId: '',
    title: '',
    idNumber: '',
    dateOfBirth: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const endpoint = role === 'patient' ? '/api/register/patient' : '/api/register/staff';
    const body: any = {
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || undefined,
      gender: form.gender || undefined,
      role,
    };

    if (role === 'patient') {
      body.idNumber = form.idNumber || undefined;
      body.dateOfBirth = form.dateOfBirth || undefined;
      body.address = form.address || undefined;
    } else {
      body.licenseNumber = form.licenseNumber || undefined;
      body.specialty = form.specialty || undefined;
      body.practiceNumber = form.practiceNumber || undefined;
      body.organizationId = form.organizationId || undefined;
      body.departmentId = form.departmentId || undefined;
      body.title = form.title || undefined;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.detail || 'Registration failed');
      } else {
        setMessage(
          role === 'patient'
            ? `Patient registered. User ID / Patient ID: ${data.userId || data.patientId}`
            : `Staff (${role}) registered. They can now log in with email and password.`
        );
        setForm({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: '',
          gender: '',
          licenseNumber: '',
          specialty: '',
          practiceNumber: '',
          organizationId: '',
          departmentId: '',
          title: '',
          idNumber: '',
          dateOfBirth: '',
          address: '',
        });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Admin Portal — Register Member</h1>
      <p className="mb-4 text-sm text-slate-600">
        Register doctors, lab technicians, pharmacists, nurses, admins, or patients.
        All required auth information is collected. Staff will use real login credentials.
        Patients share the same User ID and Patient ID across all service databases.
      </p>

      <form onSubmit={submit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium">Role</label>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            <option value="doctor">Doctor</option>
            <option value="labTech">Lab Technician</option>
            <option value="pharmacist">Pharmacist</option>
            <option value="nurse">Nurse</option>
            <option value="admin">Admin</option>
            <option value="patient">Patient</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">First Name *</label>
            <input name="firstName" value={form.firstName} onChange={onChange} required className="mt-1 w-full rounded-lg border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name *</label>
            <input name="lastName" value={form.lastName} onChange={onChange} required className="mt-1 w-full rounded-lg border px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Email *</label>
          <input type="email" name="email" value={form.email} onChange={onChange} required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Password *</label>
          <input type="password" name="password" value={form.password} onChange={onChange} required minLength={8} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input name="phone" value={form.phone} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Gender</label>
            <select name="gender" value={form.gender} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2">
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {role !== 'patient' && (
          <>
            <div>
              <label className="block text-sm font-medium">License / Registration Number</label>
              <input name="licenseNumber" value={form.licenseNumber} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Specialty</label>
                <input name="specialty" value={form.specialty} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Practice Number</label>
                <input name="practiceNumber" value={form.practiceNumber} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input name="title" value={form.title} onChange={onChange} placeholder="Dr, Prof, etc." className="mt-1 w-full rounded-lg border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Organization ID</label>
                <input name="organizationId" value={form.organizationId} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Department ID</label>
              <input name="departmentId" value={form.departmentId} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
          </>
        )}

        {role === 'patient' && (
          <>
            <div>
              <label className="block text-sm font-medium">ID Number</label>
              <input name="idNumber" value={form.idNumber} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Address</label>
                <input name="address" value={form.address} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2" />
              </div>
            </div>
          </>
        )}

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {message && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? 'Registering…' : `Register ${role}`}
        </button>
      </form>

      <div className="mt-6 text-sm">
        <button onClick={() => router.push('/admin')} className="text-teal-600 hover:underline">
          ← Back to Admin
        </button>
      </div>
    </div>
  );
}
