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
const { detectRedFlags, getRedFlagMessage, evaluateCondition, tryEvaluateCondition } = require('./redFlagDetector');
const { checkPharmacyEligibility } = require('./pharmacyEligibility');
const { evaluateComorbidityModifiers } = require('./comorbidityModifiers');
const { buildPatientExplanation } = require('./patientExplanation');
const { buildDecisionExplanation } = require('../lib/explanationEngine');
const { applyPathwayScoring } = require('./scoring');

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

const REFERRAL_TEMPLATES = {
  self_care: {
    service: 'self_care',
    instruction: 'You can manage this at home.',
    actions: [
      'Follow the self-care advice shown below.',
      'Monitor your symptoms over the next 24 to 48 hours.',
    ],
    escalationSafetyNet: [
      'If symptoms worsen or new warning symptoms appear, contact a GP.',
      'If severe symptoms develop suddenly, call 999.',
    ],
  },
  pharmacy: {
    service: 'pharmacy',
    instruction: 'You should go to a pharmacy.',
    actions: [
      'Visit your nearest pharmacy today.',
      'Speak to the pharmacist and describe your symptoms.',
      'Show your consultation summary if available.',
    ],
    escalationSafetyNet: [
      'If symptoms worsen, contact a GP or NHS 111.',
      'If severe breathing, chest pain, or collapse occurs, call 999 immediately.',
    ],
  },
  gp: {
    service: 'gp',
    instruction: 'You should contact a GP.',
    actions: [
      'Contact your GP surgery for an appointment.',
      'Use NHS 111 for advice if you cannot reach your GP.',
    ],
    escalationSafetyNet: [
      'If symptoms become severe while waiting, seek urgent care the same day.',
      'If life-threatening symptoms appear, call 999 immediately.',
    ],
  },
  urgent_care: {
    service: 'urgent_care',
    instruction: 'Visit urgent care immediately.',
    actions: [
      'Seek same-day urgent assessment now.',
      'Use NHS 111 if you need help finding the correct urgent service.',
    ],
    escalationSafetyNet: [
      'Do not delay if symptoms are getting worse.',
      'Call 999 immediately if you develop emergency symptoms.',
    ],
  },
  emergency_999: {
    service: 'emergency_999',
    instruction: 'Call emergency services immediately.',
    actions: [
      'Call 999 now.',
      'Do not drive yourself if you feel unwell.',
      'If possible, stay with another person while waiting for help.',
    ],
    escalationSafetyNet: [
      'If the line disconnects, call 999 again immediately.',
    ],
    contact: { type: 'phone', value: '999' },
  },
};

function buildDecisionMeta(outcome) {
  return {
    code: outcome,
    label: OUTCOME_LABELS[outcome] || outcome,
    urgency: OUTCOME_URGENCY[outcome] || 'unknown',
    title: OUTCOME_TITLES[outcome] || 'Clinical triage recommendation',
  };
}

function buildReasoningSteps({
  outcome,
  redFlagTriggered,
  redFlagResult,
  pharmacyEligible,
  finalReason,
  governanceUncertainty,
}) {
  const steps = [];
  if (redFlagTriggered) {
    const topFlag = (redFlagResult.flags || [])[0];
    if (topFlag?.description) {
      steps.push(`A safety red flag was detected: ${topFlag.description}.`);
    } else {
      steps.push('A safety red flag was detected from your answers.');
    }
    steps.push('Red-flag detection is evaluated first to prevent under-triage.');
    steps.push(finalReason);
  } else {
    steps.push('No emergency red flags were detected from your answers.');
    steps.push(
      pharmacyEligible
        ? 'Your answers remained eligible for pharmacy-level care after exclusions were checked.'
        : 'Your answers did not meet pharmacy eligibility checks, so a higher level of care is recommended.',
    );
    steps.push(finalReason);
  }
  if (governanceUncertainty && governanceUncertainty.length > 0) {
    steps.push(
      'A conservative NHS governance fallback was applied because one or more automated checks were uncertain.',
    );
  }
  if (outcome === 'emergency_999') {
    steps.push('This outcome requires immediate emergency response.');
  }
  return steps.filter((s) => typeof s === 'string' && s.trim().length > 0);
}

function buildReferralRecommendation(outcome) {
  const template = REFERRAL_TEMPLATES[outcome] || REFERRAL_TEMPLATES.gp;
  return {
    service: template.service,
    instruction: template.instruction,
    actions: [...template.actions],
    escalationSafetyNet: [...template.escalationSafetyNet],
    ...(template.contact ? { contact: template.contact } : {}),
  };
}

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
 * @returns {{ outcome: string, reason: string, engineUncertainty: boolean }}
 */
function evaluateOutcomeRules(outcomeRules, context, patient, pathway) {
  // Sort rules by priority (ascending — lower number = evaluated first)
  const sorted = [...outcomeRules].sort((a, b) => (a.priority || 99) - (b.priority || 99));

  let engineUncertainty = false;
  for (const rule of sorted) {
    // Skip escalation placeholder — handled separately
    if (rule.outcome === 'escalated_by_red_flag') continue;

    const ev = tryEvaluateCondition(rule.condition, context, patient, pathway);
    if (!ev.ok) {
      engineUncertainty = true;
      console.warn(`[DecisionEngine] Outcome rule (priority ${rule.priority}) not evaluable — ${ev.error}`);
      continue;
    }
    if (ev.value) {
      return {
        outcome: rule.outcome,
        reason: rule.reason || '',
        engineUncertainty,
        matchedRule: {
          id: rule.id || null,
          code: rule.code || null,
          priority: rule.priority || null,
        },
      };
    }
  }

  // NHS governance: when automated disposition is unclear or rules failed to evaluate, prefer higher-touch care
  if (engineUncertainty) {
    return {
      outcome: 'urgent_care',
      reason:
        'The system could not reliably match your answers to a single automated outcome. Same-day clinical assessment is recommended (GP urgent appointment, NHS 111, or urgent treatment centre).',
      engineUncertainty: true,
      matchedRule: null,
    };
  }

  return {
    outcome: 'gp',
    reason: 'Unable to determine a specific outcome from the current rule set. GP assessment recommended.',
    engineUncertainty: false,
    matchedRule: null,
  };
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
 *     patientExplanation: string,
 *     comorbidityModifiersApplied: Array<{ id?: string, blockPharmacy?: boolean, reason?: string }>,
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
    const patientExplanation = buildPatientExplanation({
      outcome,
      outcomeReason: flagMessage,
      redFlagTriggered: true,
      redFlagMessage: flagMessage,
      comorbidityFragments: [],
    });

    const decision = buildDecisionMeta(outcome);
    const governanceUncertainty = redFlagResult.governanceEvalFailure ? ['safety_rule_engine_uncertainty'] : [];
    const reasoningSteps = buildReasoningSteps({
      outcome,
      redFlagTriggered: true,
      redFlagResult,
      pharmacyEligible: false,
      finalReason: flagMessage,
      governanceUncertainty,
    });
    const referralRecommendation = buildReferralRecommendation(outcome);
    return {
      outcome,
      outcomeLabel: decision.label,
      outcomeColour: OUTCOME_COLOURS[outcome],
      outcomeReason: flagMessage,
      explanation: buildDecisionExplanation({
        decision: outcome,
        reason: flagMessage,
        source: 'red_flag_engine',
      }),
      decision,
      reasoning: {
        steps: reasoningSteps,
        clinicalBasis: redFlagResult.flags.map((flag) => `${flag.code}: ${flag.description || 'red flag matched'}`),
        engine: {
          source: 'red_flag_engine',
          ruleIdsMatched: redFlagResult.flags.map((flag) => flag.code).filter(Boolean),
          governanceUncertainty,
        },
      },
      scoreBreakdown: [],
      referralRecommendation,
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
      patientExplanation,
      comorbidityModifiersApplied: [],
      governanceUncertainty,
    };
  }

  // Step 2: Pharmacy eligibility check
  const baseElig = checkPharmacyEligibility(pathwayCode, answers, patient);
  const comorb = evaluateComorbidityModifiers(pathwayCode, answers, patient);

  let pharmacyEligible = baseElig.eligible;
  let eligibilityReason = baseElig.reason;

  if (baseElig.eligible && comorb.blockPharmacy) {
    pharmacyEligible = false;
    eligibilityReason = comorb.blockReasons.join(' ') || baseElig.reason;
  }

  // Step 3: Outcome rule evaluation
  const ageForRules = Number.isFinite(Number(patient.age)) ? Number(patient.age) : null;
  const context = {
    ...answers,
    pharmacyEligible,
    redFlagTriggered: false,
    age: ageForRules,
    gender: patient.gender || null,
  };

  const scoringResult = applyPathwayScoring({ pathway, context, patient });
  const contextWithScores = scoringResult.context;

  const {
    outcome: resolvedOutcome,
    reason: outcomeReason,
    engineUncertainty: outcomeEngineUncertainty,
    matchedRule,
  } = evaluateOutcomeRules(pathway.outcomeRules || [], contextWithScores, patient, pathway);

  const governanceUncertainty = [
    ...(baseElig.governanceUncertainty || []),
    ...(scoringResult.governanceUncertainty || []),
  ];
  if (outcomeEngineUncertainty) {
    governanceUncertainty.push('outcome_rule_engine_uncertainty');
  }
  if (comorb.applied.some((a) => String(a.id).endsWith('_eval_failed'))) {
    governanceUncertainty.push('comorbidity_rule_engine_uncertainty');
  }

  let outcome = resolvedOutcome;
  let finalReason = outcomeReason || eligibilityReason || '';

  if (governanceUncertainty.length > 0 && (outcome === 'self_care' || outcome === 'pharmacy')) {
    outcome = 'gp';
    pharmacyEligible = false;
    finalReason = `${finalReason} A safer default applies: where any automated check is incomplete or uncertain, the system does not finalise self-care or pharmacy supply without GP-level review (NHS clinical governance expectation).`.trim();
  }

  if (!finalReason || !String(finalReason).trim()) {
    finalReason = 'Outcome determined by rule-based triage after safety and eligibility evaluation.';
  }

  const patientExplanation = buildPatientExplanation({
    outcome,
    outcomeReason: finalReason,
    redFlagTriggered: false,
    comorbidityFragments: comorb.patientExplanationFragments,
    governanceUncertainty,
  });

  // Step 4: Generate consultation summary
  const summaryText = generateSummary({
    patient, pathway, symptoms, answers,
    redFlagResult, pharmacyEligible, outcome,
    outcomeReason: finalReason,
  });

  const decision = buildDecisionMeta(outcome);
  const reasoningSteps = buildReasoningSteps({
    outcome,
    redFlagTriggered: false,
    redFlagResult,
    pharmacyEligible,
    finalReason,
    governanceUncertainty,
  });
  const referralRecommendation = buildReferralRecommendation(outcome);
  const ruleIdsMatched = [];
  if (matchedRule && (matchedRule.id || matchedRule.code || matchedRule.priority)) {
    ruleIdsMatched.push(matchedRule.id || matchedRule.code || `priority_${matchedRule.priority}`);
  }

  return {
    outcome,
    outcomeLabel: decision.label,
    outcomeColour: OUTCOME_COLOURS[outcome] || 'grey',
    outcomeReason: finalReason,
    explanation: buildDecisionExplanation({
      decision: outcome,
      reason: finalReason,
      source: 'rule_engine',
    }),
    decision,
    reasoning: {
      steps: reasoningSteps,
      clinicalBasis: [finalReason],
      engine: {
        source: 'rule_engine',
        ruleIdsMatched,
        governanceUncertainty,
      },
    },
      scoreBreakdown: scoringResult.scoreBreakdown,
    referralRecommendation,
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
    patientExplanation,
    comorbidityModifiersApplied: comorb.applied,
    governanceUncertainty,
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
