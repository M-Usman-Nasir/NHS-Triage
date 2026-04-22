import type { SummaryApiResponse, TriageResultView } from '../types/consultation';

export function mapSummaryToResult(data: SummaryApiResponse): TriageResultView {
  return {
    consultationId: data.id,
    patient: data.patient,
    pathway: data.pathway,
    pathwayLabel: data.pathwayLabel,
    outcome: data.outcome,
    outcomeLabel: data.outcomeLabel,
    outcomeReason: data.outcomeReason,
    redFlagTriggered: data.redFlagTriggered,
    redFlags: data.redFlagReasons,
    pharmacyEligible: data.pharmacyEligible,
    summaryText: data.summaryText,
    safetyNetAdvice: data.safetyNetAdvice ?? undefined,
    pharmacyTreatmentOptions: data.pharmacyTreatmentOptions ?? undefined,
    selfCareAdvice: data.selfCareAdvice ?? undefined,
  };
}
