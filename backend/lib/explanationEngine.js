'use strict';

const DEFAULT_REASON =
  'Outcome determined by rule-based triage after safety and eligibility evaluation.';

/**
 * Canonical explanation object for all system decisions.
 * @param {object} params
 * @param {string} params.decision
 * @param {string} params.reason
 * @param {string} [params.source]
 * @returns {{decision: string, reason: string, source: string}}
 */
function buildDecisionExplanation({ decision, reason, source = 'rule_engine' }) {
  const normalizedDecision = typeof decision === 'string' && decision.trim() ? decision.trim() : 'unknown';
  const normalizedReason = typeof reason === 'string' && reason.trim() ? reason.trim() : DEFAULT_REASON;
  const normalizedSource = typeof source === 'string' && source.trim() ? source.trim() : 'rule_engine';

  return {
    decision: normalizedDecision,
    reason: normalizedReason,
    source: normalizedSource,
  };
}

module.exports = {
  buildDecisionExplanation,
  DEFAULT_REASON,
};
