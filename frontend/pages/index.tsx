import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Bandage,
  Bug,
  ClipboardList,
  CloudFog,
  Droplets,
  Ear,
  MicVocal,
  Siren,
  Stethoscope,
  TriangleAlert,
  Zap,
} from 'lucide-react';

type Pathway = {
  code: string;
  label: string;
  fullLabel: string;
  description: string;
};

const PATHWAYS: Pathway[] = [
  { code: 'uti',          label: 'UTI',           fullLabel: 'Urinary Tract Infection', description: 'Painful or frequent urination' },
  { code: 'sore_throat',  label: 'Sore Throat',   fullLabel: 'Sore Throat',             description: 'Throat pain, difficulty swallowing' },
  { code: 'sinusitis',    label: 'Sinusitis',     fullLabel: 'Sinusitis',               description: 'Blocked nose, facial pressure' },
  { code: 'otitis_media', label: 'Ear Infection', fullLabel: 'Ear Infection',           description: 'Ear pain, discharge' },
  { code: 'insect_bites', label: 'Insect Bite',   fullLabel: 'Infected Insect Bite',    description: 'Redness, swelling at bite site' },
  { code: 'impetigo',     label: 'Impetigo',      fullLabel: 'Impetigo',                description: 'Crusty, golden sores on skin' },
  { code: 'shingles',     label: 'Shingles',      fullLabel: 'Shingles',                description: 'Painful rash on one side' },
];

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

  const selected = PATHWAYS.find((p) => p.code === selectedPathway);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-muted flex flex-col">

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-card-md focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <header className="bg-brand-header text-primary-foreground shadow-card-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-card rounded-xl flex items-center justify-center shadow-card flex-shrink-0" aria-hidden>
              <span className="text-primary font-black text-sm">A</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base leading-tight truncate">Aegis Health AI</p>
              <p className="text-brand-header-subtle text-xs leading-tight hidden sm:block">NHS-aligned Clinical Triage</p>
            </div>
          </div>
          <Link
            href="/crm"
            className="text-xs shrink-0 bg-primary-foreground/15 hover:bg-primary-foreground/25 px-3 py-1.5 rounded-lg transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-header"
          >
            Staff CRM →
          </Link>
        </div>
      </header>

      <main id="main-content" className="max-w-3xl mx-auto w-full px-4 py-6 sm:py-10 flex-1">

        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2 leading-tight tracking-tight">
            Get the right care, right now
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Answer a few questions and we&apos;ll guide you to the best care —
            pharmacy, GP, or emergency services.
          </p>
        </div>

        <ol className="grid grid-cols-3 gap-2 sm:gap-3 mb-8 list-none p-0 m-0" aria-label="How it works">
          {STEPS.map(({ step, title, Icon }) => (
            <li key={step}>
              <div className="bg-card rounded-xl p-3 sm:p-4 shadow-card border border-border text-center h-full flex flex-col items-center">
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="w-5 h-5 bg-primary/15 text-primary rounded-full flex items-center justify-center font-bold text-xs mb-1.5">
                  {step}
                </span>
                <span className="font-medium text-card-foreground text-xs sm:text-sm leading-tight">{title}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className="bg-card rounded-2xl shadow-card-md border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-brand-header px-5 py-4">
            <h2 className="text-primary-foreground font-bold text-lg">Start a Consultation</h2>
            <p className="text-brand-header-subtle text-xs mt-0.5">Free, confidential, NHS-aligned guidance</p>
          </div>

          <div className="p-4 sm:p-6">
            <fieldset className="mb-5 border-0 p-0 m-0 min-w-0">
              <legend className="block text-sm font-semibold text-foreground mb-3 px-0">
                What are your main symptoms?
              </legend>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3"
                role="group"
                aria-label="Condition or symptom type"
              >
                {PATHWAYS.map((p) => {
                  const PathwayIcon = PATHWAY_ICONS[p.code];
                  const isSelected = selectedPathway === p.code;
                  return (
                  <button
                    key={p.code}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`${p.fullLabel}. ${p.description}`}
                    onClick={() => setSelectedPathway(p.code)}
                    className={`flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-card'
                        : 'border-border hover:border-primary/40 hover:bg-muted/80'
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
                    <span className="text-xs font-semibold text-card-foreground leading-tight">{p.label}</span>
                    <span className="text-xs text-muted-foreground mt-0.5 leading-tight hidden sm:block">{p.description}</span>
                  </button>
                  );
                })}
              </div>
              <div className="mt-3 min-h-[2.25rem]" aria-live="polite" aria-atomic="true">
                {selected ? (
                  <p className="px-3 py-2 bg-primary/10 rounded-lg text-xs text-primary font-medium">
                    Selected: {selected.fullLabel}
                  </p>
                ) : null}
              </div>
            </fieldset>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
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
              className={`w-full py-4 px-6 rounded-xl font-bold text-base transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                consentGiven && selectedPathway
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-card-md shadow-primary/25'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed'
              }`}
            >
              {selectedPathway
                ? `Begin ${selected?.label} Consultation →`
                : 'Select a condition to begin'}
            </button>
          </div>
        </div>

        <section
          className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
          aria-labelledby="emergency-heading"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600" aria-hidden>
            <Siren className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <h3 id="emergency-heading" className="text-red-700 font-bold text-sm">
              Life-threatening emergency?
            </h3>
            <p className="text-red-600 text-xs mt-0.5 leading-relaxed">
              Do not use this tool. Call <strong>999</strong> immediately or go to your nearest A&E.
            </p>
          </div>
        </section>

        <nav className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 pb-8" aria-label="Footer">
          {FOOTER_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              {...(item.external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded"
            >
              {item.label}
              {item.external ? <span className="sr-only"> (opens in new tab)</span> : null}
            </a>
          ))}
        </nav>
      </main>
    </div>
  );
}
