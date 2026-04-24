import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BadgeCheck,
  Bandage,
  Bug,
  ClipboardList,
  CloudFog,
  Droplets,
  Ear,
  ExternalLink,
  MicVocal,
  Shield,
  Siren,
  Sparkles,
  Stethoscope,
  TriangleAlert,
  Zap,
} from 'lucide-react';
import { PATIENT_PATHWAYS } from '../lib/patientPathways';

const PATHWAY_ICONS: Record<string, LucideIcon> = {
  uti: Droplets,
  sore_throat: MicVocal,
  sinusitis: CloudFog,
  otitis_media: Ear,
  insect_bites: Bug,
  impetigo: Bandage,
  shingles: Zap,
};

const STEPS: Array<{ step: string; title: string; Icon: LucideIcon }> = [
  { step: '1', title: 'Choose symptom', Icon: Stethoscope },
  { step: '2', title: 'Answer questions', Icon: ClipboardList },
  { step: '3', title: 'Get advice', Icon: BadgeCheck },
];

const FOOTER_LINKS: Array<{ label: string; href: string; external?: boolean }> = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Accessibility', href: '/accessibility' },
  { label: 'NHS 111 Online', href: 'https://111.nhs.uk/', external: true },
];

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
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-b from-primary/[0.08] via-background to-muted/80">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 max-h-[45vh] bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(var(--primary)/0.18),transparent)]"
        aria-hidden
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-card-md focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 border-b border-primary-foreground/10 bg-brand-header/95 text-primary-foreground shadow-card-md backdrop-blur-md supports-[backdrop-filter]:bg-brand-header/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2.5 px-3.5 py-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card shadow-card" aria-hidden>
              <span className="text-sm font-black text-primary">A</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold leading-tight">Aegis Health AI</p>
              <p className="hidden text-xs leading-tight text-brand-header-subtle sm:block">NHS-aligned Clinical Triage</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href="/crm"
              className="inline-flex items-center gap-1 rounded-lg bg-primary-foreground/15 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-primary-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-header"
            >
              Staff CRM
              <ArrowRight className="h-3.5 w-3.5 opacity-90" strokeWidth={2} aria-hidden />
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-header"
            >
              <Shield className="h-3.5 w-3.5 opacity-90" strokeWidth={2} aria-hidden />
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="relative mx-auto w-full max-w-4xl flex-1 px-3.5 py-6 sm:px-4 sm:py-9">
        <div className="mx-auto mb-7 max-w-2xl text-center sm:mb-9">
          <p className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Pharmacy First &amp; GP pathways
          </p>
          <h1 className="mb-2 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl sm:leading-tight">
            Get the right care, right now
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Answer a few questions and we&apos;ll guide you to the best next step — whether that&apos;s a pharmacist,
            your GP practice, or emergency services when it&apos;s urgent.
          </p>
        </div>

        <ol className="mb-6 grid list-none grid-cols-3 gap-1.5 p-0 sm:mb-8 sm:gap-2" aria-label="How it works">
          {STEPS.map(({ step, title, Icon }) => (
            <li key={step} className="min-w-0">
              <div className="flex h-full flex-col items-center rounded-xl border border-border bg-card px-2 py-2 text-center shadow-card transition-shadow hover:shadow-card-md sm:px-2.5 sm:py-2.5">
                <span className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-9 sm:w-9" aria-hidden>
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary sm:text-xs">
                  {step}
                </span>
                <span className="text-[10px] font-medium leading-tight text-card-foreground sm:text-xs">{title}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card-md sm:rounded-2xl">
          <div className="relative bg-gradient-to-r from-primary via-primary to-brand-header px-3.5 py-3 sm:px-4 sm:py-3">
            <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_0%,hsl(0_0%_100%/0.06)_45%,transparent_70%)]" aria-hidden />
            <div className="relative flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-primary-foreground sm:text-lg">Start a consultation</h2>
                <p className="mt-0.5 max-w-md text-[11px] leading-snug text-brand-header-subtle sm:text-xs">
                  Free, confidential, NHS-aligned guidance — not a replacement for speaking to a clinician when you need one.
                </p>
              </div>
              <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary-foreground/90 sm:mt-0">
                <Shield className="h-3 w-3 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                UK GDPR
              </p>
            </div>
          </div>

          <div className="p-2.5 sm:p-4">
            <fieldset className="m-0 mb-4 min-w-0 border-0 p-0" aria-describedby="pathway-hint">
              <legend className="mb-0 block px-0 text-xs font-semibold text-foreground sm:text-[13px]">
                What are your main symptoms?
              </legend>
              <p id="pathway-hint" className="mb-2 text-[11px] text-muted-foreground sm:text-xs">
                Tap a pathway to select it. Tap the same one again to clear, or choose another before you begin.
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 lg:grid-cols-4">
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
                    className={`flex min-h-[6.25rem] flex-col items-center rounded-xl border-2 p-2 text-center transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[6.75rem] sm:p-2.5 ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-card ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/35 hover:bg-muted/70 hover:shadow-card'
                    }`}
                  >
                    {PathwayIcon ? (
                      <span
                        className={`mb-1.5 flex h-9 w-9 items-center justify-center rounded-lg transition-colors sm:h-10 sm:w-10 ${
                          isSelected ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                        }`}
                        aria-hidden
                      >
                        <PathwayIcon className="h-5 w-5" strokeWidth={1.65} />
                      </span>
                    ) : null}
                    <span className="text-[11px] font-semibold leading-tight text-card-foreground sm:text-xs">{p.label}</span>
                    <span className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-muted-foreground sm:text-[10px]">
                      {p.description}
                    </span>
                  </button>
                  );
                })}
              </div>
              <div className="mt-2 min-h-[2rem]" aria-live="polite" aria-atomic="true">
                {selected ? (
                  <p className="rounded-lg border border-primary/15 bg-primary/5 px-2 py-1.5 text-[11px] font-medium text-primary sm:text-xs">
                    <span className="text-muted-foreground">Selected:</span> {selected.fullLabel}
                  </p>
                ) : null}
              </div>
            </fieldset>

            {selectedPathway ? (
              <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/90 p-2.5 sm:p-3">
                <div className="mb-1 flex items-start gap-1.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700" aria-hidden>
                    <TriangleAlert className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                  <h3 className="text-xs font-semibold text-amber-800 sm:text-[13px]">Important — Please Read</h3>
                </div>
                <ul className="mb-1.5 list-disc space-y-0.5 pl-3 text-[11px] text-amber-700 sm:text-xs">
                  <li>Guidance only — not a substitute for professional advice.</li>
                  <li>Life-threatening emergency? Call <strong>999</strong> immediately.</li>
                  <li>Your data is processed under UK GDPR.</li>
                </ul>
                <label className="flex cursor-pointer items-start gap-1.5">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-input accent-primary"
                  />
                  <span className="text-[11px] font-medium leading-relaxed text-amber-800 sm:text-xs">
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
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 px-3.5 text-sm font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:py-3 sm:text-base ${
                consentGiven && selectedPathway
                  ? 'bg-primary text-primary-foreground shadow-card-md shadow-primary/20 hover:bg-primary/90'
                  : 'cursor-not-allowed bg-muted text-muted-foreground'
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
              <p className="mt-1.5 text-center text-[11px] text-muted-foreground sm:text-xs">
                {!selectedPathway
                  ? 'Choose a pathway above.'
                  : 'Please confirm you have read the information and consent to continue.'}
              </p>
            ) : null}
          </div>
        </div>

        <section
          className="mt-4 flex items-start gap-2 rounded-xl border border-red-200/90 bg-red-50/95 p-3 sm:mt-6 sm:p-4"
          aria-labelledby="emergency-heading"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600" aria-hidden>
            <Siren className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h3 id="emergency-heading" className="text-sm font-bold text-red-800">
              Life-threatening emergency?
            </h3>
            <p className="mt-0.5 text-xs leading-relaxed text-red-700 sm:text-sm">
              Do not use this tool. Call <strong className="font-extrabold">999</strong> immediately or go to your nearest Accident & Emergency.
            </p>
          </div>
        </section>

        <footer className="mt-7 border-t border-border/60 pb-8 pt-6 sm:mt-9 sm:pb-10">
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer links">
            {FOOTER_LINKS.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded"
                >
                  {item.label}
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded"
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
