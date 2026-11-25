'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authClient } from "@/lib/auth-client";

const ROLE_REDIRECT: Record<string, string> = {
  patient: '/portal',
  doctor: '/doctor',
  lab: '/lab',
  pharmacy: '/pharmacy',
  admin: '/admin',
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = params.get('role') || 'patient';
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('demo@unitachealth.co.za');
  const [password, setPassword] = useState('demo1234');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  const { data, error } = await authClient.signIn.email({
    email,
    password,
    // Optional: callback to store something
  });

  setLoading(false);

  if (error) {
    setError(error.message || "Invalid email or password");
    return;
  }

  // Fetch the unified access payload to know where to route
  const accessRes = await fetch(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/me/access`,
    { credentials: "include" }
  );
  const access = accessRes.ok ? await accessRes.json() : null;
  const realRole = access?.user?.role ?? "patient";

  const redirect =
    realRole === "patient"
      ? "/portal"
      : realRole === "admin" || realRole === "superadmin"
      ? "/admin"
      : realRole === "doctor"
      ? "/doctor"
      : realRole === "labtech"
      ? "/lab"
      : realRole === "pharmacist"
      ? "/pharmacy"
      : "/portal";

  router.push(redirect);
  router.refresh();
};

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-teal-700 to-teal-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 font-bold text-xl">
            UH
          </div>
          <h2 className="mt-10 text-3xl font-bold">Welcome back</h2>
          <p className="mt-3 max-w-sm text-teal-100">
            Secure access to appointments, results, prescriptions and care team tools.
          </p>
        </div>
        <p className="text-sm text-teal-200">© 2026 Unitac Healthcare</p>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link href="/platform" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" /> Back to platform
          </Link>

          <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Choose your role and continue with demo credentials.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor / Clinician</option>
                <option value="lab">Laboratory</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="admin">Platform Admin</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New patient?{' '}
            <Link href="/signup" className="font-medium text-teal-600 hover:text-teal-700">
              Create an account
            </Link>
          </p>

          <div className="mt-8 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
            <p className="font-medium text-slate-700">Demo credentials</p>
            <p className="mt-1">Any email + password works. Role determines the portal you enter.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

