/**
 * Maps a raw consultation record (POST shape or mock JSON shape) to the
 * GET /api/summary/:id response contract expected by the frontend.
 */

'use strict';

const { buildRegulatoryContext } = require('./regulatoryContext');
const { buildStructuredReport } = require('./structuredReport');
const { buildDecisionExplanation } = require('./explanationEngine');

const PATHWAY_LABELS = {
  uti: 'Uncomplicated UTI',
  sore_throat: 'Sore Throat',
  sinusitis: 'Sinusitis',
  otitis_media: 'Ear Infection',
  insect_bites: 'Infected Insect Bite',
  impetigo: 'Impetigo',
  shingles: 'Shingles',
};

const OUTCOME_URGENCY = {
  self_care: 'routine',
  pharmacy: 'same_day',
  gp: 'soon',
  urgent_care: 'immediate_same_day',
  emergency_999: 'immediate_emergency',
};

const OUTCOME_TITLES = {
  self_care: 'Self-care recommended',
  pharmacy: 'Pharmacy consultation recommended',
  gp: 'GP consultation recommended',
  urgent_care: 'Urgent care recommended',
  emergency_999: 'Call emergency services immediately',
};

function normalizeRedFlags(raw) {
  const arr = raw || [];
  return arr.map((f) => ({
    code: f.code,
    description: f.description,
    message: f.message || f.description || 'Please seek urgent medical advice.',
    ...(f.tier ? { tier: f.tier } : {}),
  }));
}

function normalizeDecision(rec) {
  const outcome = rec.outcome || 'unknown';
  if (rec.decision && typeof rec.decision === 'object') {
    return rec.decision;
  }
  return {
    code: outcome,
    label: rec.outcomeLabel || outcome,
    urgency: OUTCOME_URGENCY[outcome] || 'unknown',
    title: OUTCOME_TITLES[outcome] || rec.outcomeLabel || outcome,
  };
}

function normalizeReasoning(rec, outcomeReason, redFlagTriggered, governanceUncertainty) {
  if (rec.reasoning && typeof rec.reasoning === 'object') {
    const steps = Array.isArray(rec.reasoning.steps) && rec.reasoning.steps.length > 0
      ? rec.reasoning.steps
      : [outcomeReason];
    return {
      ...rec.reasoning,
      steps,
      engine: rec.reasoning.engine || {
        source: redFlagTriggered ? 'red_flag_engine' : 'rule_engine',
        ruleIdsMatched: [],
        governanceUncertainty,
      },
    };
  }
  return {
    steps: [outcomeReason],
    clinicalBasis: [outcomeReason],
    engine: {
      source: redFlagTriggered ? 'red_flag_engine' : 'rule_engine',
      ruleIdsMatched: [],
      governanceUncertainty,
    },
  };
}

function normalizeReferralRecommendation(rec, outcome, outcomeReason, safetyNetAdvice) {
  if (rec.referralRecommendation && typeof rec.referralRecommendation === 'object') {
    return rec.referralRecommendation;
  }
  return {
    service: outcome,
    instruction: rec.patientExplanation || outcomeReason,
    actions: [],
    escalationSafetyNet:
      typeof safetyNetAdvice === 'string' && safetyNetAdvice.trim() ? [safetyNetAdvice] : [],
  };
}

/**
 * @param {object} rec - consultation row from store
 * @returns {object} summary JSON shape
 */
function recordToSummaryResponse(rec) {
  const pathway = rec.pathwayCode || rec.pathway;
  const pathwayLabel = rec.pathwayLabel || PATHWAY_LABELS[pathway] || pathway;
  const redFlagReasons = normalizeRedFlags(rec.redFlagReasons || rec.redFlags);

  const regulatoryContext =
    rec.regulatoryContext ||
    buildRegulatoryContext({
      pathwayCode: pathway,
      outcome: rec.outcome,
      pharmacyEligible: !!rec.pharmacyEligible,
      redFlagTriggered: !!rec.redFlagTriggered,
    });

  const outcomeReason =
    typeof rec.outcomeReason === 'string' && rec.outcomeReason.trim()
      ? rec.outcomeReason.trim()
      : 'Outcome determined by rule-based triage after safety and eligibility evaluation.';
  const explanation =
    rec.explanation && typeof rec.explanation === 'object'
      ? rec.explanation
      : buildDecisionExplanation({
          decision: rec.outcome,
          reason: outcomeReason,
          source: 'rule_engine',
        });
  const decision = normalizeDecision(rec);
  const governanceUncertainty = rec.governanceUncertainty || [];
  const reasoning = normalizeReasoning(rec, outcomeReason, !!rec.redFlagTriggered, governanceUncertainty);
  const referralRecommendation = normalizeReferralRecommendation(rec, rec.outcome, outcomeReason, rec.safetyNetAdvice);

  return {
    id: rec.id,
    createdAt: rec.createdAt || rec.completedAt,
    patient: rec.patient,
    pathway,
    pathwayLabel,
    symptoms: rec.symptoms || [],
    answers: rec.answers || {},
    redFlagTriggered: !!rec.redFlagTriggered,
    redFlagReasons,
    pharmacyEligible: !!rec.pharmacyEligible,
    outcome: rec.outcome,
    outcomeLabel: rec.outcomeLabel,
    outcomeReason,
    explanation,
    decision,
    reasoning,
    referralRecommendation,
    summaryText: rec.summaryText || '',
    pathwayPatientDisclaimer: rec.pathwayPatientDisclaimer ?? null,
    safetyNetAdvice: rec.safetyNetAdvice ?? null,
    pharmacyTreatmentOptions: rec.pharmacyTreatmentOptions ?? null,
    selfCareAdvice: rec.selfCareAdvice ?? null,
    status: rec.status || 'completed',
    patientExplanation: rec.patientExplanation || '',
    comorbidityModifiersApplied: rec.comorbidityModifiersApplied || [],
    governanceUncertainty,
    regulatoryContext,
    structuredReport: rec.structuredReport || buildStructuredReport({ ...rec, outcomeReason }),
    pharmacistOverride: rec.pharmacistOverride || null,
  };
}

module.exports = {
  recordToSummaryResponse,
  PATHWAY_LABELS,
};
