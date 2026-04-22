import { useState } from 'react';
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
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Use', href: '#' },
  { label: 'Accessibility', href: '#' },
  { label: 'NHS 111 Online', href: 'https://111.nhs.uk/', external: true },
];

export default function LandingPage() {
  const router = useRouter();
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState('');

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
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card shadow-card" aria-hidden>
              <span className="text-sm font-black text-primary">A</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold leading-tight">Aegis Health AI</p>
              <p className="hidden text-xs leading-tight text-brand-header-subtle sm:block">NHS-aligned Clinical Triage</p>
            </div>
          </div>
          <Link
            href="/crm"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary-foreground/15 px-3 py-2 text-xs font-medium transition-colors hover:bg-primary-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-header"
          >
            Staff CRM
            <ArrowRight className="h-3.5 w-3.5 opacity-90" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </header>

      <main id="main-content" className="relative mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-5 sm:py-12">

        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Pharmacy First &amp; GP pathways
          </p>
          <h1 className="mb-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl sm:leading-tight">
            Get the right care, right now
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Answer a few questions and we&apos;ll guide you to the best next step — whether that&apos;s a pharmacist,
            your GP practice, or emergency services when it&apos;s urgent.
          </p>
        </div>

        <ol className="mb-10 grid list-none grid-cols-3 gap-2 p-0 sm:mb-12 sm:gap-4" aria-label="How it works">
          {STEPS.map(({ step, title, Icon }) => (
            <li key={step} className="min-w-0">
              <div className="flex h-full flex-col items-center rounded-2xl border border-border bg-card p-3 text-center shadow-card transition-shadow hover:shadow-card-md sm:p-4">
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-11 sm:w-11" aria-hidden>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
                </span>
                <span className="mb-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {step}
                </span>
                <span className="text-xs font-medium leading-snug text-card-foreground sm:text-sm">{title}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card-md sm:rounded-3xl">
          <div className="relative bg-gradient-to-r from-primary via-primary to-brand-header px-5 py-5 sm:px-6 sm:py-5">
            <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_0%,hsl(0_0%_100%/0.06)_45%,transparent_70%)]" aria-hidden />
            <div className="relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-primary-foreground sm:text-xl">Start a consultation</h2>
                <p className="mt-0.5 max-w-md text-xs text-brand-header-subtle sm:text-sm">
                  Free, confidential, NHS-aligned guidance — not a replacement for speaking to a clinician when you need one.
                </p>
              </div>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-foreground/90 sm:mt-0">
                <Shield className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                UK GDPR
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-7">
            <fieldset className="m-0 mb-6 min-w-0 border-0 p-0" aria-describedby="pathway-hint">
              <legend className="mb-1 block px-0 text-sm font-semibold text-foreground">
                What are your main symptoms?
              </legend>
              <p id="pathway-hint" className="mb-4 text-xs text-muted-foreground">
                Tap one pathway. You can change your choice before you begin.
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
                    aria-label={`${p.fullLabel}. ${p.description}`}
                    onClick={() => setSelectedPathway(p.code)}
                    className={`flex min-h-[7.5rem] flex-col items-center rounded-2xl border-2 p-3 text-center transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[8.25rem] ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-card ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/35 hover:bg-muted/70 hover:shadow-card'
                    }`}
                  >
                    {PathwayIcon ? (
                      <span
                        className={`mb-2 flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                          isSelected ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                        }`}
                        aria-hidden
                      >
                        <PathwayIcon className="h-6 w-6" strokeWidth={1.65} />
                      </span>
                    ) : null}
                    <span className="text-xs font-semibold leading-tight text-card-foreground">{p.label}</span>
                    <span className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground sm:text-xs">
                      {p.description}
                    </span>
                  </button>
                  );
                })}
              </div>
              <div className="mt-4 min-h-[2.75rem]" aria-live="polite" aria-atomic="true">
                {selected ? (
                  <p className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 text-xs font-medium text-primary">
                    <span className="text-muted-foreground">Selected:</span> {selected.fullLabel}
                  </p>
                ) : null}
              </div>
            </fieldset>

            <div className="mb-6 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 sm:p-5">
              <div className="flex items-start gap-2 mb-2">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700" aria-hidden>
                  <TriangleAlert className="h-4 w-4" strokeWidth={2} />
                </span>
                <h3 className="font-semibold text-amber-800 text-sm">Important — Please Read</h3>
              </div>
              <ul className="text-amber-700 text-xs space-y-1.5 list-disc pl-4 mb-3">
                <li>Guidance only — not a substitute for professional advice.</li>
                <li>Life-threatening emergency? Call <strong>999</strong> immediately.</li>
                <li>Your data is processed under UK GDPR.</li>
              </ul>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 w-5 h-5 shrink-0 accent-primary cursor-pointer rounded border-input"
                />
                <span className="text-amber-800 text-xs font-medium leading-relaxed">
                  I understand and consent to proceeding with this consultation.
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleStart}
              disabled={!consentGiven || !selectedPathway}
              aria-disabled={!consentGiven || !selectedPathway}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 px-6 text-base font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                consentGiven && selectedPathway
                  ? 'bg-primary text-primary-foreground shadow-card-md shadow-primary/20 hover:bg-primary/90'
                  : 'cursor-not-allowed bg-muted text-muted-foreground'
              }`}
            >
              {selectedPathway ? (
                <>
                  Begin {selected?.label} consultation
                  <ArrowRight className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                </>
              ) : (
                'Select a condition to begin'
              )}
            </button>
            {!consentGiven || !selectedPathway ? (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {!selectedPathway && !consentGiven
                  ? 'Choose a pathway and tick consent to continue.'
                  : !selectedPathway
                    ? 'Choose a pathway above.'
                    : 'Please confirm you have read the information and consent to continue.'}
              </p>
            ) : null}
          </div>
        </div>

        <section
          className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200/90 bg-red-50/95 p-4 sm:mt-8 sm:p-5"
          aria-labelledby="emergency-heading"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600" aria-hidden>
            <Siren className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h3 id="emergency-heading" className="text-sm font-bold text-red-800">
              Life-threatening emergency?
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-red-700 sm:text-sm">
              Do not use this tool. Call <strong className="font-extrabold">999</strong> immediately or go to your nearest A&amp;E.
            </p>
          </div>
        </section>

        <footer className="mt-10 border-t border-border/60 pb-10 pt-8 sm:mt-12 sm:pb-12">
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3" aria-label="Footer links">
            {FOOTER_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded"
              >
                {item.label}
                {item.external ? (
                  <>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                    <span className="sr-only">(opens in new tab)</span>
                  </>
                ) : null}
              </a>
            ))}
          </nav>
        </footer>
      </main>
    </div>
  );
}
