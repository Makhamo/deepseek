'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToVideo() {
  const router = useRouter();
  useEffect(() => { router.replace('/video'); }, [router]);
  return <div className="p-10 text-center text-slate-500">Redirecting to video conference…</div>;
}
