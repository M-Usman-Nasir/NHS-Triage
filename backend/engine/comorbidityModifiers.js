/**
 * comorbidityModifiers.js
 * Care Path — Comorbidity / risk modifier layer
 *
 * Runs after base pharmacy eligibility rules. Can block pharmacy for
 * combinations not covered by a single eligibility row, and appends
 * lay-language fragments for the patient explanation.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { tryEvaluateCondition } = require('./redFlagDetector');

function loadPathway(pathwayCode) {
  const filePath = path.join(__dirname, '../data/pathways', `${pathwayCode}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Pathway not found: ${pathwayCode}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * @param {string} pathwayCode
 * @param {object} answers
 * @param {object} patient
 * @returns {{
 *   blockPharmacy: boolean,
 *   blockReasons: string[],
 *   patientExplanationFragments: string[],
 *   applied: Array<{ id: string, blockPharmacy: boolean, reason?: string, patientExplanationAppend?: string }>,
 * }}
 */
function evaluateComorbidityModifiers(pathwayCode, answers, patient = {}) {
  const pathway = loadPathway(pathwayCode);
  const list = pathway.comorbidityModifiers || [];
  const blockReasons = [];
  const patientExplanationFragments = [];
  const applied = [];
  let blockPharmacy = false;

  for (const m of list) {
    if (!m || m.condition == null) continue;
    const ev = tryEvaluateCondition(m.condition, answers, patient, pathway);
    if (!ev.ok) {
      applied.push({
        id: `${m.id || 'comorbidity_modifier'}_eval_failed`,
        blockPharmacy: true,
        reason: 'A comorbidity modifier could not be evaluated; pharmacy supply is not assumed safe.',
      });
      blockPharmacy = true;
      blockReasons.push('Comorbidity rule evaluation error — GP review recommended.');
      continue;
    }
    if (!ev.value) continue;
    const id = m.id || 'comorbidity_modifier';
    if (m.blockPharmacy) {
      blockPharmacy = true;
      blockReasons.push(m.reason || id);
    }
    if (m.patientExplanationAppend) {
      patientExplanationFragments.push(m.patientExplanationAppend);
    }
    applied.push({
      id,
      blockPharmacy: !!m.blockPharmacy,
      reason: m.reason,
      patientExplanationAppend: m.patientExplanationAppend,
    });
  }

  return { blockPharmacy, blockReasons, patientExplanationFragments, applied };
}

module.exports = { evaluateComorbidityModifiers };
