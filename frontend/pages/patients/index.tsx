import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { DM_Serif_Display } from 'next/font/google';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  Bandage,
  Bug,
  ClipboardList,
  Droplet,
  Ear,
  ExternalLink,
  Shield,
  ShieldCheck,
  Siren,
  Sparkles,
  Stethoscope,
  Thermometer,
  TriangleAlert,
  Wind,
  Zap,
} from 'lucide-react';
import { PATIENT_PATHWAYS } from '../../lib/patientPathways';
import {
  CONSENT_CHECKBOX_LABEL,
  CONSENT_COPY_VERSION,
  PRIVACY_LINK_LABEL,
  TERMS_LINK_LABEL,
} from '../../lib/complianceContent';

const fontDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const PATHWAY_ICONS: Partial<Record<string, LucideIcon>> = {
  uti: Droplet,
  sore_throat: Thermometer,
  sinusitis: Wind,
  otitis_media: Ear,
  insect_bites: Bug,
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

export default function PatientsLandingPage() {
  const router = useRouter();
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedPathways, setSelectedPathways] = useState<string[]>([]);

  useEffect(() => {
    if (selectedPathways.length === 0) {
      setConsentGiven(false);
    }
  }, [selectedPathways]);

  const handleStart = () => {
    if (!consentGiven || selectedPathways.length === 0) return;
    const encoded = encodeURIComponent(selectedPathways.join(','));
    router.push(`/consultation?pathways=${encoded}`);
  };

  const selectedPathwayLabels = PATIENT_PATHWAYS.filter((p) => selectedPathways.includes(p.code))
    .map((p) => p.fullLabel);

  const handleBackNavigation = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/');
  };

  return (
    <div
      className="flex min-h-[100dvh] min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-300 via-slate-200 to-slate-400 px-2 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-4 md:px-6 md:py-6"
    >
      <div className="relative flex h-[min(52rem,calc(100dvh-1rem))] w-full max-w-[min(calc(100vw-1rem),24rem)] flex-col overflow-hidden rounded-2xl border-[5px] border-slate-900 bg-gradient-to-b from-sky-50 via-[#e8f2ff] to-slate-50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] ring-1 ring-white/10 sm:rounded-[1.75rem] sm:border-[6px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55)] sm:ring-white/15 md:max-w-[24rem] md:rounded-[1.875rem]">
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

        <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-primary"
          >
            Skip to main content
          </a>

          <header className="sticky top-0 z-30 border-b border-sky-200/70 bg-white/80 text-foreground shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:pb-3 sm:pt-3">
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleBackNavigation}
                  aria-label="Go back"
                  className="touch-manipulation inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary/25 bg-white/90 text-primary shadow-sm transition active:scale-95 hover:border-primary/40 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <ArrowLeft className="h-5 w-5" strokeWidth={2.2} aria-hidden />
                </button>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground shadow-md ring-2 ring-primary/20 sm:h-11 sm:w-11"
                  aria-hidden
                >
                  A
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold leading-tight tracking-tight text-slate-900 sm:text-base">
                    Aegis Health AI
                  </p>
                  <p className="truncate text-[11px] font-medium leading-tight text-slate-500 sm:text-xs">
                    NHS-aligned Clinical Triage
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main
            id="main-content"
            className="relative mx-auto w-full min-w-0 max-w-5xl flex-1 px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-4 sm:py-8 lg:py-6"
          >
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <p className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-sky-200/80 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-primary shadow-sm backdrop-blur-md sm:text-xs">
            <Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            Pharmacy First &amp; GP pathways
          </p>
          <h1
            className={`mb-3 text-balance text-[clamp(1.35rem,4vw+0.5rem,2.35rem)] leading-[1.12] tracking-tight text-slate-900 sm:text-4xl sm:leading-[1.15] md:text-[2.35rem] ${fontDisplay.className}`}
          >
            Get the right care, right now
          </h1>
          <p className="text-pretty px-0.5 text-sm leading-relaxed text-slate-600 sm:px-0 sm:text-base">
            Answer a few questions and we&apos;ll guide you to the best next step — whether that&apos;s a pharmacist,
            your GP practice, or emergency services when it&apos;s urgent.
          </p>
        </div>

        <div className="relative mb-8 sm:mb-12">
          <StepperWave />
          <ol className="relative z-10 grid list-none grid-cols-3 gap-1.5 p-0 sm:gap-4" aria-label="How it works">
            {STEPS.map(({ step, title, Icon }) => (
              <li key={step} className="min-w-0">
                <div className="flex h-full flex-col items-center rounded-2xl border border-white/70 bg-white/45 px-1.5 py-3 text-center shadow-lg shadow-sky-900/5 backdrop-blur-md transition active:scale-[0.98] sm:px-3 sm:py-4 [@media(hover:hover)]:hover:bg-white/60 [@media(hover:hover)]:hover:shadow-xl">
                  <span
                    className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-inner sm:h-11 sm:w-11"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={1.75} />
                  </span>
                  <span className="mb-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-sm sm:h-7 sm:w-7 sm:text-xs">
                    {step}
                  </span>
                  <span className="px-0.5 text-[10px] font-semibold leading-tight text-slate-800 sm:text-xs">{title}</span>
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

          <div className="border-t border-sky-100/80 bg-white/95 p-3 sm:p-6">
            <fieldset className="m-0 mb-5 min-w-0 border-0 p-0" aria-describedby="pathway-hint">
              <legend className="mb-1 block px-0 text-xs font-bold text-slate-900 sm:text-sm">What are your main symptoms?</legend>
              <p id="pathway-hint" className="mb-3 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                Tap one or more pathways to select. Tap any selected pathway again to remove it before you begin.
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {PATIENT_PATHWAYS.map((p) => {
                  const PathwayIcon = PATHWAY_ICONS[p.code] ?? Stethoscope;
                  const isSelected = selectedPathways.includes(p.code);
                  return (
                    <button
                      key={p.code}
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={`${p.fullLabel}. ${p.description}${isSelected ? ' Selected. Press to clear selection.' : ''}`}
                      onClick={() =>
                        setSelectedPathways((current) =>
                          isSelected ? current.filter((code) => code !== p.code) : [...current, p.code],
                        )
                      }
                      className={`touch-manipulation flex aspect-square w-full min-h-0 flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center shadow-md transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-2.5 ${
                        isSelected
                          ? 'border-primary bg-primary/12 shadow-lg shadow-primary/15 ring-2 ring-primary/30 backdrop-blur-md'
                          : 'border-white/80 bg-white/50 backdrop-blur-md hover:border-sky-300/90 hover:bg-white/75 hover:shadow-lg'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors sm:h-9 sm:w-9 ${
                          isSelected ? 'bg-primary/25 text-primary' : 'bg-primary/10 text-primary'
                        }`}
                        aria-hidden
                      >
                        <PathwayIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
                      </span>
                      <span className="text-center text-[10px] font-semibold leading-tight text-slate-900 sm:text-[11px]">{p.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 min-h-[2rem]" aria-live="polite" aria-atomic="true">
                {selectedPathwayLabels.length > 0 ? (
                  <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary sm:text-sm">
                    <span className="text-slate-600">Selected:</span> {selectedPathwayLabels.join(', ')}
                  </p>
                ) : null}
              </div>
            </fieldset>

            {selectedPathways.length > 0 ? (
              <div className="mb-5 rounded-2xl border border-amber-200/90 bg-amber-50/95 p-3 shadow-sm backdrop-blur-sm sm:p-4">
                <div className="mb-2 flex items-start gap-2">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 sm:h-8 sm:w-8"
                    aria-hidden
                  >
                    <TriangleAlert className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <h3 className="text-sm font-bold text-amber-900">Important — Please Read</h3>
                </div>
                <ul className="mb-3 list-disc space-y-0.5 pl-4 text-xs text-amber-900/95 sm:text-sm">
                  <li>Guidance only — not a substitute for professional advice.</li>
                  <li>
                    Life-threatening emergency? Call <strong>999</strong> immediately.
                  </li>
                  <li>Your data is processed under UK GDPR.</li>
                </ul>
                <label className="flex min-h-[48px] cursor-pointer items-start gap-3 rounded-xl py-1">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-input accent-primary touch-manipulation"
                  />
                  <span className="text-xs font-medium leading-relaxed text-amber-950 sm:text-sm">
                    {CONSENT_CHECKBOX_LABEL}
                  </span>
                </label>
                <p className="mt-2 text-[11px] text-amber-900/90">
                  By continuing, you agree to our{' '}
                  <Link href="/privacy" className="font-semibold underline underline-offset-2">
                    {PRIVACY_LINK_LABEL}
                  </Link>{' '}
                  and{' '}
                  <Link href="/terms" className="font-semibold underline underline-offset-2">
                    {TERMS_LINK_LABEL}
                  </Link>
                  . Consent text version: {CONSENT_COPY_VERSION}.
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleStart}
              disabled={!consentGiven || selectedPathways.length === 0}
              aria-disabled={!consentGiven || selectedPathways.length === 0}
              className={`touch-manipulation flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-base font-bold transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:min-h-0 sm:py-4 sm:text-base ${
                consentGiven && selectedPathways.length > 0
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-offset-white hover:bg-primary/90 focus-visible:ring-primary'
                  : 'cursor-not-allowed bg-slate-700 text-slate-200 shadow-inner focus-visible:ring-slate-500'
              }`}
            >
              {selectedPathways.length > 0 ? (
                <>
                  Begin consultation ({selectedPathways.length} condition{selectedPathways.length > 1 ? 's' : ''})
                  <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                </>
              ) : (
                'Select a condition to begin'
              )}
            </button>
            {selectedPathways.length === 0 || !consentGiven ? (
              <p className="mt-2 text-center text-xs text-slate-500 sm:text-sm">
                {selectedPathways.length === 0
                  ? 'Choose one or more pathways above.'
                  : 'Please confirm you have read the information and consent to continue.'}
              </p>
            ) : null}
          </div>
        </div>

        <section
          className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200/90 bg-rose-50/95 p-3 shadow-sm backdrop-blur-sm sm:mt-8 sm:p-5"
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

        <footer className="mt-8 border-t border-slate-200/80 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 sm:mt-12 sm:pb-12 sm:pt-8">
          <nav
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-2.5"
            aria-label="Footer links"
          >
            {FOOTER_LINKS.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="touch-manipulation inline-flex min-h-[44px] items-center justify-center gap-1 rounded-xl bg-white/60 px-2 py-2 text-center text-xs font-medium text-slate-600 underline-offset-4 ring-1 ring-slate-200/80 transition-colors active:bg-slate-100 sm:min-h-0 sm:bg-transparent sm:px-1 sm:py-0 sm:text-sm sm:ring-0 [@media(hover:hover)]:hover:text-primary [@media(hover:hover)]:hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-md"
                >
                  {item.label}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="touch-manipulation inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white/60 px-2 py-2 text-center text-xs font-medium text-slate-600 underline-offset-4 ring-1 ring-slate-200/80 transition-colors active:bg-slate-100 sm:min-h-0 sm:bg-transparent sm:px-1 sm:py-0 sm:text-sm sm:ring-0 [@media(hover:hover)]:hover:text-primary [@media(hover:hover)]:hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-md"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </footer>
      </main>
        </div>
      </div>
    </div>
  );
}
