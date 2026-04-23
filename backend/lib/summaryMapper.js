/**
 * Maps a raw consultation record (POST shape or mock JSON shape) to the
 * GET /api/summary/:id response contract expected by the frontend.
 */

'use strict';

const { buildRegulatoryContext } = require('./regulatoryContext');

const PATHWAY_LABELS = {
  uti: 'Uncomplicated UTI',
  sore_throat: 'Sore Throat',
  sinusitis: 'Sinusitis',
  otitis_media: 'Ear Infection',
  insect_bites: 'Infected Insect Bite',
  impetigo: 'Impetigo',
  shingles: 'Shingles',
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
    outcomeReason: rec.outcomeReason || '',
    summaryText: rec.summaryText || '',
    safetyNetAdvice: rec.safetyNetAdvice ?? null,
    pharmacyTreatmentOptions: rec.pharmacyTreatmentOptions ?? null,
    selfCareAdvice: rec.selfCareAdvice ?? null,
    status: rec.status || 'completed',
    patientExplanation: rec.patientExplanation || '',
    comorbidityModifiersApplied: rec.comorbidityModifiersApplied || [],
    governanceUncertainty: rec.governanceUncertainty || [],
    regulatoryContext,
  };
}

module.exports = {
  recordToSummaryResponse,
  PATHWAY_LABELS,
};
