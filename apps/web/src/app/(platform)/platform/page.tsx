'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowRight,
  Baby,
  CalendarCheck,
  FlaskConical,
  HeartPulse,
  Moon,
  Pill,
  ShieldCheck,
  Sparkles,
  Sun,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';

import labImg from '@/assets/Lab-Management.jpg';
import nicuImg from '@/assets/NICU-Management.jpg';
import claimsImg from '@/assets/Claims-Management.jpg';
import pharmacyImg from '@/assets/Pharmacy-Doctor.jpg';
import medicalTeamImg from '@/assets/Medical-Team.jpg';
import practiceImg from '@/assets/Practice-Management.jpg';
import triageImg from '@/assets/Triage-Management.jpg';

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

type Workspace = {
  id: string;
  name: string;
  summary: string;
  href: string;
  icon: LucideIcon;
  tile: string;
  image: typeof labImg;
};

const TILE = 'bg-gradient-to-br from-[#2e69c1] to-[#234f98]';

const WORKSPACES: Workspace[] = [
  {
    id: 'practice',
    name: 'Practice Management',
    summary: 'Patient registration, encounters, appointments, providers, facilities and billable services.',
    href: '/login?role=practice',
    icon: CalendarCheck,
    tile: TILE,
    image: practiceImg,
  },
  {
    id: 'triage',
    name: 'Triage Management',
    summary: 'Structured acuity assessment, observations and a clinician-reviewed queue.',
    href: '/login?role=triage',
    icon: HeartPulse,
    tile: TILE,
    image: triageImg,
  },
  {
    id: 'lab',
    name: 'Laboratory Management',
    summary: 'Orders, specimens, preliminary results and supervisor verification with neonatal ranges.',
    href: '/login?role=lab',
    icon: FlaskConical,
    tile: TILE,
    image: labImg,
  },
  {
    id: 'nicu',
    name: 'NICU Management',
    summary: 'Independent infant identities, admissions, observations, neonatal labs and NICU billing.',
    href: '/login?role=nicu',
    icon: Baby,
    tile: TILE,
    image: nicuImg,
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy & Prescribing',
    summary: 'Prescriptions, dispensing transactions, triage context and medication claim handoff.',
    href: '/login?role=pharmacy',
    icon: Pill,
    tile: TILE,
    image: pharmacyImg,
  },
  {
    id: 'claims',
    name: 'Claims Management',
    summary: 'Claim lifecycle, adjudication, rejections, partial payment and financial outcomes.',
    href: '/login?role=claims',
    icon: ShieldCheck,
    tile: TILE,
    image: claimsImg,
  },
];

const INTEGRATIONS = [
  { id: 'INT-01', from: 'Practice Management', to: 'Triage' },
  { id: 'INT-02', from: 'Triage', to: 'Pharmacy' },
  { id: 'INT-03', from: 'Practice Management', to: 'Laboratory' },
  { id: 'INT-04', from: 'Pharmacy', to: 'Laboratory' },
  { id: 'INT-05', from: 'NICU', to: 'Laboratory' },
  { id: 'INT-06', from: 'Practice Management', to: 'Claims' },
  { id: 'INT-07', from: 'Pharmacy', to: 'Claims' },
  { id: 'INT-08', from: 'NICU', to: 'Claims' },
];

const SAFEGUARDS = [
  { title: 'Patient ID', text: 'PM source of truth' },
  { title: 'Encounter ID', text: 'Links every module' },
  { title: 'Infant ID', text: 'Never merged with mother' },
  { title: 'Idempotency', text: 'Unique event keys' },
  { title: 'Verification', text: 'Preliminary \u2260 final' },
  { title: 'Audit trail', text: 'Source and target records' },
];

const TRUST = [
  { icon: ShieldCheck, label: 'One patient identity' },
  { icon: TriangleAlert, label: 'Infant-safe identifiers' },
  { icon: Sparkles, label: 'Verified results only' },
];

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const container = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]';
const eyebrow = 'text-[11px] font-bold uppercase tracking-[0.18em] text-[#2b5f9f]';
const sectionHeading = 'text-[1.7rem] font-semibold leading-tight tracking-tighter text-[#0f1b24]';

export default function PlatformLandingPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);

  // The inline script in layout.tsx sets data-theme before first paint.
  // Here we only sync React state (for the toggle icon) with it.
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax/tilt is driven by CSS variables written outside React,
  // so mouse movement never triggers a re-render of the page.
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return;
    const { clientX, clientY } = e;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', String(((clientX - rect.left) / rect.width - 0.5) * 20));
      el.style.setProperty('--my', String(((clientY - rect.top) / rect.height - 0.5) * 20));
    });
  }, []);

  const resetPointer = useCallback(() => {
    const el = heroRef.current;
    if (!el) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    el.style.setProperty('--mx', '0');
    el.style.setProperty('--my', '0');
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    try {
      window.localStorage.setItem('unitac-theme', nextTheme);
    } catch {
      /* storage unavailable (private mode); theme still applies for this session */
    }
    setTheme(nextTheme);
  };

  return (
    <div
      className="platform-shell min-h-screen overflow-x-clip bg-white text-[#16232e] antialiased selection:bg-[#2b5f9f]/10 selection:text-[#2b5f9f]"
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-30 border-b transition-all duration-300 ${
          scrolled
            ? 'border-[#e0e7f0] bg-white/80 shadow-[0_1px_12px_rgba(22,35,46,0.06)] backdrop-blur-xl'
            : 'border-transparent bg-white/95 backdrop-blur-md'
        }`}
      >
        <div className={`${container} flex h-[72px] items-center justify-between`}>
          <Link href="/" className={`group flex min-w-0 items-center gap-3 rounded-md ${focusRing}`}>
            <span className="brand-mark relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#3478d8] to-[#214f9c] text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
              <HeartPulse className="h-5 w-5 animate-heartbeat" aria-hidden />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight">Unitac Health</span>
              <span className="hidden text-[11px] font-medium uppercase tracking-widest text-[#607087] sm:block">
                Unified health system
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {[
              { href: '#workspaces', label: 'Workspaces' },
              { href: '#integrations', label: 'Connected care' },
              { href: '#safeguards', label: 'Patient safety' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`group relative rounded-md px-3 py-2 text-sm font-medium text-[#607087] transition-colors hover:text-[#16232e] ${focusRing}`}
              >
                {label}
                <span className="absolute inset-x-3 bottom-1 h-[1.5px] origin-left scale-x-0 rounded-full bg-[#2e69c1] transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`theme-toggle flex h-10 w-10 items-center justify-center rounded-md border border-[#e0e7f0] text-[#607087] transition-all duration-200 hover:border-[#bfd0e4] hover:bg-[#f3f7fc] hover:text-[#16232e] active:scale-95 ${focusRing}`}
            >
              <span className="relative h-4 w-4">
                <Sun
                  className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${
                    theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
                  }`}
                  aria-hidden
                />
                <Moon
                  className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${
                    theme === 'dark' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                  }`}
                  aria-hidden
                />
              </span>
            </button>
            <Link
              href="/login"
              className={`primary-action group inline-flex items-center gap-2 rounded-md bg-gradient-to-b from-[#2e69c1] to-[#234f98] px-3 py-2.5 text-[13px] font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.18)] transition-all duration-200 hover:from-[#2559a5] hover:to-[#1c447f] hover:shadow-[0_16px_36px_rgba(37,99,235,0.24)] active:scale-[0.98] sm:px-4 ${focusRing}`}
            >
              <span className="hidden sm:inline">Open my workspace</span>
              <span className="sm:hidden">Sign in</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
        <nav aria-label="Mobile" className="border-t border-[#e0e7f0] lg:hidden">
          <div className={`${container} no-scrollbar flex gap-3 overflow-x-auto py-2.5 text-xs font-medium text-[#607087] sm:gap-6`}>
            <a href="#workspaces" className={`shrink-0 rounded-sm transition-colors hover:text-[#16232e] ${focusRing}`}>Workspaces</a>
            <a href="#integrations" className={`shrink-0 rounded-sm transition-colors hover:text-[#16232e] ${focusRing}`}>Connected care</a>
            <a href="#safeguards" className={`shrink-0 rounded-sm transition-colors hover:text-[#16232e] ${focusRing}`}>Patient safety</a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetPointer}
          className="hero-section relative isolate overflow-hidden border-b border-[#e0e7f0]"
        >
          {/* Animated background grid */}
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-50" />
          {/* Animated blobs */}
          {/* Parallax wrappers: the blob keyframes own the inner transform, so the pointer offset lives on the wrapper */}
          <div className="hero-parallax pointer-events-none absolute inset-0" style={{ '--k': 0.5 } as React.CSSProperties} aria-hidden="true">
            <div className="hero-glow hero-glow-blue absolute left-[46%] top-[-18rem] h-[36rem] w-[36rem] rounded-full bg-[#5b91e2]/[0.16] blur-3xl animate-blob" />
          </div>
          <div className="hero-parallax pointer-events-none absolute inset-0" style={{ '--k': -0.3 } as React.CSSProperties} aria-hidden="true">
            <div className="hero-glow hero-glow-slate absolute -right-[10rem] bottom-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[#8fa6cf]/[0.14] blur-3xl animate-blob animation-delay-2000" />
          </div>
          <div className="hero-sparkles pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="hero-sparkle" />
            ))}
          </div>

          <div className={`${container} relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:py-24`}>
            <div className="hero-copy max-w-[650px]">
              <h1 className="max-w-[650px] text-[clamp(2.3rem,8vw,4.3rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#0f1b24] animate-fade-in-up sm:text-[clamp(2.9rem,5vw,4.3rem)]">
                <span className="block">Connected care</span>
                <span className="hero-title-accent mt-1 block bg-gradient-to-r from-[#2867bd] via-[#5488ce] to-[#2867bd] bg-clip-text text-transparent">
                  for every patient.
                </span>
              </h1>
              <p className="mt-6 max-w-[550px] text-[15px] leading-[1.8] text-[#607087] sm:text-base animate-fade-in-up animation-delay-200">
                Bring seven care workspaces together around one trusted patient record, with verified clinical data and
                clear handoffs from first encounter to final claim.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-up animation-delay-400">
                <Link
                  href="/login"
                  className={`primary-action group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-b from-[#2e69c1] to-[#234f98] px-5 py-3.5 text-[13px] font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.18)] transition-all duration-300 hover:from-[#2559a5] hover:to-[#1c447f] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(37,99,235,0.24)] active:translate-y-0 ${focusRing}`}
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">Enter your workspace</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
                <Link
                  href="/signup"
                  className={`secondary-action group inline-flex items-center rounded-full border border-[#d7e0eb] bg-white/90 px-5 py-3.5 text-[13px] font-semibold text-[#16232e] shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[#bfd0e4] hover:bg-white hover:shadow-md active:translate-y-0 ${focusRing}`}
                >
                  Create patient account
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                </Link>
              </div>

              <ul className="mt-8 grid max-w-[620px] grid-cols-1 gap-y-3 border-t border-[#e0e7f0] pt-5 text-[11px] font-medium text-[#607087] animate-fade-in-up animation-delay-600 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-0">
                {TRUST.map(({ icon: Icon, label }, i) => (
                  <li key={label} className="flex min-w-0 items-center gap-2.5" style={{ animationDelay: `${800 + i * 100}ms` }}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf3fb]">
                      <Icon className="h-4 w-4 text-[#2b5f9f]" aria-hidden />
                    </span>
                    <span className="leading-snug">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side: clinical visual with 3D tilt */}
            <div className="hero-visual relative min-w-0">
              <div className="hero-visual-glow absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-[rgba(93,143,213,0.34)] via-transparent to-[rgba(121,148,193,0.2)] opacity-50 blur-xl" />
              <div
                className="hero-image-card group overflow-hidden rounded-2xl shadow-[0_20px_56px_rgba(15,35,65,0.12)]"
              >
                <div className="hero-image-frame relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-[#e9eff7]">
                  <Image
                    src={medicalTeamImg}
                    alt="Medical professionals collaborating around a patient"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="hero-image object-cover object-center transition-transform duration-700 group-hover:scale-[1.015]"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics strip */}
        <section aria-label="Platform at a glance" className="metrics-strip border-b border-[#e1e8f1] bg-white">
          <div className={`${container} grid divide-y divide-[#e0e7f0] py-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0`}>
            {[
              { value: '07', label: 'connected workspaces' },
              { value: '08', label: 'controlled exchanges' },
              { value: '01', label: 'shared patient identity' },
            ].map(({ value, label }, i) => (
              <Reveal key={label} delay={i * 100}>
                <div className="group flex items-center gap-4 px-2 py-4 sm:justify-center sm:py-5">
                  <span className="font-mono text-2xl font-semibold tracking-tight text-[#2b5f9f] transition-transform duration-300 group-hover:scale-110">
                    {value}
                  </span>
                  <span className="text-xs font-medium text-[#607087]">{label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Workspaces */}
        <section id="workspaces" className="scroll-mt-24 py-20 sm:py-24">
          <div className={container}>
            <Reveal>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <span className={eyebrow}>Connected applications</span>
                  <h2 className={`mt-3 ${sectionHeading} text-[clamp(1.75rem,8vw,2.25rem)] sm:text-[2.75rem]`}>
                    One record.<br /><span className="text-[#607087]">Every point of care.</span>
                  </h2>
                </div>
                <p className="max-w-[390px] text-[13px] leading-relaxed text-[#607087]">
                  Six operational workspaces, linked by one patient index and supported by a secure patient portal.
                </p>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {WORKSPACES.map(({ id, name, summary, href, icon: Icon, tile, image }, index) => (
                <Reveal key={id} delay={index * 80}>
                  <Link
                    href={href}
                    className={`workspace-card group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-[#e0e7f0] bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-[#c1d1e6] hover:shadow-[0_22px_50px_rgba(22,35,46,0.11)] ${focusRing}`}
                  >
                    <div className="workspace-image-frame relative aspect-[16/10] w-full overflow-hidden bg-[#e9eff7]">
                      <Image
                        src={image}
                        alt={name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                      {/* Gradient overlay on hover */}
                      <div className="workspace-image-shade absolute inset-0 bg-gradient-to-t from-[#0e213e]/[0.42] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-[#10233d]/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md transition-all duration-300 group-hover:bg-[#10233d]/85">
                        {String(index + 1).padStart(2, '0')}
                        <span className="sr-only"> workspace</span>
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tile} text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <div className="leading-tight">
                          <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#607087]">
                            Workspace
                          </span>
                          <h3 className="mt-0.5 text-base font-semibold tracking-tight">{name}</h3>
                        </div>
                      </div>
                      <p className="mt-4 flex-1 text-[13px] leading-relaxed text-[#607087]">{summary}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2b5f9f]">
                        Open application
                        <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>

            {/* Patient portal */}
            <Reveal delay={200}>
              <div className="portal-card group mt-5 flex flex-col gap-4 rounded-2xl border border-[#d7e3f2] bg-[linear-gradient(115deg,#f3f7fd,#fbfdff_65%,#eef4fb)] p-5 transition-all duration-300 hover:border-[#c1d1e6] hover:shadow-[0_8px_30px_rgba(37,99,235,0.1)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-4">
                  <span className="portal-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2e69c1] to-[#234f98] text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <HeartPulse className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-semibold text-[#214f8b]">Patient portal <span className="font-normal text-[#607087]">· workspace seven</span></h3>
                    <p className="mt-1 text-[12px] text-[#607087]">
                      Symptom intake, appointments, prescriptions, results, documents and secure messages.
                    </p>
                  </div>
                </div>
                <Link
                  href="/login?role=patient"
                  className={`portal-action group/btn inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#c8d7e9] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#285d9f] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#94b6d9] hover:shadow-md ${focusRing}`}
                >
                  Patient sign in
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/btn:translate-x-0.5" aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Integrations and safeguards share one tinted band */}
        <div className="integration-band border-t border-[#e1e8f1] bg-gradient-to-b from-[#f5f8fc] to-[#f0f4f9]">
          <section id="integrations" className="scroll-mt-24 pt-16">
            <div className={`${container} grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center`}>
              <Reveal>
                <div className="max-w-lg">
                  <span className={eyebrow}>Integrations</span>
                  <h2 className={`mt-3 ${sectionHeading} text-[clamp(1.75rem,7vw,2rem)] sm:text-[2.4rem]`}>Care that stays connected.</h2>
                  <p className="mt-3 max-w-md text-[13px] leading-relaxed text-[#607087]">
                    Each workspace stays focused on its role while sharing trusted patient and encounter references across the care journey.
                  </p>
                  <Link
                    href="/login?role=admin"
                    className={`primary-action group mt-6 inline-flex items-center gap-2 rounded-md bg-gradient-to-b from-[#2e69c1] to-[#234f98] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.18)] transition-all duration-300 hover:from-[#2559a5] hover:to-[#1c447f] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(37,99,235,0.24)] ${focusRing}`}
                  >
                    Open admin console
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </div>
              </Reveal>

              <div className="grid gap-3 sm:grid-cols-2">
                {INTEGRATIONS.map((row, i) => (
                  <Reveal key={row.id} delay={i * 60}>
                    <div className="integration-card group flex min-h-[76px] items-center gap-3 rounded-xl border border-[#e0e7f0] bg-white px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c1d1e6] hover:shadow-[0_12px_28px_rgba(22,35,46,0.06)]">
                      <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg bg-[#edf3fb] font-mono text-[11px] font-bold leading-none text-[#2b5f9f] transition-all duration-300 group-hover:bg-[#2e69c1] group-hover:text-white">
                        {row.id}
                      </span>
                      <span className="min-w-0 flex-1 text-[12px] font-semibold leading-snug text-[#16232e]">
                        <span className="block truncate">{row.from}</span>
                        <span className="relative my-1 block h-px w-8 overflow-hidden bg-[#aec1dc]" aria-hidden>
                          <span className="absolute inset-0 -translate-x-full bg-[#2e69c1] transition-transform duration-500 group-hover:translate-x-0" />
                        </span>
                        <span className="block truncate">{row.to}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#5c7eaf] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#2e69c1]" aria-hidden />
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section id="safeguards" className="scroll-mt-24 py-16">
            <div className={container}>
              <Reveal>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1a30] via-[#111e38] to-[#0d1729] p-8 text-white shadow-[0_20px_60px_rgba(15,26,48,0.25)] sm:p-10">
                  {/* Decorative glow */}
                  <div className="safety-glow pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#2563eb]/20 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#3b82f6]/10 blur-3xl" />

                  <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_488px] lg:items-center">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
                        Safety and Control
                      </span>
                      <h2 className="mt-3 text-[1.7rem] font-semibold leading-tight tracking-tighter">
                        References, not copies.<br />Verification, not assumption.
                      </h2>
                      <p className="mt-4 max-w-[480px] text-[12.5px] leading-relaxed text-slate-300">
                        A laboratory result is not final until verified. An approved claim is not paid. Triage context never creates a prescription. Each infant in a multiple birth keeps a distinct identity. These rules are enforced in the integration handlers, not only in the interface.
                      </p>
                    </div>

                    <dl className="grid gap-3 sm:grid-cols-2">
                      {SAFEGUARDS.map(({ title, text }, i) => (
                        <div
                          key={title}
                          className="group rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          <dt className="text-xs font-semibold transition-colors group-hover:text-[#9cc8ff]">{title}</dt>
                          <dd className="mt-0.5 text-[11px] text-slate-400">{text}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        </div>

        {/* Closing call to action */}
        <section className="closing-section relative overflow-hidden border-t border-[#e1e8f1] bg-white py-12">
          <div className="closing-glow pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.045),transparent_70%)]" />
          <div className={`${container} relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between`}>
            <Reveal>
              <div>
                <h2 className="text-[1.45rem] font-semibold tracking-tighter text-[#0f1b24]">Ready to review the system?</h2>
                <p className="mt-1.5 text-[13px] text-[#607087]">Use one of the seeded role accounts on the sign-in page.</p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className={`primary-action group rounded-md bg-gradient-to-b from-[#2e69c1] to-[#234f98] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.18)] transition-all duration-300 hover:from-[#2559a5] hover:to-[#1c447f] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(37,99,235,0.24)] ${focusRing}`}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className={`secondary-action rounded-md border border-[#d7e0eb] bg-white px-5 py-3 text-[13px] font-semibold text-[#16232e] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#bfd0e4] hover:bg-[#f3f7fc] hover:shadow-md ${focusRing}`}
                >
                  Create patient account
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e0e7f0] bg-white">
        <div className={`${container} flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between`}>
          <div className="flex items-center gap-3">
            <span className="brand-mark flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3478d8] to-[#214f9c] text-white shadow-sm">
              <HeartPulse className="h-5 w-5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight text-[#16232e]">Unitac Health</span>
              <span className="block text-[11px] font-medium uppercase tracking-widest text-[#607087]">
                Unified health system
              </span>
            </span>
          </div>
          <p className="max-w-md text-[11px] leading-relaxed text-[#607087]">
            Unitac Health is a demonstration Unified Healthcare System. Clinical decisions remain with authorized healthcare professionals.
          </p>
          <p className="text-[11px] text-[#607087]">&copy; 2026 Unitac Health</p>
        </div>
      </footer>
    </div>
  );
}