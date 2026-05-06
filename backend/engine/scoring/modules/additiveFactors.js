'use strict';

const { tryEvaluateCondition } = require('../../redFlagDetector');

function runAdditiveFactorScoring({ config, context, patient, pathway, defaultErrorMessage, idFallback = 'unknown_factor' }) {
  const factors = Array.isArray(config.factors) ? config.factors : [];
  let score = 0;
  const breakdown = [];
  let hasEvaluationFailure = false;

  for (const factor of factors) {
    const points = Number.isFinite(Number(factor.points)) ? Number(factor.points) : 0;
    const ev = tryEvaluateCondition(factor.condition, context, patient, pathway);
    if (!ev.ok) {
      hasEvaluationFailure = true;
      breakdown.push({
        id: factor.id || factor.label || idFallback,
        matched: false,
        points,
        error: ev.error,
      });
      continue;
    }
    const matched = ev.value === true;
    if (matched) {
      score += points;
    }
    breakdown.push({
      id: factor.id || factor.label || idFallback,
      matched,
      points: matched ? points : 0,
    });
  }

  return {
    ok: !hasEvaluationFailure,
    score,
    breakdown,
    error: hasEvaluationFailure ? defaultErrorMessage : null,
  };
}

module.exports = {
  runAdditiveFactorScoring,
};

