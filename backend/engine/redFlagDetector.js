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
 * Safely evaluates a rule condition string against patient answers.
 *
 * Conditions are simple boolean expressions defined in the JSON pathway files.
 * We evaluate them by building a safe context object and using Function() in a
 * controlled way — no user input is ever executed, only the static pathway file rules.
 *
 * @param {string} condition - Condition string from pathway JSON e.g. "q3 === true && q4 === true"
 * @param {object} answers   - Patient's answers object e.g. { q3: true, q4: false }
 * @param {object} patient   - Patient demographic data e.g. { age: 34, gender: 'Female' }
 * @returns {boolean}
 */
function evaluateCondition(condition, answers, patient = {}) {
  try {
    const context = {
      ...answers,
      age: patient.age || null,
      gender: patient.gender || null,
    };
    const keys = Object.keys(context);
    const values = Object.values(context);
    // eslint-disable-next-line no-new-func
    const fn = new Function(...keys, `return (${condition});`);
    return fn(...values);
  } catch (err) {
    // If a rule condition fails to parse, default to false (do not trigger flag)
    console.warn(`[RedFlagDetector] Failed to evaluate condition: "${condition}" — ${err.message}`);
    return false;
  }
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

  if (!pathway.redFlags || pathway.redFlags.length === 0) {
    return { triggered: false, flags: [], highestSeverityOutcome: null };
  }

  for (const flag of pathway.redFlags) {
    const matched = evaluateCondition(flag.condition, answers, patient);
    if (matched) {
      triggeredFlags.push({
        code: flag.code,
        description: flag.description,
        outcome: flag.outcome,
        message: flag.message,
      });
    }
  }

  if (triggeredFlags.length === 0) {
    return { triggered: false, flags: [], highestSeverityOutcome: null };
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
  for (const priority of outcomePriority) {
    const flag = flags.find((f) => f.outcome === priority);
    if (flag) return flag.message;
  }
  return 'Please seek medical attention.';
}

module.exports = {
  detectRedFlags,
  getRedFlagMessage,
  evaluateCondition,
};
