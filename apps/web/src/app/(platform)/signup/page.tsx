'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

type FieldErrors = Partial<
  Record<
    'email' | 'password' | 'firstName' | 'lastName' | 'form',
    string
  >
>;

type ApiErrorBody = {
  error?: string;
  code?: string;
  detail?: string;
  hint?: string;
  loginPath?: string;
  email?: string;
  fields?: Record<string, string | null>;
  exists?: boolean;
};

const field =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-500/30 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4';

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiDetail, setApiDetail] = useState<ApiErrorBody | null>(null);
  const [emailExists, setEmailExists] = useState(false);
  // Dev helper: allow overwriting an existing account on this machine
  const [forceReRegister, setForceReRegister] = useState(false);

  const clearErrors = () => {
    setFieldErrors({});
    setApiDetail(null);
  };

  const checkEmailExists = useCallback(async (value: string) => {
    const e = value.trim().toLowerCase();
    if (!e || !e.includes('@')) {
      setEmailExists(false);
      return false;
    }
    setCheckingEmail(true);
    try {
      const res = await fetch(
        `/api/register/check-email?email=${encodeURIComponent(e)}`,
        { cache: 'no-store' }
      );
      const body = (await res.json().catch(() => ({}))) as ApiErrorBody & {
        exists?: boolean;
        message?: string;
      };
      if (!res.ok) {
        // Don't block form if check fails — registration will still validate
        setEmailExists(false);
        return false;
      }
      const exists = Boolean(body.exists);
      setEmailExists(exists);
      if (exists) {
        setFieldErrors((prev) => ({
          ...prev,
          email:
            body.message ||
            body.error ||
            'An account with this email already exists',
        }));
        setApiDetail({
          error: body.message || body.error || 'Email already registered',
          code: 'EMAIL_EXISTS',
          hint: body.hint || 'Sign in instead, or enable “Replace existing account”.',
          loginPath: '/login',
          email: e,
        });
      } else {
        setFieldErrors((prev) => {
          const next = { ...prev };
          if (next.email?.toLowerCase().includes('already')) delete next.email;
          return next;
        });
        setApiDetail(null);
      }
      return exists;
    } catch {
      setEmailExists(false);
      return false;
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  const validateClient = (): boolean => {
    const next: FieldErrors = {};
    if (!firstName.trim()) next.firstName = 'First name is required';
    if (!lastName.trim()) next.lastName = 'Last name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!email.includes('@')) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'At least 8 characters';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (!validateClient()) return;

    setLoading(true);

    const exists = await checkEmailExists(email);
    if (exists && !forceReRegister) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/register/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
          gender: gender || undefined,
          idNumber: idNumber.trim() || undefined,
          dateOfBirth: dateOfBirth || undefined,
          address: address.trim() || undefined,
          role: 'patient',
          forceReRegister: forceReRegister || undefined, // dev only; server ignores it in production
        }),
      });

      const body = (await res.json().catch(() => ({}))) as ApiErrorBody;

      if (!res.ok) {
        const msg =
          body.error ||
          (res.status === 409
            ? 'An account with this email already exists'
            : `Registration failed (${res.status})`);

        setApiDetail({
          error: msg,
          code: body.code || `HTTP_${res.status}`,
          detail: body.detail,
          hint: body.hint,
          loginPath: body.loginPath || (res.status === 409 ? '/login' : undefined),
          email: body.email || email.trim(),
          fields: body.fields,
        });

        if (body.fields) {
          const mapped: FieldErrors = {};
          for (const [k, v] of Object.entries(body.fields)) {
            if (v && k in { email: 1, password: 1, firstName: 1, lastName: 1 }) {
              mapped[k as keyof FieldErrors] = v;
            }
          }
          setFieldErrors((prev) => ({ ...prev, ...mapped }));
        }
        if (res.status === 409 || body.code === 'EMAIL_EXISTS') {
          setEmailExists(true);
          setFieldErrors((prev) => ({
            ...prev,
            email: msg,
          }));
        }
        setLoading(false);
        return;
      }

      const { error: signInError } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (signInError) {
        console.warn('auto sign-in failed', signInError);
        setApiDetail({
          error: 'Account created, but automatic sign-in failed',
          code: 'SIGNIN_AFTER_SIGNUP',
          detail: signInError.message || String(signInError),
          hint: 'You can sign in manually with the same email and password.',
          loginPath: '/login',
        });
        setLoading(false);
        return;
      }

      router.push('/portal');
      router.refresh();
    } catch (err: any) {
      setApiDetail({
        error: 'Network error — could not reach the server',
        code: 'NETWORK',
        detail: err?.message || String(err),
        hint: 'Is the web app and auth hub (port 4001) running?',
      });
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Create your patient account
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Access appointments, labs, prescriptions, and more.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              First name
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={field}
              autoComplete="given-name"
              required
            />
            {fieldErrors.firstName && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Last name
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={field}
              autoComplete="family-name"
              required
            />
            {fieldErrors.lastName && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailExists(false);
            }}
            onBlur={() => {
              if (email.trim()) void checkEmailExists(email);
            }}
            className={field}
            autoComplete="email"
            required
          />
          {checkingEmail && (
            <p className="mt-1 text-xs text-slate-500">Checking email…</p>
          )}
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
          {emailExists && !forceReRegister && (
            <p className="mt-1 text-xs text-amber-700">
              This email is already registered.{' '}
              <Link href="/login" className="font-medium underline">
                Sign in
              </Link>{' '}
              or tick “Replace existing account” below to re-register (dev).
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
            autoComplete="new-password"
            minLength={8}
            required
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={field}
              autoComplete="tel"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={field}
            >
              <option value="">Select…</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              ID number
            </label>
            <input
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Date of birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={field}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Address
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className={field}
          />
        </div>

        <label className="flex items-start gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={forceReRegister}
            onChange={(e) => setForceReRegister(e.target.checked)}
          />
          <span>
            <strong className="font-medium text-slate-800">
              Replace existing account
            </strong>{' '}
            (dev only) — deletes the previous user with this email and creates a
            new one.
          </span>
        </label>

        {apiDetail && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800"
          >
            <p className="font-medium">{apiDetail.error}</p>
            {apiDetail.code && (
              <p className="mt-1 font-mono text-xs text-red-600/90">
                code: {apiDetail.code}
              </p>
            )}
            {apiDetail.detail && (
              <p className="mt-1 text-xs text-red-700/90 break-words">
                {apiDetail.detail}
              </p>
            )}
            {apiDetail.hint && (
              <p className="mt-2 text-xs text-red-900/80">{apiDetail.hint}</p>
            )}
            {apiDetail.loginPath && (
              <p className="mt-2">
                <Link
                  href={apiDetail.loginPath}
                  className="font-medium text-teal-700 underline hover:text-teal-800"
                >
                  Go to sign in
                </Link>
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (emailExists && !forceReRegister)}
          className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {loading
            ? 'Creating account…'
            : emailExists && !forceReRegister
              ? 'Email already registered'
              : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-teal-600 hover:text-teal-700"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
