/**
 * redFlagDetector.js
 * Aegis Health AI — Red Flag Detection System
 *
 * Purpose:
 *   Evaluates patient answers against a clinical pathway's red-flag rules.
 *   This runs FIRST, before any other triage logic.
 *   If a red flag is found, the patient is immediately escalated — no further
 *   rules are evaluated.
 *
 * Safety principle:
 *   This system is SAFETY-FIRST. In ambiguous cases, it escalates rather than
 *   under-triaging. False positives (unnecessary escalations) are preferable to
 *   false negatives (missed emergencies).
 *
 * Usage:
 *   const { triggered, flags, outcome } = detectRedFlags(pathway, answers, patient);
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Load a clinical pathway JSON file by code.
 * @param {string} pathwayCode - e.g. 'uti', 'sore_throat'
 * @returns {object} Pathway definition object
 */
function loadPathway(pathwayCode) {
  const filePath = path.join(__dirname, '../data/pathways', `${pathwayCode}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Pathway not found: ${pathwayCode}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Ensures every pathway question id exists on the context so rule expressions
 * never hit ReferenceError when a branch skipped questions.
 *
 * @param {object} pathway
 * @param {object} answersOrContext
 * @returns {object}
 */
function mergePathwayAnswerDefaults(pathway, answersOrContext) {
  const out = { ...(answersOrContext || {}) };
  for (const q of pathway.questions || []) {
    if (!Object.prototype.hasOwnProperty.call(out, q.id)) {
      out[q.id] = undefined;
    }
  }
  return out;
}

/**
 * Safely evaluates a rule condition string against patient answers.
 *
 * Conditions are simple boolean expressions defined in the JSON pathway files.
 * We evaluate them by building a safe context object and using Function() in a
 * controlled way — no user input is ever executed, only the static pathway file rules.
 *
 * @param {string} condition - Condition string from pathway JSON e.g. "q3 === true && q4 === true"
 * @param {object} answers   - Patient's answers object e.g. { q3: true, q4: false }
 * @param {object} patient   - Patient demographic data e.g. { age: 34, gender: 'Female' }
 * @param {object|null} pathway - When set, binds all pathway question ids (undefined if unanswered)
 * @returns {boolean}
 */
function tryEvaluateCondition(condition, answers, patient = {}, pathway = null) {
  if (condition == null || typeof condition !== 'string' || condition.trim() === '') {
    return { ok: true, value: false };
  }
  try {
    let merged = answers;
    if (pathway) {
      merged = mergePathwayAnswerDefaults(pathway, answers);
    }
    const ageVal = patient.age === undefined || patient.age === null || patient.age === '' ? null : Number(patient.age);
    const context = {
      ...merged,
      age: Number.isFinite(ageVal) ? ageVal : null,
      gender: patient.gender ?? null,
    };
    const keys = Object.keys(context);
    const values = Object.values(context);
    // eslint-disable-next-line no-new-func
    const fn = new Function(...keys, `return (${condition});`);
    return { ok: true, value: fn(...values) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * @returns {boolean} false when evaluation fails (non-safety callers); see tryEvaluateCondition for safety paths.
 */
function evaluateCondition(condition, answers, patient = {}, pathway = null) {
  const r = tryEvaluateCondition(condition, answers, patient, pathway);
  if (!r.ok) {
    console.warn(`[RedFlagDetector] Failed to evaluate condition: "${condition}" — ${r.error}`);
    return false;
  }
  return r.value;
}

/**
 * Run red-flag detection for a given pathway and patient answers.
 *
 * @param {string} pathwayCode  - Clinical pathway identifier e.g. 'uti'
 * @param {object} answers      - Patient's submitted answers { q1: value, q2: value, ... }
 * @param {object} patient      - Patient demographics { age, gender }
 * @returns {object} Result:
 *   {
 *     triggered: boolean,      // true if any red flag matched
 *     flags: Array,            // list of triggered flag objects
 *     highestSeverityOutcome: string  // 'emergency_999' | 'urgent_care' | 'gp' | null
 *   }
 */
function detectRedFlags(pathwayCode, answers, patient = {}) {
  const pathway = loadPathway(pathwayCode);
  const triggeredFlags = [];

  const emergencyOverrides = pathway.emergencyOverrides || [];
  const redFlags = pathway.redFlags || [];
  const safetyRules = [
    ...emergencyOverrides.map((f) => ({ ...f, tier: 'emergency_override' })),
    ...redFlags.map((f) => ({ ...f, tier: 'red_flag' })),
  ];

  if (safetyRules.length === 0) {
    return { triggered: false, flags: [], highestSeverityOutcome: null, governanceEvalFailure: false };
  }

  let governanceEvalFailure = false;
  for (const flag of safetyRules) {
    const ev = tryEvaluateCondition(flag.condition, answers, patient, pathway);
    if (!ev.ok) {
      governanceEvalFailure = true;
      console.warn(`[RedFlagDetector] Safety rule "${flag.code || 'unknown'}" not evaluable — applying governance default escalation.`);
      continue;
    }
    if (ev.value) {
      triggeredFlags.push({
        code: flag.code,
        description: flag.description,
        outcome: flag.outcome,
        message: flag.message,
        tier: flag.tier || 'red_flag',
      });
    }
  }

  if (governanceEvalFailure) {
    triggeredFlags.push({
      code: 'RF_GOVERNANCE_RULE_EVALUATION',
      description: 'At least one automated safety check could not be evaluated — conservative escalation applied',
      outcome: 'urgent_care',
      message:
        'We could not safely run every automated safety check on your answers. Please get same-day clinical advice (contact your GP practice for an urgent assessment, use NHS 111 online or by phone, or visit an urgent treatment centre).',
      tier: 'red_flag',
    });
  }

  if (triggeredFlags.length === 0) {
    return { triggered: false, flags: [], highestSeverityOutcome: null, governanceEvalFailure: false };
  }

  // Determine the most severe outcome from all triggered flags
  const outcomePriority = ['emergency_999', 'urgent_care', 'gp'];
  let highestSeverityOutcome = null;

  for (const priority of outcomePriority) {
    if (triggeredFlags.some((f) => f.outcome === priority)) {
      highestSeverityOutcome = priority;
      break;
    }
  }

  return {
    triggered: true,
    flags: triggeredFlags,
    highestSeverityOutcome,
    governanceEvalFailure: governanceEvalFailure || triggeredFlags.some((f) => f.code === 'RF_GOVERNANCE_RULE_EVALUATION'),
  };
}

/**
 * Get the patient-facing message for a triggered red flag.
 * Returns the message for the highest severity flag found.
 *
 * @param {Array} flags - Array of triggered flag objects
 * @returns {string} Patient message
 */
function getRedFlagMessage(flags) {
  const outcomePriority = ['emergency_999', 'urgent_care', 'gp'];
  const tierOrder = ['emergency_override', 'red_flag'];
  for (const priority of outcomePriority) {
    const inTier = flags.filter((f) => f.outcome === priority);
    for (const tier of tierOrder) {
      const flag = inTier.find((f) => f.tier === tier);
      if (flag) return flag.message;
    }
    const fallback = inTier[0];
    if (fallback) return fallback.message;
  }
  return 'Please seek medical attention.';
}

module.exports = {
  detectRedFlags,
  getRedFlagMessage,
  evaluateCondition,
  tryEvaluateCondition,
  mergePathwayAnswerDefaults,
};
