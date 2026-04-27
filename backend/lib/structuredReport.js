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

  const decision = {
    code: record.outcome || 'unknown',
    label: record.outcomeLabel || record.outcome || 'Unknown',
  };
  const reasoning = {
    outcomeReason: typeof record.outcomeReason === 'string' ? record.outcomeReason : '',
    redFlagTriggered: !!record.redFlagTriggered,
    redFlags: Array.isArray(record.redFlags) ? record.redFlags : [],
    pharmacyEligible: !!record.pharmacyEligible,
    explanation,
  };

  return {
    symptoms: Array.isArray(record.symptoms) ? record.symptoms : [],
    answers: record.answers && typeof record.answers === 'object' ? record.answers : {},
    decision,
    reasoning,
    timestamp: record.createdAt || record.completedAt || new Date().toISOString(),
  };
}

module.exports = {
  buildStructuredReport,
};
