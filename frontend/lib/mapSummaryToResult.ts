import type { SummaryApiResponse, TriageResultView } from '../types/consultation';

export function mapSummaryToResult(data: SummaryApiResponse): TriageResultView {
  const fallbackDecision = {
    code: data.outcome,
    label: data.outcomeLabel,
    urgency: undefined,
    title: data.outcomeLabel,
  };
  const fallbackReasoning = {
    steps: [data.outcomeReason],
    clinicalBasis: [data.outcomeReason],
    engine: {
      source: data.explanation?.source,
      ruleIdsMatched: [],
      governanceUncertainty: data.governanceUncertainty ?? [],
    },
  };
  const fallbackReferral = {
    service: data.outcome,
    instruction: data.patientExplanation ?? data.outcomeReason,
    actions: [],
    escalationSafetyNet: data.safetyNetAdvice ? [data.safetyNetAdvice] : [],
  };

  return {
    consultationId: data.id,
    patient: data.patient,
    pathway: data.pathway,
    pathwayLabel: data.pathwayLabel,
    outcome: data.outcome,
    outcomeLabel: data.outcomeLabel,
    outcomeReason: data.outcomeReason,
    explanation: data.explanation ?? undefined,
    decision: data.decision ?? fallbackDecision,
    reasoning: data.reasoning ?? fallbackReasoning,
    referralRecommendation: data.referralRecommendation ?? fallbackReferral,
    nearbyOptions: data.nearbyOptions ?? [],
    redFlagTriggered: data.redFlagTriggered,
    redFlags: data.redFlagReasons,
    pharmacyEligible: data.pharmacyEligible,
    summaryText: data.summaryText,
    pathwayPatientDisclaimer: data.pathwayPatientDisclaimer ?? undefined,
    safetyNetAdvice: data.safetyNetAdvice ?? undefined,
    pharmacyTreatmentOptions: data.pharmacyTreatmentOptions ?? undefined,
    selfCareAdvice: data.selfCareAdvice ?? undefined,
    patientExplanation: data.patientExplanation ?? undefined,
    comorbidityModifiersApplied: data.comorbidityModifiersApplied ?? undefined,
    governanceUncertainty: data.governanceUncertainty ?? undefined,
    regulatoryContext: data.regulatoryContext ?? undefined,
  };
}
