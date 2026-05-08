import Link from 'next/link';
import { useRouter } from 'next/router';
import { type ReactNode } from 'react';
import { ArrowLeft, Phone, Stethoscope, User } from 'lucide-react';
import { TriageOutcomeIcon } from '../../lib/triageOutcomeIcons';
import type { TriageResultView } from '../../types/consultation';
import { useSummaryFetch } from '../../hooks/useSummaryFetch';
import { CDS_DISCLAIMER } from '../../lib/complianceContent';
import SafetyPanel from '../../components/SafetyPanel';
import InlineNotice from '../../components/InlineNotice';
import StatusBadge from '../../components/StatusBadge';

function PatientsMobileShell({ children }: { children: ReactNode }) {
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
          {children}
        </div>
      </div>
    </div>
  );
}

function PatientsResultFallbackHeader() {
  return (
    <header className="border-b border-slate-200 bg-white text-foreground">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-3 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:pb-3 sm:pt-3">
        <Link
          href="/patients"
          aria-label="Back to triage"
          className="touch-manipulation inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition active:scale-95 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.2} aria-hidden />
        </Link>
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
          <p className="truncate text-[11px] font-medium leading-tight text-slate-500 sm:text-xs">Your results</p>
        </div>
      </div>
    </header>
  );
}

function ResultShellHeader() {
  return (
    <header className="border-b border-slate-200 bg-white text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-2 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:pb-3 sm:pt-3">
        <div className="flex min-w-0 w-full items-center gap-1.5 sm:gap-3">
          <Link
            href="/patients"
            aria-label="Back to triage"
            className="touch-manipulation inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition active:scale-95 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:h-11 sm:w-11"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.2} aria-hidden />
          </Link>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground sm:h-11 sm:w-11"
            aria-hidden
          >
            C
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold leading-tight tracking-tight text-slate-900 sm:text-base">
              Care Path
            </p>
            <p className="hidden truncate text-[11px] font-medium leading-tight text-slate-500 sm:block sm:text-xs">
              Consultation complete
            </p>
          </div>
        </div>
        <div className="flex w-full shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          <Link
            href="/patients"
            className="touch-manipulation inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition active:scale-95 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-4 sm:py-2 sm:text-sm"
          >
            <Stethoscope className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
            <span>Triage</span>
          </Link>
          <Link
            href="/patients/profile"
            className="touch-manipulation inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition active:scale-95 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-4 sm:py-2 sm:text-sm"
          >
            <User className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

const OUTCOME_CONFIG: Record<string, {
  panel: string;
  border: string;
  text: string;
  badge: string;
  title: string;
  instructions: string;
}> = {
  self_care: {
    panel: 'bg-green-700',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
    title: 'Self-Care at Home',
    instructions: 'Based on your symptoms, you can manage this at home. Follow the advice below.',
  },
  pharmacy: {
    panel: 'bg-primary',
    border: 'border-primary/30',
    text: 'text-primary',
    badge: 'bg-primary/10 text-primary',
    title: 'Visit Your Pharmacy',
    instructions: 'Visit a pharmacy today — they can assess and treat you without a GP appointment.',
  },
  gp: {
    panel: 'bg-amber-600',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700',
    title: 'See Your GP',
    instructions: 'Your symptoms need GP assessment. Contact your GP surgery or use the NHS App.',
  },
  urgent_care: {
    panel: 'bg-orange-600',
    border: 'border-orange-200',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
    title: 'Seek Urgent Care Today',
    instructions: 'Same-day medical attention needed. Visit an Urgent Treatment Centre or call NHS 111.',
  },
  emergency_999: {
    panel: 'bg-red-700',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    title: 'Call 999 — Emergency',
    instructions: 'Your symptoms may be life-threatening. Call 999 immediately. Do not drive yourself.',
  },
};

const EXPLANATION_SOURCE_LABEL: Record<string, string> = {
  rule_engine: 'Rule engine',
  red_flag_engine: 'Safety engine',
  pharmacist_override: 'Pharmacist override',
};

function severityBadgeForOutcome(outcome: string): { label: string; tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral' } {
  if (outcome === 'self_care') return { label: 'Self-Care Pathway', tone: 'success' };
  if (outcome === 'pharmacy') return { label: 'Pharmacy Pathway', tone: 'info' };
  if (outcome === 'gp') return { label: 'GP Pathway', tone: 'warning' };
  if (outcome === 'urgent_care') return { label: 'Urgent Care Pathway', tone: 'danger' };
  if (outcome === 'emergency_999') return { label: 'Emergency Pathway', tone: 'danger' };
  return { label: 'Clinical Review', tone: 'neutral' };
}

const MOCK_RESULT: TriageResultView = {
  consultationId: 'c0000001-0000-0000-0000-000000000001',
  patient: { fullName: 'Sarah Mitchell', age: 33, gender: 'Female' },
  pathway: 'uti',
  pathwayLabel: 'Uncomplicated UTI',
  outcome: 'pharmacy',
  outcomeLabel: 'Pharmacy Referral',
  outcomeReason: 'Symptoms consistent with uncomplicated UTI. Patient meets all pharmacy eligibility criteria. No red flags identified.',
  explanation: {
    decision: 'pharmacy',
    reason: 'Symptoms consistent with uncomplicated UTI. Patient meets all pharmacy eligibility criteria. No red flags identified.',
    source: 'rule_engine',
  },
  decision: {
    code: 'pharmacy',
    label: 'Pharmacy Referral',
    urgency: 'same_day',
    title: 'Pharmacy consultation recommended',
  },
  reasoning: {
    steps: [
      'No emergency warning signs were detected from your answers.',
      'Your symptom profile is suitable for pharmacy-first assessment.',
      'A pharmacist can assess and advise on treatment today.',
    ],
    clinicalBasis: ['Mock demo reasoning for frontend flow.'],
    engine: { source: 'rule_engine', ruleIdsMatched: ['MOCK_PHARMACY_RULE'], governanceUncertainty: [] },
  },
  referralRecommendation: {
    service: 'pharmacy',
    instruction: 'You should go to a pharmacy.',
    actions: [
      'Visit your nearest pharmacy today.',
      'Speak with the pharmacist and explain your symptoms.',
      'Show your consultation summary if needed.',
    ],
    escalationSafetyNet: [
      'If symptoms worsen, contact your GP or NHS 111.',
      'If severe symptoms develop suddenly, call 999 immediately.',
    ],
  },
  nearbyOptions: [
    {
      type: 'pharmacy',
      name: 'High Street Pharmacy',
      distanceKm: 0.7,
      address: '12 High Street',
      phone: '0207 123 4561',
      openNow: true,
    },
    {
      type: 'gp',
      name: 'Central GP Practice',
      distanceKm: 1.1,
      address: '9 Market Lane',
      phone: '0207 123 4570',
      openNow: true,
    },
  ],
  redFlagTriggered: false,
  redFlags: [],
  pharmacyEligible: true,
  summaryText: 'Patient Sarah Mitchell (Female, 33) presents with a 3-day history of painful urination, increased urinary frequency, and lower abdominal discomfort. No fever, no loin/back pain, not pregnant. OUTCOME: Pharmacy referral under Pharmacy First.',
  pathwayPatientDisclaimer:
    "This tool suggests an appropriate level of care for uncomplicated urinary symptoms; it is not a diagnosis and does not replace dipstick testing, examination, or a clinician's prescribing decision.",
  safetyNetAdvice: 'Return if symptoms worsen, fever develops, or no improvement within 48 hours of treatment.',
  pharmacyTreatmentOptions: [
    'Trimethoprim 200mg twice daily for 7 days',
    'Nitrofurantoin MR 100mg twice daily for 5 days',
  ],
  patientExplanation:
    'Based on your answers, a pharmacist is a good next step. They can assess you and supply some treatments without a GP appointment when appropriate. Symptoms are consistent with an uncomplicated urine infection and you meet the usual Pharmacy First checks. If you become more unwell than you expected, seek help sooner — use NHS 111 or emergency services as appropriate.',
  regulatoryContext: {
    intendedPurpose:
      'Clinical decision support for NHS-aligned triage (demo). Not a diagnosis; not prescribing; pharmacist/GP accountable.',
    mhraSamDConsiderations: {
      postureSummary:
        'Demo posture: CDS / care navigation. Formal SaMD classification is an organisational deliverable.',
    },
    pharmacyFirstAndPgd: {
      pgdSupply: {
        systemRole: 'This software does not complete PGD assessments or supply medicines.',
        performedBy: 'A licensed pharmacist under applicable PGD only.',
      },
    },
  },
};

export default function ResultPage() {
  const router = useRouter();
  const { id, ids, demo } = router.query;
  const { result, multiResults, loading, fetchError } = useSummaryFetch({
    isReady: router.isReady,
    idParam: id,
    idsParam: ids,
    demoParam: demo,
    mockResult: MOCK_RESULT,
  });


  if (loading) {
    return (
      <PatientsMobileShell>
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
          <div
            className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent motion-safe:animate-spin"
            aria-hidden
          />
          <p className="mt-4 text-sm font-semibold text-slate-900">Loading your results</p>
          <p className="mt-1 text-center text-xs text-slate-600">Fetching consultation summary data.</p>
        </main>
      </PatientsMobileShell>
    );
  }

  if (fetchError && !result) {
    return (
      <PatientsMobileShell>
        <PatientsResultFallbackHeader />
        <main
          id="main-content"
          className="relative mx-auto w-full min-w-0 max-w-5xl flex-1 px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-4 sm:py-8"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center sm:p-6">
            <p className="text-sm font-semibold text-red-700" role="alert">
              Unable to load results
            </p>
            <p className="mt-2 text-sm text-slate-600">{fetchError}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/patients"
                className="touch-manipulation inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                Back to triage
              </Link>
              <Link
                href="/patients/result?demo=true"
                className="touch-manipulation inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border-2 border-primary/25 bg-white px-4 py-3 text-sm font-semibold text-primary transition hover:bg-sky-50"
              >
                View demo result
              </Link>
            </div>
          </div>
        </main>
      </PatientsMobileShell>
    );
  }

  if (!result) return null;

  const config = OUTCOME_CONFIG[result.outcome] || OUTCOME_CONFIG.gp;
  const reasoningText = result.explanation?.reason || result.outcomeReason;
  const reasoningSteps =
    result.reasoning?.steps && result.reasoning.steps.length > 0
      ? result.reasoning.steps
      : [reasoningText];
  const referralRecommendation = result.referralRecommendation;
  const decisionTitle = result.decision?.title || config.title;
  const decisionUrgency = result.decision?.urgency;
  const severityBadge = severityBadgeForOutcome(result.outcome);
  const conciseReasoning =
    reasoningSteps.length > 0 ? reasoningSteps.join(' + ') : result.outcomeReason || 'Clinical assessment applied.';
  const actionText = referralRecommendation?.instruction || config.instructions;

  return (
    <PatientsMobileShell>
      <ResultShellHeader />

      <main
        id="main-content"
        className="relative mx-auto w-full min-w-0 max-w-5xl flex-1 space-y-4 px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-4 sm:py-5"
      >
        {multiResults.length > 1 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Multiple conditions reviewed</p>
            <div className="space-y-2">
              {multiResults.map((item) => {
                const outcomeMeta = OUTCOME_CONFIG[item.outcome] || OUTCOME_CONFIG.gp;
                return (
                  <div key={item.consultationId} className="rounded-xl border border-sky-100/80 bg-sky-50/40 px-3 py-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.pathwayLabel || item.pathway || 'Condition'}
                    </p>
                    <p className={`text-xs font-medium ${outcomeMeta.text}`}>{item.outcomeLabel}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {fetchError ? (
          <div className="rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-xs text-amber-900 shadow-sm backdrop-blur-sm" role="status">
            {fetchError}
          </div>
        ) : null}

        {(result.outcome === 'urgent_care' || result.outcome === 'emergency_999') && (
          <InlineNotice title={result.outcome === 'emergency_999' ? 'Emergency Action Required' : 'Urgent Action Required'} tone="danger">
            {result.outcome === 'emergency_999'
              ? 'Call 999 now. Do not delay care if symptoms are severe or rapidly worsening.'
              : 'Arrange same-day urgent assessment. Call NHS 111 if you need help finding the right urgent service.'}
          </InlineNotice>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Outcome</p>
          <div className="mt-3 flex items-center gap-3">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${config.panel} text-white`}>
              <TriageOutcomeIcon outcome={result.outcome} className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-lg font-bold text-slate-900">{decisionTitle}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusBadge label={severityBadge.label} tone={severityBadge.tone} className="text-[10px] font-semibold uppercase tracking-wide" />
                {decisionUrgency ? (
                  <StatusBadge
                    label={`Urgency: ${decisionUrgency.replaceAll('_', ' ')}`}
                    tone={result.outcome === 'urgent_care' || result.outcome === 'emergency_999' ? 'danger' : 'info'}
                    className="text-[10px] font-semibold uppercase tracking-wide"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Reasoning</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">
            Based on your symptoms: {conciseReasoning}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Action</p>
          {result.outcome === 'pharmacy' ? (
            <div className="mt-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">Pharmacy</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-800">{actionText}</p>
            </div>
          ) : null}
          {result.outcome === 'gp' ? (
            <div className="mt-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">GP appointment</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-800">{actionText}</p>
            </div>
          ) : null}
          {(result.outcome === 'urgent_care' || result.outcome === 'emergency_999') ? (
            <div className="mt-2 space-y-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-red-700">Emergency options only</p>
              <p className="text-sm leading-relaxed text-slate-800">
                {result.outcome === 'emergency_999'
                  ? 'Call 999 immediately. Do not delay for online or routine care.'
                  : 'Use urgent care now. If symptoms worsen, call 999 immediately.'}
              </p>
              <a
                href="tel:999"
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white"
              >
                <Phone className="h-4 w-4" aria-hidden />
                Call 999 now
              </a>
            </div>
          ) : null}
          {result.outcome === 'self_care' ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-800">{actionText}</p>
          ) : null}
        </section>

        {result.redFlagTriggered && (
          <SafetyPanel title="Safety alert triggered" level="danger">
            {result.redFlags?.map((flag) => (
              <p key={flag.code} className="text-red-700 text-xs leading-relaxed">{flag.message}</p>
            ))}
          </SafetyPanel>
        )}

        {result.governanceUncertainty && result.governanceUncertainty.length > 0 && (
          <InlineNotice title="Governance note" tone="warning">
            Conservative escalation was applied because the automated pathway could not confirm every check (
            {result.governanceUncertainty.join(', ')}).
          </InlineNotice>
        )}

        <button
          type="button"
          onClick={() => router.push('/patients/profile')}
          className="touch-manipulation flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary/25 bg-white/90 py-4 text-sm font-bold text-primary shadow-sm transition-all hover:bg-sky-50 active:scale-[0.98]"
        >
          <User className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          My profile
        </button>

        <button
          type="button"
          onClick={() => router.push('/patients')}
          className="touch-manipulation flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-slate-100/90 py-4 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200/90 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          Start a new consultation
        </button>

        <p className="pb-4 text-center text-xs text-slate-500">{CDS_DISCLAIMER}</p>
      </main>
    </PatientsMobileShell>
  );
}