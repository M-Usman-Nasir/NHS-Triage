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
  const decision = {
    code: record.outcome || 'unknown',
    label: record.outcomeLabel || record.outcome || 'Unknown',
  };
  const reasoning = {
    outcomeReason: typeof record.outcomeReason === 'string' ? record.outcomeReason : '',
    redFlagTriggered: !!record.redFlagTriggered,
    redFlags: Array.isArray(record.redFlags) ? record.redFlags : [],
    pharmacyEligible: !!record.pharmacyEligible,
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
