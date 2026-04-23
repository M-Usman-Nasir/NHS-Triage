/**
 * pharmacyEligibility.js
 * Aegis Health AI — Pharmacy Eligibility Module
 *
 * Purpose:
 *   Determines whether a patient is eligible for pharmacy-led treatment
 *   under the NHS Pharmacy First scheme for a given clinical pathway.
 *
 *   This runs AFTER red-flag detection. If a red flag was triggered, this
 *   module is not called — the patient has already been escalated.
 *
 * Usage:
 *   const { eligible, reason } = checkPharmacyEligibility(pathway, answers, patient);
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { tryEvaluateCondition } = require('./redFlagDetector');

/**
 * Load a clinical pathway JSON file.
 * @param {string} pathwayCode
 * @returns {object}
 */
function loadPathway(pathwayCode) {
  const filePath = path.join(__dirname, '../data/pathways', `${pathwayCode}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Pathway not found: ${pathwayCode}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Check if a patient is eligible for pharmacy-led treatment.
 *
 * Eligibility rules are evaluated in order. The FIRST ineligible rule
 * that matches will disqualify the patient. If no ineligible rules match
 * and at least one eligible rule matches, the patient is eligible.
 *
 * @param {string} pathwayCode  - e.g. 'uti'
 * @param {object} answers      - Patient's answers
 * @param {object} patient      - Patient demographics { age, gender }
 * @returns {object}
 *   {
 *     eligible: boolean,
 *     reason: string     // explanation for eligibility decision
 *   }
 */
function checkPharmacyEligibility(pathwayCode, answers, patient = {}) {
  const pathway = loadPathway(pathwayCode);

  if (!pathway.eligibilityRules || pathway.eligibilityRules.length === 0) {
    return { eligible: false, reason: 'No eligibility rules defined for this pathway.', governanceUncertainty: [] };
  }

  const governanceUncertainty = [];
  const ageNum =
    patient.age === undefined || patient.age === null || patient.age === ''
      ? NaN
      : Number(patient.age);
  const ageKnown = Number.isFinite(ageNum);

  // Demographics required for age-bounded pathways — unknown age must not silently pass
  if ((pathway.minimumAge != null || pathway.maximumAge != null) && !ageKnown) {
    governanceUncertainty.push('age_not_verified');
    return {
      eligible: false,
      reason:
        'Age could not be verified for automated pharmacy checks. GP assessment is the safer default (NHS governance: do not route to pharmacy when age eligibility cannot be confirmed).',
      governanceUncertainty,
    };
  }

  // Check gender restriction first
  if (pathway.applicableGenders && pathway.applicableGenders.length > 0) {
    const g = patient.gender;
    if (g == null || String(g).trim() === '') {
      governanceUncertainty.push('gender_not_verified');
      return {
        eligible: false,
        reason:
          'Gender was not recorded; this pathway applies automated rules by sex where clinically required. GP assessment is the safer default.',
        governanceUncertainty,
      };
    }
    if (!pathway.applicableGenders.includes(g)) {
      return {
        eligible: false,
        reason: `This pathway is only applicable to: ${pathway.applicableGenders.join(', ')}.`,
        governanceUncertainty,
      };
    }
  }

  // Check age restriction
  if (pathway.minimumAge != null && ageNum < pathway.minimumAge) {
    return {
      eligible: false,
      reason: `Minimum age for this pathway is ${pathway.minimumAge}. Patient requires GP assessment.`,
      governanceUncertainty,
    };
  }
  if (pathway.maximumAge != null && ageNum > pathway.maximumAge) {
    return {
      eligible: false,
      reason: `Maximum age for this pathway is ${pathway.maximumAge}. Patient requires GP assessment.`,
      governanceUncertainty,
    };
  }

  // Evaluate pathway-specific eligibility rules
  // Ineligible rules take priority — evaluated first
  const ineligibleRules = pathway.eligibilityRules.filter((r) => r.eligible === false);
  const eligibleRules = pathway.eligibilityRules.filter((r) => r.eligible === true);

  for (const rule of ineligibleRules) {
    const ev = tryEvaluateCondition(rule.condition, answers, patient, pathway);
    if (!ev.ok) {
      governanceUncertainty.push(`ineligible_rule_eval_failed:${rule.id || rule.condition}`);
      return {
        eligible: false,
        reason:
          'An eligibility exclusion rule could not be evaluated safely. GP assessment is recommended rather than pharmacy-led supply.',
        governanceUncertainty,
      };
    }
    if (ev.value) {
      return {
        eligible: false,
        reason: rule.reason || 'Patient does not meet pharmacy eligibility criteria.',
        governanceUncertainty,
      };
    }
  }

  for (const rule of eligibleRules) {
    const ev = tryEvaluateCondition(rule.condition, answers, patient, pathway);
    if (!ev.ok) {
      governanceUncertainty.push(`eligible_rule_eval_failed:${rule.id || rule.condition}`);
      continue;
    }
    if (ev.value) {
      return {
        eligible: true,
        reason: rule.reason || 'Patient meets pharmacy eligibility criteria.',
        governanceUncertainty,
      };
    }
  }

  // Default: if no rule explicitly made them eligible, default to ineligible (safety-first)
  if (governanceUncertainty.length) {
    return {
      eligible: false,
      reason:
        'Pharmacy eligibility could not be confirmed after an automated rule error. GP review is the safer default.',
      governanceUncertainty,
    };
  }

  return {
    eligible: false,
    reason: 'Patient did not meet all pharmacy eligibility criteria. GP review recommended.',
    governanceUncertainty,
  };
}

module.exports = { checkPharmacyEligibility };
