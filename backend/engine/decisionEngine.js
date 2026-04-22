/**
 * decisionEngine.js
 * Aegis Health AI — Clinical Decision Engine
 *
 * Purpose:
 *   Orchestrates the full triage decision process for a patient consultation.
 *   This is the core of the platform. It coordinates:
 *     1. Red-flag detection (safety check — always runs first)
 *     2. Pharmacy eligibility check
 *     3. Outcome rule evaluation
 *     4. Summary text generation
 *
 * Decision flow:
 *   ┌─────────────────────────────────┐
 *   │  Patient submits consultation   │
 *   └──────────────┬──────────────────┘
 *                  │
 *   ┌──────────────▼──────────────────┐
 *   │  1. Red-Flag Detection          │
 *   │     → Emergency? → Escalate     │
 *   └──────────────┬──────────────────┘
 *                  │ (no red flags)
 *   ┌──────────────▼──────────────────┐
 *   │  2. Pharmacy Eligibility Check  │
 *   └──────────────┬──────────────────┘
 *                  │
 *   ┌──────────────▼──────────────────┐
 *   │  3. Outcome Rule Evaluation     │
 *   │     → self_care / pharmacy /    │
 *   │       gp / urgent_care / 999    │
 *   └──────────────┬──────────────────┘
 *                  │
 *   ┌──────────────▼──────────────────┐
 *   │  4. Summary Generation          │
 *   └─────────────────────────────────┘
 *
 * Usage:
 *   const result = runTriage({ pathwayCode, answers, patient });
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { detectRedFlags, getRedFlagMessage } = require('./redFlagDetector');
const { checkPharmacyEligibility } = require('./pharmacyEligibility');
const { evaluateCondition } = require('./redFlagDetector');

// Human-readable labels for each outcome code
const OUTCOME_LABELS = {
  self_care:     'Self-Care Advice',
  pharmacy:      'Pharmacy Referral',
  gp:            'GP Appointment Recommended',
  urgent_care:   'Urgent Care Required',
  emergency_999: 'Call 999 — Emergency',
};

// Colour codes for UI rendering (can be used by frontend)
const OUTCOME_COLOURS = {
  self_care:     'green',
  pharmacy:      'blue',
  gp:            'yellow',
  urgent_care:   'orange',
  emergency_999: 'red',
};

/**
 * Load a clinical pathway file.
 * @param {string} pathwayCode
 * @returns {object}
 */
function loadPathway(pathwayCode) {
  const filePath = path.join(__dirname, '../data/pathways', `${pathwayCode}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Unknown pathway: "${pathwayCode}". Check that a matching JSON file exists.`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Evaluate outcome rules in priority order.
 * Returns the first matching outcome.
 *
 * @param {Array}  outcomeRules  - Array of rule objects from pathway JSON
 * @param {object} context       - Merged context: answers + eligibility + flags
 * @param {object} patient       - Patient demographics
 * @returns {{ outcome: string, reason: string }}
 */
function evaluateOutcomeRules(outcomeRules, context, patient) {
  // Sort rules by priority (ascending — lower number = evaluated first)
  const sorted = [...outcomeRules].sort((a, b) => (a.priority || 99) - (b.priority || 99));

  for (const rule of sorted) {
    // Skip escalation placeholder — handled separately
    if (rule.outcome === 'escalated_by_red_flag') continue;

    const matched = evaluateCondition(rule.condition, context, patient);
    if (matched) {
      return { outcome: rule.outcome, reason: rule.reason || '' };
    }
  }

  // Safety fallback — should not normally be reached
  return { outcome: 'gp', reason: 'Unable to determine a specific outcome. GP assessment recommended.' };
}

/**
 * Generate a plain-English consultation summary.
 *
 * @param {object} params
 * @returns {string} Summary text
 */
function generateSummary({ patient, pathway, symptoms, answers, redFlagResult, pharmacyEligible, outcome, outcomeReason }) {
  const patientLine = `Patient: ${patient.fullName || 'Anonymous'} (${patient.gender || 'Unknown'}, ${patient.age || 'Unknown age'}).`;
  const symptomsLine = symptoms && symptoms.length > 0
    ? `Reported symptoms: ${symptoms.join(', ')}.`
    : 'Symptoms not individually listed.';

  const flagLine = redFlagResult.triggered
    ? `RED FLAGS DETECTED: ${redFlagResult.flags.map((f) => f.code + ' — ' + f.description).join('; ')}.`
    : 'No red flags detected.';

  const eligibilityLine = `Pharmacy eligible: ${pharmacyEligible ? 'Yes' : 'No'}.`;
  const outcomeLine = `OUTCOME: ${OUTCOME_LABELS[outcome] || outcome}. ${outcomeReason}`;

  const pathwayLabel = pathway.label || pathway.pathway;

  return [
    patientLine,
    `Clinical pathway: ${pathwayLabel}.`,
    symptomsLine,
    flagLine,
    eligibilityLine,
    outcomeLine,
  ].join(' ');
}

/**
 * Main triage function.
 * Call this with patient data to get a full triage decision.
 *
 * @param {object} input
 * @param {string} input.pathwayCode  - Clinical pathway e.g. 'uti'
 * @param {object} input.answers      - Patient's questionnaire answers
 * @param {object} input.patient      - Patient demographics { fullName, age, gender }
 * @param {Array}  input.symptoms     - Array of symptom strings (free text)
 *
 * @returns {object} Triage result:
 *   {
 *     outcome: string,              // 'self_care' | 'pharmacy' | 'gp' | 'urgent_care' | 'emergency_999'
 *     outcomeLabel: string,         // Human-readable label
 *     outcomeColour: string,        // UI colour hint
 *     outcomeReason: string,        // Explanation
 *     redFlagTriggered: boolean,
 *     redFlags: Array,
 *     pharmacyEligible: boolean,
 *     summaryText: string,
 *     safetyNetAdvice: string,
 *     pharmacyTreatmentOptions: Array | null,
 *     selfCareAdvice: string | null,
 *   }
 */
function runTriage({ pathwayCode, answers, patient, symptoms = [] }) {
  if (!pathwayCode) throw new Error('pathwayCode is required');
  if (!answers) throw new Error('answers is required');

  const pathway = loadPathway(pathwayCode);

  // Step 1: Red-flag detection — always runs first
  const redFlagResult = detectRedFlags(pathwayCode, answers, patient);

  if (redFlagResult.triggered) {
    const flagMessage = getRedFlagMessage(redFlagResult.flags);
    const outcome = redFlagResult.highestSeverityOutcome || 'urgent_care';

    return {
      outcome,
      outcomeLabel: OUTCOME_LABELS[outcome],
      outcomeColour: OUTCOME_COLOURS[outcome],
      outcomeReason: flagMessage,
      redFlagTriggered: true,
      redFlags: redFlagResult.flags,
      pharmacyEligible: false,
      summaryText: generateSummary({
        patient, pathway, symptoms, answers, redFlagResult,
        pharmacyEligible: false, outcome, outcomeReason: flagMessage,
      }),
      safetyNetAdvice: pathway.safetyNetAdvice || null,
      pharmacyTreatmentOptions: null,
      selfCareAdvice: null,
    };
  }

  // Step 2: Pharmacy eligibility check
  const { eligible: pharmacyEligible, reason: eligibilityReason } = checkPharmacyEligibility(
    pathwayCode, answers, patient
  );

  // Step 3: Outcome rule evaluation
  const context = {
    ...answers,
    pharmacyEligible,
    redFlagTriggered: false,
    age: patient.age || null,
    gender: patient.gender || null,
  };

  const { outcome, reason: outcomeReason } = evaluateOutcomeRules(
    pathway.outcomeRules || [],
    context,
    patient
  );

  const finalReason = outcomeReason || eligibilityReason || '';

  // Step 4: Generate consultation summary
  const summaryText = generateSummary({
    patient, pathway, symptoms, answers,
    redFlagResult, pharmacyEligible, outcome,
    outcomeReason: finalReason,
  });

  return {
    outcome,
    outcomeLabel: OUTCOME_LABELS[outcome] || outcome,
    outcomeColour: OUTCOME_COLOURS[outcome] || 'grey',
    outcomeReason: finalReason,
    redFlagTriggered: false,
    redFlags: [],
    pharmacyEligible,
    summaryText,
    safetyNetAdvice: pathway.safetyNetAdvice || null,
    pharmacyTreatmentOptions: pharmacyEligible
      ? (pathway.pharmacyTreatmentOptions || null)
      : null,
    selfCareAdvice: outcome === 'self_care'
      ? (pathway.selfCareAdvice || null)
      : null,
  };
}

/**
 * List all available pathway codes by scanning the pathways directory.
 * @returns {Array<string>}
 */
function listAvailablePathways() {
  const dir = path.join(__dirname, '../data/pathways');
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}

module.exports = {
  runTriage,
  listAvailablePathways,
  OUTCOME_LABELS,
  OUTCOME_COLOURS,
};
