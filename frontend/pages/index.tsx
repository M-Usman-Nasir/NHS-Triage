import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { DM_Serif_Display } from 'next/font/google';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Bandage,
  ClipboardList,
  Droplet,
  ExternalLink,
  Shield,
  ShieldCheck,
  Siren,
  Sparkles,
  Stethoscope,
  TriangleAlert,
  Wind,
  Zap,
} from 'lucide-react';
import { PATIENT_PATHWAYS } from '../lib/patientPathways';

/** Raster tiles in `public/images/pathways/` (rest use Lucide below). */
const PATHWAY_RASTER_SRC: Record<string, string> = {
  sore_throat: '/images/pathways/cough.png',
  otitis_media: '/images/pathways/earache.png',
  insect_bites: '/images/pathways/mosquito.png',
};

const fontDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

/** Lucide tiles for pathways without a custom PNG in `public/images/pathways/`. */
const PATHWAY_ICONS: Partial<Record<string, LucideIcon>> = {
  uti: Droplet,
  sinusitis: Wind,
  impetigo: Bandage,
  shingles: Zap,
};

const STEPS: Array<{ step: string; title: string; Icon: LucideIcon }> = [
  { step: '1', title: 'Choose symptom', Icon: Stethoscope },
  { step: '2', title: 'Answer questions', Icon: ClipboardList },
  { step: '3', title: 'Get advice', Icon: ShieldCheck },
];

const FOOTER_LINKS: Array<{ label: string; href: string; external?: boolean }> = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Accessibility', href: '/accessibility' },
  { label: 'NHS 111 Online', href: 'https://111.nhs.uk/', external: true },
];

/** Decorative wavy line behind the step cards (neon-blue glow). */
function StepperWave() {
  return (
    <svg
      className="pointer-events-none absolute left-[6%] right-[6%] top-[58%] z-0 h-10 w-[88%] -translate-y-1/2 overflow-visible text-primary/50 sm:left-[4%] sm:right-[4%] sm:w-[92%]"
      viewBox="0 0 800 48"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <filter id="landing-wave-glow" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M0,28 C120,8 200,40 320,24 S520,4 640,26 S760,36 800,22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#landing-wave-glow)"
        className="drop-shadow-[0_0_12px_rgba(59,130,246,0.45)]"
      />
    </svg>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState('');

  useEffect(() => {
    setConsentGiven(false);
  }, [selectedPathway]);

  const handleStart = () => {
    if (!consentGiven || !selectedPathway) return;
    router.push(`/consultation?pathway=${selectedPathway}`);
  };

  const selected = PATIENT_PATHWAYS.find((p) => p.code === selectedPathway);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-b from-sky-50 via-[#e8f2ff] to-slate-50">
      {/* Subtle medical cross / dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg fill='%232563eb' fill-opacity='0.06'%3E%3Cpath d='M22 10h4v12h12v4H26v12h-4V26H10v-4h12V10z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(52vh,28rem)] bg-[radial-gradient(ellipse_85%_70%_at_50%_-5%,rgba(37,99,235,0.14),transparent_65%)]"
        aria-hidden
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 border-b border-sky-200/70 bg-white/70 text-foreground shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground shadow-md ring-2 ring-primary/20"
              aria-hidden
            >
              A
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold leading-tight tracking-tight text-slate-900">Aegis Health AI</p>
              <p className="hidden truncate text-xs font-medium leading-tight text-slate-500 sm:block">
                NHS-aligned Clinical Triage
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/crm"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-4 sm:text-sm"
            >
              Staff CRM
              <ArrowRight className="h-3.5 w-3.5 opacity-95" strokeWidth={2} aria-hidden />
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary/25 bg-white/90 px-3.5 py-2 text-xs font-semibold text-primary shadow-sm transition hover:border-primary/40 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-4 sm:text-sm"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-primary/30 bg-primary/5" aria-hidden>
                <Shield className="h-3 w-3 text-primary" strokeWidth={2} />
              </span>
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-5 sm:py-10">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Pharmacy First &amp; GP pathways
          </p>
          <h1
            className={`mb-3 text-balance text-[1.75rem] leading-tight tracking-tight text-slate-900 sm:text-4xl sm:leading-[1.15] md:text-[2.35rem] ${fontDisplay.className}`}
          >
            Get the right care, right now
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
            Answer a few questions and we&apos;ll guide you to the best next step — whether that&apos;s a pharmacist,
            your GP practice, or emergency services when it&apos;s urgent.
          </p>
        </div>

        <div className="relative mb-10 sm:mb-12">
          <StepperWave />
          <ol className="relative z-10 grid list-none grid-cols-3 gap-2 p-0 sm:gap-4" aria-label="How it works">
            {STEPS.map(({ step, title, Icon }) => (
              <li key={step} className="min-w-0">
                <div className="flex h-full flex-col items-center rounded-2xl border border-white/70 bg-white/45 px-2 py-3 text-center shadow-lg shadow-sky-900/5 backdrop-blur-md transition hover:bg-white/60 hover:shadow-xl sm:px-3 sm:py-4">
                  <span
                    className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-inner sm:h-11 sm:w-11"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={1.75} />
                  </span>
                  <span className="mb-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-sm sm:h-7 sm:w-7 sm:text-xs">
                    {step}
                  </span>
                  <span className="text-[11px] font-semibold leading-tight text-slate-800 sm:text-xs">{title}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="overflow-hidden rounded-2xl border border-sky-200/60 bg-white/90 shadow-2xl shadow-sky-900/10 backdrop-blur-sm sm:rounded-3xl">
          <div className="relative bg-[#1e40af] px-4 py-4 sm:px-6 sm:py-5">
            <div
              className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.07)_40%,transparent_72%)]"
              aria-hidden
            />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">Start a consultation</h2>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-blue-100/95 sm:text-sm">
                  Free, confidential, NHS-aligned guidance — not a replacement for speaking to a clinician when you need
                  one.
                </p>
              </div>
              <p className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white sm:self-auto sm:text-xs">
                <Shield className="h-3.5 w-3.5 shrink-0 opacity-95" strokeWidth={2} aria-hidden />
                UK GDPR
              </p>
            </div>
          </div>

          <div className="border-t border-sky-100/80 bg-white/95 p-4 sm:p-6">
            <fieldset className="m-0 mb-5 min-w-0 border-0 p-0" aria-describedby="pathway-hint">
              <legend className="mb-1 block px-0 text-sm font-bold text-slate-900 sm:text-base">What are your main symptoms?</legend>
              <p id="pathway-hint" className="mb-3 text-xs leading-relaxed text-slate-500 sm:text-sm">
                Tap a pathway to select it. Tap the same one again to clear, or choose another before you begin.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                {PATIENT_PATHWAYS.map((p) => {
                  const PathwayIcon = PATHWAY_ICONS[p.code];
                  const isSelected = selectedPathway === p.code;
                  return (
                    <button
                      key={p.code}
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={`${p.fullLabel}. ${p.description}${isSelected ? ' Selected. Press to clear selection.' : ''}`}
                      onClick={() => setSelectedPathway(isSelected ? '' : p.code)}
                      className={`flex min-h-[6.5rem] flex-col items-center rounded-2xl border p-2.5 text-center shadow-md transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:min-h-[7rem] sm:p-3 ${
                        isSelected
                          ? 'border-primary bg-primary/12 shadow-lg shadow-primary/15 ring-2 ring-primary/30 backdrop-blur-md'
                          : 'border-white/80 bg-white/50 backdrop-blur-md hover:border-sky-300/90 hover:bg-white/75 hover:shadow-lg'
                      }`}
                    >
                      {PATHWAY_RASTER_SRC[p.code] ? (
                        <span
                          className={`relative mb-2 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-colors sm:h-12 sm:w-12 ${
                            isSelected ? 'bg-primary/15 ring-1 ring-primary/25' : 'bg-sky-50/90 ring-1 ring-sky-100'
                          }`}
                          aria-hidden
                        >
                          <Image
                            src={PATHWAY_RASTER_SRC[p.code]}
                            alt=""
                            width={48}
                            height={48}
                            className="object-contain object-center"
                            sizes="48px"
                          />
                        </span>
                      ) : PathwayIcon ? (
                        <span
                          className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl transition-colors sm:h-11 sm:w-11 ${
                            isSelected ? 'bg-primary/25 text-primary' : 'bg-primary/10 text-primary'
                          }`}
                          aria-hidden
                        >
                          <PathwayIcon className="h-5 w-5" strokeWidth={1.65} />
                        </span>
                      ) : null}
                      <span className="text-xs font-bold leading-tight text-slate-900">{p.label}</span>
                      <span className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-600 sm:text-[11px]">{p.description}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 min-h-[2rem]" aria-live="polite" aria-atomic="true">
                {selected ? (
                  <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary sm:text-sm">
                    <span className="text-slate-600">Selected:</span> {selected.fullLabel}
                  </p>
                ) : null}
              </div>
            </fieldset>

            {selectedPathway ? (
              <div className="mb-5 rounded-2xl border border-amber-200/90 bg-amber-50/95 p-3 shadow-sm backdrop-blur-sm sm:p-4">
                <div className="mb-2 flex items-start gap-2">
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700"
                    aria-hidden
                  >
                    <TriangleAlert className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <h3 className="text-sm font-bold text-amber-900">Important — Please Read</h3>
                </div>
                <ul className="mb-2 list-disc space-y-0.5 pl-4 text-xs text-amber-900/95 sm:text-sm">
                  <li>Guidance only — not a substitute for professional advice.</li>
                  <li>
                    Life-threatening emergency? Call <strong>999</strong> immediately.
                  </li>
                  <li>Your data is processed under UK GDPR.</li>
                </ul>
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-input accent-primary"
                  />
                  <span className="text-xs font-medium leading-relaxed text-amber-950 sm:text-sm">
                    I understand and consent to proceeding with this consultation.
                  </span>
                </label>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleStart}
              disabled={!consentGiven || !selectedPathway}
              aria-disabled={!consentGiven || !selectedPathway}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-bold transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:py-4 sm:text-base ${
                consentGiven && selectedPathway
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-offset-white hover:bg-primary/90 focus-visible:ring-primary'
                  : 'cursor-not-allowed bg-slate-700 text-slate-200 shadow-inner focus-visible:ring-slate-500'
              }`}
            >
              {selectedPathway ? (
                <>
                  Begin {selected?.label} consultation
                  <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                </>
              ) : (
                'Select a condition to begin'
              )}
            </button>
            {!selectedPathway || !consentGiven ? (
              <p className="mt-2 text-center text-xs text-slate-500 sm:text-sm">
                {!selectedPathway
                  ? 'Choose a pathway above.'
                  : 'Please confirm you have read the information and consent to continue.'}
              </p>
            ) : null}
          </div>
        </div>

        <section
          className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200/90 bg-rose-50/95 p-4 shadow-sm backdrop-blur-sm sm:mt-8 sm:p-5"
          aria-labelledby="emergency-heading"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-sm"
            aria-hidden
          >
            <Siren className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h3 id="emergency-heading" className="text-base font-bold text-red-700">
              Life-threatening emergency?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-red-800/95">
              Do not use this tool. <strong className="font-extrabold">Call 999</strong> immediately or go to your nearest
              Accident &amp; Emergency.
            </p>
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200/80 pb-10 pt-8 sm:mt-12 sm:pb-12">
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2.5" aria-label="Footer links">
            {FOOTER_LINKS.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-sm text-slate-600 underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-md"
                >
                  {item.label}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-1 text-sm text-slate-600 underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-md"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </footer>
      </main>
    </div>
  );
}
