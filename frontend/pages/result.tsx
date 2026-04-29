import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Mail, Phone, Pill, Printer, User } from 'lucide-react';
import { TriageOutcomeIcon } from '../lib/triageOutcomeIcons';
import type { TriageResultView } from '../types/consultation';
import { useSummaryFetch } from '../hooks/useSummaryFetch';
import { CDS_DISCLAIMER, TERMS_LINK_LABEL, PRIVACY_LINK_LABEL } from '../lib/complianceContent';
import SafetyPanel from '../components/SafetyPanel';
import InlineNotice from '../components/InlineNotice';
import { PageLoadingState } from '../components/PageState';
import { getNearbyOptionsForOutcome } from '../lib/referralDirectory';

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

  useEffect(() => {
    if (queryPostcode && queryPostcode !== postcodeFilter) {
      setPostcodeFilter(queryPostcode);
    }
  }, [queryPostcode, postcodeFilter]);

  const nearbyOptions = result?.nearbyOptions ?? [];
  const outcomeForNearbyFilter = result?.referralRecommendation?.service || result?.outcome || 'pharmacy';
  const filteredNearbyOptions = useMemo(() => {
    const entered = postcodeFilter.trim();
    if (!entered) return nearbyOptions;
    return getNearbyOptionsForOutcome(outcomeForNearbyFilter, entered, 5);
  }, [nearbyOptions, outcomeForNearbyFilter, postcodeFilter]);

  if (loading) {
    return <PageLoadingState title="Loading your results" message="Fetching consultation summary data." />;
  }

  if (fetchError && !result) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-brand-header text-primary-foreground shadow-card-md sticky top-0 z-30">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-card rounded-xl flex items-center justify-center flex-shrink-0 shadow-card">
              <span className="text-primary font-black text-sm">A</span>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Aegis Health AI</p>
              <p className="text-brand-header-subtle text-xs">Consultation</p>
            </div>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-8 flex-1">
          <div className="bg-card rounded-2xl shadow-card border border-border p-6 text-center">
            <p className="text-destructive text-sm font-semibold mb-2" role="alert">Unable to load results</p>
            <p className="text-muted-foreground text-sm mb-6">{fetchError}</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
              >
                Start again
              </Link>
              <Link
                href="/result?demo=true"
                className="inline-flex w-full items-center justify-center rounded-xl border border-input py-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
              >
                View demo result
              </Link>
            </div>
          </div>
        </main>
      </div>
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

  return (
    <div className="min-h-screen bg-background">

      <header className="bg-brand-header text-primary-foreground shadow-card-md sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-card rounded-xl flex items-center justify-center flex-shrink-0 shadow-card">
            <span className="text-primary font-black text-sm">A</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Aegis Health AI</p>
            <p className="text-brand-header-subtle text-xs">Consultation Complete</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-10">
        {multiResults.length > 1 && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Multiple Conditions Reviewed</p>
            <div className="space-y-2">
              {multiResults.map((item) => {
                const outcomeMeta = OUTCOME_CONFIG[item.outcome] || OUTCOME_CONFIG.gp;
                return (
                  <div key={item.consultationId} className="rounded-xl border border-border bg-muted/30 px-3 py-2">
                    <p className="text-sm font-semibold text-foreground">
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
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900" role="status">
            {fetchError}
          </div>
        ) : null}

        {/* Outcome hero card */}
        <div className="rounded-2xl overflow-hidden shadow-card-md">
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
            <p className="text-white/90 text-sm leading-relaxed">{config.instructions}</p>
            {decisionUrgency ? (
              <p className="mt-2 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
                Urgency: {decisionUrgency}
              </p>
            ) : null}
          </div>
          {result.patient && (
            <div className="bg-card px-5 py-3 flex items-center gap-3 border-b border-border">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground flex-shrink-0" aria-hidden>
                <User className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-semibold text-card-foreground">{result.patient.fullName}</p>
                <p className="text-xs text-muted-foreground">{result.patient.gender}, {result.patient.age} yrs · {result.pathwayLabel || result.pathway}</p>
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
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-5 shadow-card">
            <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">What this means for you</p>
            <p className="text-card-foreground text-sm leading-relaxed">{result.patientExplanation}</p>
          </div>
        ) : null}

        {/* Clinical reasoning */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Clinical Reasoning</p>
            {explanationSource ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {EXPLANATION_SOURCE_LABEL[explanationSource] || explanationSource}
              </span>
            ) : null}
          </div>
          <ul className="space-y-2">
            {reasoningSteps.map((step, idx) => (
              <li key={`${step}-${idx}`} className="text-card-foreground text-sm leading-relaxed">
                - {step}
              </li>
            ))}
          </ul>
        </div>

        {referralRecommendation ? (
          <div className="bg-card rounded-2xl shadow-card border border-border p-5 space-y-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">What you should do now</p>
              <p className="text-card-foreground text-sm leading-relaxed">{referralRecommendation.instruction}</p>
            </div>
            {referralRecommendation.actions?.length ? (
              <ul className="space-y-2">
                {referralRecommendation.actions.map((action) => (
                  <li key={action} className="text-card-foreground text-sm leading-relaxed">- {action}</li>
                ))}
              </ul>
            ) : null}
            {referralRecommendation.escalationSafetyNet?.length ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-1">Safety advice</p>
                <ul className="space-y-1">
                  {referralRecommendation.escalationSafetyNet.map((item) => (
                    <li key={item} className="text-amber-800 text-xs leading-relaxed">- {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="bg-card rounded-2xl shadow-card border border-border p-5">
          <div className="mb-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Nearby options</p>
            <label className="block text-xs text-muted-foreground">
              Filter by postcode
              <input
                type="text"
                value={postcodeFilter}
                onChange={(event) => setPostcodeFilter(event.target.value)}
                placeholder="e.g. SW1A"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          </div>
          {filteredNearbyOptions.length > 0 ? (
            <ul className="space-y-2">
              {filteredNearbyOptions.slice(0, 5).map((option) => (
                <li key={`${option.type}-${option.name}`} className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">{option.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {option.type.replace('_', ' ')} · {option.distanceKm.toFixed(1)} km · {option.openNow ? 'Open now' : 'Closed now'}
                  </p>
                  <p className="text-xs text-muted-foreground">{option.address}</p>
                  <p className="text-xs text-muted-foreground">{option.phone}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No nearby services matched this postcode filter. Follow the recommendation above and use NHS 111 for local service guidance.
            </p>
          )}
        </div>

        {/* Pharmacy treatment options */}
        {result.pharmacyEligible && result.pharmacyTreatmentOptions && (
          <div className="bg-card rounded-2xl shadow-card border border-border p-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Possible Treatments</p>
            <p className="text-xs text-muted-foreground mb-3">Subject to pharmacist assessment — suggestions only.</p>
            <ul className="space-y-2">
              {result.pharmacyTreatmentOptions.map((opt) => (
                <li key={opt} className="flex items-start gap-2 text-sm text-card-foreground">
                  <Pill className="text-primary mt-1 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
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
          <div className="bg-muted/50 border border-border rounded-2xl p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Pathway information</p>
            <p className="text-muted-foreground text-sm leading-relaxed">{result.pathwayPatientDisclaimer}</p>
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
        <div className="bg-card rounded-2xl shadow-card border border-border p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Consultation Summary</p>
          <div className="bg-muted rounded-xl p-4">
            <p className="text-muted-foreground text-xs leading-relaxed font-mono">{result.summaryText}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 border border-input text-muted-foreground py-3 rounded-xl text-sm font-medium hover:bg-muted active:scale-[0.98] transition-all"
            >
              <Printer className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              Print
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-primary/30 text-primary py-3 rounded-xl text-sm font-medium hover:bg-primary/10 active:scale-[0.98] transition-all"
            >
              <Mail className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              Email
            </button>
          </div>
        </div>

        {result.regulatoryContext ? (
          <details className="rounded-2xl border border-border bg-card/80 px-4 py-3 text-left shadow-card">
            <summary className="cursor-pointer text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Regulatory &amp; intended use
            </summary>
            <div className="mt-3 space-y-2 text-[11px] leading-relaxed text-muted-foreground">
              {result.regulatoryContext.intendedPurpose ? (
                <p>
                  <span className="font-semibold text-foreground">Purpose: </span>
                  {result.regulatoryContext.intendedPurpose}
                </p>
              ) : null}
              {result.regulatoryContext.mhraSamDConsiderations?.postureSummary ? (
                <p>
                  <span className="font-semibold text-foreground">MHRA / SaMD posture: </span>
                  {result.regulatoryContext.mhraSamDConsiderations.postureSummary}
                </p>
              ) : null}
              {result.regulatoryContext.pharmacyFirstAndPgd?.pgdSupply?.systemRole ? (
                <p>
                  <span className="font-semibold text-foreground">Pharmacy / PGD: </span>
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
          onClick={() => router.push('/')}
          className="flex w-full items-center justify-center gap-2 bg-muted text-muted-foreground py-4 rounded-2xl font-semibold hover:bg-secondary active:scale-[0.98] transition-all text-sm"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          Start a New Consultation
        </button>

        <p className="text-xs text-muted-foreground text-center pb-4">{CDS_DISCLAIMER}</p>
      </main>
    </div>
  );
}
