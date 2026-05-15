import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  ExternalLink,
  ShieldCheck,
  Siren,
  Stethoscope,
  TriangleAlert,
  User,
} from 'lucide-react';
import { PATIENT_PATHWAYS } from '../../lib/patientPathways';
import {
  CONSENT_CHECKBOX_LABEL,
  CONSENT_COPY_VERSION,
  PRIVACY_LINK_LABEL,
  TERMS_LINK_LABEL,
} from '../../lib/complianceContent';

const STEPS: Array<{ step: string; title: string; Icon: LucideIcon }> = [
  { step: '1', title: 'Choose symptom', Icon: Stethoscope },
  { step: '2', title: 'Answer questions', Icon: ClipboardList },
  { step: '3', title: 'Get advice', Icon: ShieldCheck },
];

const FOOTER_LINKS: Array<{ label: string; href: string; external?: boolean }> = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Accessibility', href: '/patients/accessibility' },
  { label: 'NHS 111 Online', href: 'https://111.nhs.uk/', external: true },
];

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
    router.push(`/patients/consultation?pathways=${encoded}`);
  };

  const selectedPathwayLabels = PATIENT_PATHWAYS.filter((p) => selectedPathways.includes(p.code)).map(
    (p) => p.fullLabel,
  );

  const handleBackNavigation = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/');
  };

  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col items-center justify-center bg-white px-2 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-4 md:px-6 md:py-6">
      <div className="relative flex h-[min(52rem,calc(100dvh-1rem))] w-full max-w-[min(calc(100vw-1rem),24rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white sm:rounded-[1.75rem] md:max-w-[24rem] md:rounded-[1.875rem]">
        <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:ring-2 focus:ring-primary"
          >
            Skip to main content
          </a>

          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white text-foreground">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:pb-3 sm:pt-3">
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleBackNavigation}
                  aria-label="Go back"
                  className="touch-manipulation inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition active:scale-95 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <ArrowLeft className="h-5 w-5" strokeWidth={2.2} aria-hidden />
                </button>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground sm:h-11 sm:w-11"
                  aria-hidden
                >
                  C
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold leading-tight tracking-tight text-slate-900 sm:text-base">
                    Care Path
                  </p>
                  <p className="truncate text-[11px] font-medium leading-tight text-slate-500 sm:text-xs">
                    NHS clinical triage
                  </p>
                </div>
              </div>
              <Link
                href="/patients/profile"
                className="touch-manipulation inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition active:scale-95 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-4 sm:text-sm"
              >
                <User className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
                Profile
              </Link>
            </div>
          </header>

          <main
            id="main-content"
            className="relative mx-auto w-full min-w-0 max-w-5xl flex-1 px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-4 sm:py-8 lg:py-6"
          >
            <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
              <h1 className="mb-3 text-balance text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Check your symptoms
              </h1>
              <p className="text-pretty px-0.5 text-sm leading-relaxed text-slate-600 sm:px-0 sm:text-base">
                Answer a few questions to find the right care.
              </p>
            </div>

            <section className="mb-8 sm:mb-10" aria-label="How it works">
              <ol className="grid list-none grid-cols-3 gap-2 p-0 sm:gap-4">
                {STEPS.map(({ step, title, Icon }) => (
                  <li key={step} className="min-w-0">
                    <div className="flex h-full flex-col items-center rounded-xl border border-slate-200 bg-white px-1.5 py-3 text-center sm:px-3 sm:py-4">
                      <span
                        className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-11 sm:w-11"
                        aria-hidden
                      >
                        <Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={1.75} />
                      </span>
                      <span className="mb-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground sm:h-7 sm:w-7 sm:text-xs">
                        {step}
                      </span>
                      <span className="px-0.5 text-[10px] font-semibold leading-tight text-slate-800 sm:text-xs">
                        {title}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mb-6 sm:mb-8" aria-labelledby="common-checks-heading">
              <h2
                id="common-checks-heading"
                className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600 sm:text-sm"
              >
                Common checks
              </h2>
              <p id="pathway-hint" className="mb-3 text-xs leading-relaxed text-slate-500 sm:text-sm">
                Select one or more. Tap again to remove.
              </p>
              <ul className="m-0 list-none overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-sm">
                {PATIENT_PATHWAYS.map((p, index) => {
                  const isSelected = selectedPathways.includes(p.code);
                  return (
                    <li key={p.code} className={index > 0 ? 'border-t border-slate-200' : undefined}>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        aria-describedby="pathway-hint"
                        aria-label={`${p.fullLabel}. ${p.description}${isSelected ? ' Selected.' : ''}`}
                        onClick={() =>
                          setSelectedPathways((current) =>
                            isSelected ? current.filter((code) => code !== p.code) : [...current, p.code],
                          )
                        }
                        className={`touch-manipulation flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
                          isSelected ? 'bg-primary/5' : 'hover:bg-slate-50 active:bg-slate-100'
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-slate-300 bg-white'
                          }`}
                          aria-hidden
                        >
                          {isSelected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold leading-snug text-slate-900">{p.fullLabel}</span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">{p.description}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 min-h-[1.25rem]" aria-live="polite" aria-atomic="true">
                {selectedPathwayLabels.length > 0 ? (
                  <p className="text-xs text-slate-600 sm:text-sm">
                    <span className="font-medium text-slate-700">Selected:</span> {selectedPathwayLabels.join(', ')}
                  </p>
                ) : null}
              </div>
            </section>

            <div
              id="consultation-start"
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white sm:rounded-3xl"
            >
              <div className="border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Start a consultation</h2>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Free, confidential, NHS-aligned guidance. This does not replace speaking to a clinician when needed.
                </p>
              </div>

              <div className="p-3 sm:p-6">
                {selectedPathways.length > 0 ? (
                  <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 sm:p-4">
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
                      ? 'bg-primary text-primary-foreground ring-offset-white hover:bg-primary/90 focus-visible:ring-primary'
                      : 'cursor-not-allowed bg-slate-500 text-slate-100 focus-visible:ring-slate-500'
                  }`}
                >
                  {selectedPathways.length > 0 ? (
                    <>
                      Begin consultation ({selectedPathways.length} condition
                      {selectedPathways.length > 1 ? 's' : ''})
                      <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    </>
                  ) : (
                    'Select a condition to begin'
                  )}
                </button>
                {selectedPathways.length === 0 || !consentGiven ? (
                  <p className="mt-2 text-center text-xs text-slate-500 sm:text-sm">
                    {selectedPathways.length === 0
                      ? 'Select one or more common checks above.'
                      : 'Please confirm you have read the information and consent to continue.'}
                  </p>
                ) : null}
              </div>
            </div>

            <section
              className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-rose-50 p-3 sm:mt-8 sm:p-5"
              aria-labelledby="emergency-heading"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600"
                aria-hidden
              >
                <Siren className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <h3 id="emergency-heading" className="text-base font-bold text-red-700">
                  Life-threatening emergency?
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-red-800/95">
                  Do not use this tool. <strong className="font-extrabold">Call 999</strong> immediately or go to your
                  nearest Accident &amp; Emergency.
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
                      className="touch-manipulation inline-flex min-h-[44px] items-center justify-center gap-1 rounded-xl bg-white px-2 py-2 text-center text-xs font-medium text-slate-600 underline-offset-4 ring-1 ring-slate-200 transition-colors active:bg-slate-100 sm:min-h-0 sm:bg-transparent sm:px-1 sm:py-0 sm:text-sm sm:ring-0 [@media(hover:hover)]:hover:text-primary [@media(hover:hover)]:hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-md"
                    >
                      {item.label}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                      <span className="sr-only">(opens in new tab)</span>
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="touch-manipulation inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-2 py-2 text-center text-xs font-medium text-slate-600 underline-offset-4 ring-1 ring-slate-200 transition-colors active:bg-slate-100 sm:min-h-0 sm:bg-transparent sm:px-1 sm:py-0 sm:text-sm sm:ring-0 [@media(hover:hover)]:hover:text-primary [@media(hover:hover)]:hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-md"
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