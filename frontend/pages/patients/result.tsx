import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, Mail, Phone, Pill, Printer, Stethoscope, User } from 'lucide-react';
import { TriageOutcomeIcon } from '../../lib/triageOutcomeIcons';
import type { TriageResultView } from '../../types/consultation';
import { useSummaryFetch } from '../../hooks/useSummaryFetch';
import { CDS_DISCLAIMER, TERMS_LINK_LABEL, PRIVACY_LINK_LABEL } from '../../lib/complianceContent';
import SafetyPanel from '../../components/SafetyPanel';
import InlineNotice from '../../components/InlineNotice';
import StatusBadge from '../../components/StatusBadge';
import { getNearbyOptionsForOutcome } from '../../lib/referralDirectory';
import { apiFetch, apiUrl } from '../../lib/api';

function PatientsMobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-300 via-slate-200 to-slate-400 px-2 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-4 md:px-6 md:py-6">
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
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg focus:ring-2 focus:ring-primary"
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
    <header className="sticky top-0 z-30 border-b border-sky-200/70 bg-white/80 text-foreground shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-3 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:pb-3 sm:pt-3">
        <Link
          href="/patients"
          aria-label="Back to triage"
          className="touch-manipulation inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary/25 bg-white/90 text-primary shadow-sm transition active:scale-95 hover:border-primary/40 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.2} aria-hidden />
        </Link>
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
          <p className="truncate text-[11px] font-medium leading-tight text-slate-500 sm:text-xs">Your results</p>
        </div>
      </div>
    </header>
  );
}

function ResultShellHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-sky-200/70 bg-white/80 text-foreground shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:pb-3 sm:pt-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Link
            href="/patients"
            aria-label="Back to triage"
            className="touch-manipulation inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary/25 bg-white/90 text-primary shadow-sm transition active:scale-95 hover:border-primary/40 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.2} aria-hidden />
          </Link>
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
            <p className="truncate text-[11px] font-medium leading-tight text-slate-500 sm:text-xs">Consultation complete</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/patients"
            className="touch-manipulation inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-primary/25 bg-white/90 px-3 py-2 text-xs font-semibold text-primary shadow-sm transition active:scale-95 hover:border-primary/40 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-4 sm:text-sm"
          >
            <Stethoscope className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
            Triage
          </Link>
          <Link
            href="/patients/profile"
            className="touch-manipulation inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-primary/25 bg-white/90 px-3 py-2 text-xs font-semibold text-primary shadow-sm transition active:scale-95 hover:border-primary/40 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-4 sm:text-sm"
          >
            <User className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
            Profile
          </Link>
        </div>
      </div>
    </header>
  );
}

const OUTCOME_CONFIG: Record<string, {
  gradient: string;
  border: string;
  text: string;
  badge: string;
  title: string;
  instructions: string;
}> = {
  self_care: {
    gradient: 'from-green-500 to-emerald-600',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
    title: 'Self-Care at Home',
    instructions: 'Based on your symptoms, you can manage this at home. Follow the advice below.',
  },
  pharmacy: {
    gradient: 'from-primary to-brand-header',
    border: 'border-primary/30',
    text: 'text-primary',
    badge: 'bg-primary/10 text-primary',
    title: 'Visit Your Pharmacy',
    instructions: 'Visit a pharmacy today — they can assess and treat you without a GP appointment.',
  },
  gp: {
    gradient: 'from-amber-500 to-yellow-600',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700',
    title: 'See Your GP',
    instructions: 'Your symptoms need GP assessment. Contact your GP surgery or use the NHS App.',
  },
  urgent_care: {
    gradient: 'from-orange-500 to-orange-600',
    border: 'border-orange-200',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
    title: 'Seek Urgent Care Today',
    instructions: 'Same-day medical attention needed. Visit an Urgent Treatment Centre or call NHS 111.',
  },
  emergency_999: {
    gradient: 'from-red-600 to-red-700',
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
  const { id, ids, demo, postcode } = router.query;
  const { result, multiResults, loading, fetchError } = useSummaryFetch({
    isReady: router.isReady,
    idParam: id,
    idsParam: ids,
    demoParam: demo,
    mockResult: MOCK_RESULT,
  });

  const queryPostcode =
    typeof postcode === 'string'
      ? postcode
      : Array.isArray(postcode) && postcode.length > 0
        ? postcode[0]
        : '';
  const [postcodeFilter, setPostcodeFilter] = useState(queryPostcode);
  const [noteInput, setNoteInput] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [pharmacistNotes, setPharmacistNotes] = useState(result?.pharmacistNotes || []);

  useEffect(() => {
    if (queryPostcode && queryPostcode !== postcodeFilter) {
      setPostcodeFilter(queryPostcode);
    }
  }, [queryPostcode, postcodeFilter]);

  useEffect(() => {
    setPharmacistNotes(result?.pharmacistNotes || []);
  }, [result]);

  const nearbyOptions = result?.nearbyOptions ?? [];
  const outcomeForNearbyFilter = result?.referralRecommendation?.service || result?.outcome || 'pharmacy';
  const filteredNearbyOptions = useMemo(() => {
    const entered = postcodeFilter.trim();
    if (!entered) return nearbyOptions;
    return getNearbyOptionsForOutcome(outcomeForNearbyFilter, entered, 5);
  }, [nearbyOptions, outcomeForNearbyFilter, postcodeFilter]);

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
          <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-5 text-center shadow-xl shadow-sky-900/10 backdrop-blur-sm sm:p-6">
            <p className="text-sm font-semibold text-red-700" role="alert">
              Unable to load results
            </p>
            <p className="mt-2 text-sm text-slate-600">{fetchError}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/patients"
                className="touch-manipulation inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
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
  const explanationSource = result.explanation?.source || '';
  const severityBadge = severityBadgeForOutcome(result.outcome);

  const downloadPdfSummary = () => {
    void (async () => {
      const url = apiUrl(`/api/summary/${encodeURIComponent(result.consultationId)}/pdf`);
      const response = await apiFetch(url);
      if (!response.ok) return;
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `consultation-summary-${result.consultationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    })();
  };

  const savePharmacistNote = () => {
    if (!noteInput.trim()) return;
    setNotesSaving(true);
    void (async () => {
      try {
        const response = await apiFetch(apiUrl(`/api/summary/${encodeURIComponent(result.consultationId)}/notes`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pharmacist_id: 'pharmacist_demo',
            note: noteInput.trim(),
          }),
        });
        if (!response.ok) return;
        const data = (await response.json()) as { notes?: typeof pharmacistNotes };
        setPharmacistNotes(data.notes || []);
        setNoteInput('');
      } finally {
        setNotesSaving(false);
      }
    })();
  };

  return (
    <PatientsMobileShell>
      <ResultShellHeader />

      <main
        id="main-content"
        className="relative mx-auto w-full min-w-0 max-w-5xl flex-1 space-y-4 px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-4 sm:py-5"
      >
        {multiResults.length > 1 && (
          <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-4 shadow-xl shadow-sky-900/10 backdrop-blur-sm">
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

        {/* Outcome hero card */}
        <div className="overflow-hidden rounded-2xl border border-sky-200/60 shadow-xl shadow-sky-900/10">
          <div className={`bg-gradient-to-br ${config.gradient} p-5 text-white`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25">
                <TriageOutcomeIcon outcome={result.outcome} className="h-8 w-8" strokeWidth={1.6} />
              </span>
              <div>
                <p className="text-sm font-medium text-white/80 uppercase tracking-wide">Your Result</p>
                <h2 className="text-xl font-extrabold leading-tight">{decisionTitle}</h2>
              </div>
            </div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge label={severityBadge.label} tone={severityBadge.tone} className="bg-white/90 text-[10px] font-semibold uppercase tracking-wide text-slate-900" />
              {decisionUrgency ? (
                <StatusBadge
                  label={`Urgency: ${decisionUrgency.replaceAll('_', ' ').replace('immediate', 'immediate ').trim()}`}
                  tone={result.outcome === 'urgent_care' || result.outcome === 'emergency_999' ? 'danger' : 'info'}
                  className="bg-white/90 text-[10px] font-semibold uppercase tracking-wide text-slate-900"
                />
              ) : null}
            </div>
            <p className="text-white/90 text-sm leading-relaxed">{config.instructions}</p>
          </div>
          {result.patient && (
            <div className="flex items-center gap-3 border-t border-sky-100/80 bg-white/95 px-5 py-3 backdrop-blur-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-slate-600" aria-hidden>
                <User className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{result.patient.fullName}</p>
                <p className="text-xs text-slate-600">
                  {result.patient.gender}, {result.patient.age} yrs · {result.pathwayLabel || result.pathway}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Emergency 999 call button */}
        {result.outcome === 'emergency_999' && (
          <a
            href="tel:999"
            className="flex items-center justify-center gap-2 w-full bg-destructive text-destructive-foreground py-4 rounded-2xl font-bold text-lg shadow-card-md active:scale-[0.98] transition-all"
          >
            <Phone className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
            Call 999 Now
          </a>
        )}

        {/* Red flag warning */}
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

        {/* Patient-facing explanation */}
        {result.patientExplanation ? (
          <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-5 shadow-lg shadow-sky-900/5 backdrop-blur-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">What this means for you</p>
            <p className="text-sm leading-relaxed text-slate-800">{result.patientExplanation}</p>
          </div>
        ) : null}

        {/* Clinical reasoning */}
        <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-5 shadow-xl shadow-sky-900/10 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Clinical reasoning</p>
            {explanationSource ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {EXPLANATION_SOURCE_LABEL[explanationSource] || explanationSource}
              </span>
            ) : null}
          </div>
          <ul className="space-y-2">
            {reasoningSteps.map((step, idx) => (
              <li key={`${step}-${idx}`} className="text-sm leading-relaxed text-slate-800">
                - {step}
              </li>
            ))}
          </ul>
        </div>

        {result.scoreBreakdown && result.scoreBreakdown.length > 0 ? (
          <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-5 shadow-xl shadow-sky-900/10 backdrop-blur-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Scoring modules</p>
            <div className="space-y-2">
              {result.scoreBreakdown.map((entry) => (
                <div key={`${entry.module}-${entry.outputKey || 'score'}`} className="rounded-xl border border-sky-100/80 bg-sky-50/40 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {entry.module} {typeof entry.score === 'number' ? `- score ${entry.score}` : ''}
                  </p>
                  {entry.outputKey ? <p className="text-xs text-slate-600">Output key: {entry.outputKey}</p> : null}
                  {entry.error ? <p className="text-xs text-red-700">{entry.error}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {referralRecommendation ? (
          <div className="space-y-4 rounded-2xl border border-sky-200/60 bg-white/90 p-5 shadow-xl shadow-sky-900/10 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Referral summary</p>
              <StatusBadge
                label={(referralRecommendation.service || result.outcome).replaceAll('_', ' ')}
                tone={result.outcome === 'emergency_999' || result.outcome === 'urgent_care' ? 'danger' : result.outcome === 'gp' ? 'warning' : 'info'}
                className="text-[10px] font-semibold uppercase tracking-wide"
              />
            </div>
            <div className="rounded-xl border border-sky-100/80 bg-sky-50/40 px-3 py-3">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">What You Should Do Now</p>
              <p className="text-sm leading-relaxed text-slate-800">{referralRecommendation.instruction}</p>
            </div>
            {referralRecommendation.actions?.length ? (
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Immediate Actions</p>
              <ul className="space-y-2">
                {referralRecommendation.actions.map((action) => (
                  <li key={action} className="text-sm leading-relaxed text-slate-800">
                    - {action}
                  </li>
                ))}
              </ul>
              </div>
            ) : null}
            {referralRecommendation.escalationSafetyNet?.length ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-1">Safety Advice</p>
                <ul className="space-y-1">
                  {referralRecommendation.escalationSafetyNet.map((item) => (
                    <li key={item} className="text-amber-800 text-xs leading-relaxed">- {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-5 shadow-xl shadow-sky-900/10 backdrop-blur-sm">
          <div className="mb-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Nearby options</p>
            <label className="block text-xs text-slate-600">
              Filter by postcode
              <input
                type="text"
                value={postcodeFilter}
                onChange={(event) => setPostcodeFilter(event.target.value)}
                placeholder="e.g. SW1A"
                className="mt-1.5 w-full rounded-xl border border-sky-200/90 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              />
            </label>
          </div>
          {filteredNearbyOptions.length > 0 ? (
            <ul className="space-y-2">
              {filteredNearbyOptions.slice(0, 5).map((option) => (
                <li key={`${option.type}-${option.name}`} className="rounded-xl border border-sky-100/80 bg-sky-50/40 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">{option.name}</p>
                  <p className="text-xs text-slate-600">
                    {option.type.replace('_', ' ')} · {option.distanceKm.toFixed(1)} km · {option.openNow ? 'Open now' : 'Closed now'}
                  </p>
                  <p className="text-xs text-slate-600">{option.address}</p>
                  <p className="text-xs text-slate-600">{option.phone}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">
              No nearby services matched this postcode filter. Follow the recommendation above and use NHS 111 for local service guidance.
            </p>
          )}
        </div>

        {/* Pharmacy treatment options */}
        {result.pharmacyEligible && result.pharmacyTreatmentOptions && (
          <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-5 shadow-xl shadow-sky-900/10 backdrop-blur-sm">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Possible treatments</p>
            <p className="mb-3 text-xs text-slate-600">Subject to pharmacist assessment — suggestions only.</p>
            <ul className="space-y-2">
              {result.pharmacyTreatmentOptions.map((opt) => (
                <li key={opt} className="flex items-start gap-2 text-sm text-slate-800">
                  <Pill className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
                  <span>{opt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Self-care advice */}
        {result.selfCareAdvice && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Self-Care Advice</p>
            <p className="text-green-800 text-sm leading-relaxed">{result.selfCareAdvice}</p>
          </div>
        )}

        {/* Pathway CDS disclaimer (layered model — see CLINICAL-GOVERNANCE §3) */}
        {result.pathwayPatientDisclaimer && (
          <div className="rounded-2xl border border-sky-200/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Pathway information</p>
            <p className="text-sm leading-relaxed text-slate-600">{result.pathwayPatientDisclaimer}</p>
          </div>
        )}

        {/* Safety net */}
        {result.safetyNetAdvice && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">When to Seek Further Help</p>
            <p className="text-amber-800 text-sm leading-relaxed">{result.safetyNetAdvice}</p>
          </div>
        )}

        {/* Consultation summary */}
        <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-5 shadow-xl shadow-sky-900/10 backdrop-blur-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Consultation summary</p>
          <div className="rounded-xl bg-sky-50/80 p-4 ring-1 ring-sky-100/80">
            <p className="font-mono text-xs leading-relaxed text-slate-600">{result.summaryText}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={downloadPdfSummary}
              className="touch-manipulation flex items-center justify-center gap-2 rounded-xl border-2 border-sky-200/80 bg-white py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-sky-50 active:scale-[0.98]"
            >
              <Printer className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              PDF
            </button>
            <button
              type="button"
              className="touch-manipulation flex items-center justify-center gap-2 rounded-xl border-2 border-primary/30 py-3 text-sm font-medium text-primary shadow-sm transition-all hover:bg-primary/10 active:scale-[0.98]"
            >
              <Mail className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              Email
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-5 shadow-xl shadow-sky-900/10 backdrop-blur-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Pharmacist notes</p>
          <div className="mb-3 space-y-2">
            {pharmacistNotes.length > 0 ? (
              pharmacistNotes.map((item) => (
                <div key={item.id} className="rounded-xl border border-sky-100/80 bg-sky-50/40 px-3 py-2">
                  <p className="text-sm text-slate-800">{item.note}</p>
                  <p className="text-[11px] text-slate-500">{item.pharmacistId} - {item.createdAt}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No pharmacist notes recorded yet.</p>
            )}
          </div>
          <textarea
            value={noteInput}
            onChange={(event) => setNoteInput(event.target.value)}
            placeholder="Add pharmacist note"
            rows={3}
            className="w-full resize-none rounded-xl border border-sky-200/90 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          <button
            type="button"
            onClick={savePharmacistNote}
            disabled={notesSaving || !noteInput.trim()}
            className="mt-2 touch-manipulation inline-flex min-h-[40px] items-center justify-center rounded-xl border-2 border-primary/25 bg-white/90 px-3 py-2 text-xs font-semibold text-primary shadow-sm transition-all hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {notesSaving ? 'Saving...' : 'Save note'}
          </button>
        </div>

        {result.regulatoryContext ? (
          <details className="rounded-2xl border border-sky-200/60 bg-white/90 px-4 py-3 text-left shadow-lg shadow-sky-900/5 backdrop-blur-sm">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-slate-500">
              Regulatory &amp; intended use
            </summary>
            <div className="mt-3 space-y-2 text-[11px] leading-relaxed text-slate-600">
              {result.regulatoryContext.intendedPurpose ? (
                <p>
                  <span className="font-semibold text-slate-900">Purpose: </span>
                  {result.regulatoryContext.intendedPurpose}
                </p>
              ) : null}
              {result.regulatoryContext.mhraSamDConsiderations?.postureSummary ? (
                <p>
                  <span className="font-semibold text-slate-900">MHRA / SaMD posture: </span>
                  {result.regulatoryContext.mhraSamDConsiderations.postureSummary}
                </p>
              ) : null}
              {result.regulatoryContext.pharmacyFirstAndPgd?.pgdSupply?.systemRole ? (
                <p>
                  <span className="font-semibold text-slate-900">Pharmacy / PGD: </span>
                  {result.regulatoryContext.pharmacyFirstAndPgd.pgdSupply.systemRole}{' '}
                  {result.regulatoryContext.pharmacyFirstAndPgd.pgdSupply.performedBy
                    ? `(${result.regulatoryContext.pharmacyFirstAndPgd.pgdSupply.performedBy})`
                    : null}
                </p>
              ) : null}
              <p className="pt-1">
                <Link href="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
                  {PRIVACY_LINK_LABEL}
                </Link>
                {' · '}
                <Link href="/terms" className="font-medium text-primary underline-offset-4 hover:underline">
                  {TERMS_LINK_LABEL}
                </Link>
              </p>
            </div>
          </details>
        ) : null}

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
