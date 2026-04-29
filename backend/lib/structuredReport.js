'use strict';

/**
 * Build canonical structured consultation report.
 *
 * Required fields:
 * - symptoms
 * - answers
 * - decision
 * - reasoning
 * - timestamp
 */
function buildStructuredReport(record) {
  const explanation =
    record.explanation && typeof record.explanation === 'object'
      ? record.explanation
      : {
          decision: record.outcome || 'unknown',
          reason: typeof record.outcomeReason === 'string' ? record.outcomeReason : '',
          source: 'rule_engine',
        };

  const decision =
    record.decision && typeof record.decision === 'object'
      ? record.decision
      : {
          code: record.outcome || 'unknown',
          label: record.outcomeLabel || record.outcome || 'Unknown',
        };
  const reasoning =
    record.reasoning && typeof record.reasoning === 'object'
      ? record.reasoning
      : {
          steps: [typeof record.outcomeReason === 'string' ? record.outcomeReason : ''],
          clinicalBasis: [typeof record.outcomeReason === 'string' ? record.outcomeReason : ''],
          engine: {
            source: explanation.source || 'rule_engine',
            ruleIdsMatched: [],
            governanceUncertainty: Array.isArray(record.governanceUncertainty) ? record.governanceUncertainty : [],
          },
        };
  const referralRecommendation =
    record.referralRecommendation && typeof record.referralRecommendation === 'object'
      ? record.referralRecommendation
      : {
          service: record.outcome || 'unknown',
          instruction: typeof record.patientExplanation === 'string' ? record.patientExplanation : '',
          actions: [],
          escalationSafetyNet:
            typeof record.safetyNetAdvice === 'string' && record.safetyNetAdvice.trim() ? [record.safetyNetAdvice] : [],
        };

  return {
    symptoms: Array.isArray(record.symptoms) ? record.symptoms : [],
    answers: record.answers && typeof record.answers === 'object' ? record.answers : {},
    decision,
    reasoning,
    referralRecommendation,
    explanation,
    outcome: record.outcome || decision.code || 'unknown',
    outcomeLabel: record.outcomeLabel || decision.label || 'Unknown',
    outcomeReason: typeof record.outcomeReason === 'string' ? record.outcomeReason : '',
    redFlagTriggered: !!record.redFlagTriggered,
    redFlags: Array.isArray(record.redFlags) ? record.redFlags : [],
    pharmacyEligible: !!record.pharmacyEligible,
    timestamp: record.createdAt || record.completedAt || new Date().toISOString(),
  };
}

module.exports = {
  buildStructuredReport,
};
