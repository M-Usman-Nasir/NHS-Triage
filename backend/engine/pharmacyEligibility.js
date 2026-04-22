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
const { evaluateCondition } = require('./redFlagDetector');

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
    return { eligible: false, reason: 'No eligibility rules defined for this pathway.' };
  }

  // Check gender restriction first
  if (pathway.applicableGenders && pathway.applicableGenders.length > 0) {
    if (!pathway.applicableGenders.includes(patient.gender)) {
      return {
        eligible: false,
        reason: `This pathway is only applicable to: ${pathway.applicableGenders.join(', ')}.`,
      };
    }
  }

  // Check age restriction
  if (pathway.minimumAge && patient.age < pathway.minimumAge) {
    return {
      eligible: false,
      reason: `Minimum age for this pathway is ${pathway.minimumAge}. Patient requires GP assessment.`,
    };
  }
  if (pathway.maximumAge && patient.age > pathway.maximumAge) {
    return {
      eligible: false,
      reason: `Maximum age for this pathway is ${pathway.maximumAge}. Patient requires GP assessment.`,
    };
  }

  // Evaluate pathway-specific eligibility rules
  // Ineligible rules take priority — evaluated first
  const ineligibleRules = pathway.eligibilityRules.filter((r) => r.eligible === false);
  const eligibleRules = pathway.eligibilityRules.filter((r) => r.eligible === true);

  for (const rule of ineligibleRules) {
    const matched = evaluateCondition(rule.condition, answers, patient);
    if (matched) {
      return {
        eligible: false,
        reason: rule.reason || 'Patient does not meet pharmacy eligibility criteria.',
      };
    }
  }

  for (const rule of eligibleRules) {
    const matched = evaluateCondition(rule.condition, answers, patient);
    if (matched) {
      return {
        eligible: true,
        reason: rule.reason || 'Patient meets pharmacy eligibility criteria.',
      };
    }
  }

  // Default: if no rule explicitly made them eligible, default to ineligible (safety-first)
  return {
    eligible: false,
    reason: 'Patient did not meet all pharmacy eligibility criteria. GP review recommended.',
  };
}

module.exports = { checkPharmacyEligibility };
