/**
 * questionGraph.js
 * Aegis Health AI — Server-driven clinical question flow
 *
 * Resolves the next question from pathway.questionGraph (or a linear fallback
 * derived from pathway.questions). Used by POST /api/consultation/question/next.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { evaluateCondition } = require('./redFlagDetector');

/** Question ids that ask about pregnancy; not shown when patient reports Male (simplified gender capture). */
const PREGNANCY_QUESTION_ID_BY_PATHWAY = {
  uti: 'q5',
  impetigo: 'q8',
  shingles: 'q8',
};

function loadPathway(pathwayCode) {
  const filePath = path.join(__dirname, '../data/pathways', `${pathwayCode}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Pathway not found: ${pathwayCode}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * @param {object} pathway
 * @returns {{ startId: string|null, nodes: Record<string, object> }}
 */
function getEffectiveGraph(pathway) {
  if (pathway.questionGraph && pathway.questionGraph.startId && pathway.questionGraph.nodes) {
    return {
      startId: pathway.questionGraph.startId,
      nodes: pathway.questionGraph.nodes,
    };
  }
  const ids = (pathway.questions || []).map((q) => q.id);
  const nodes = {};
  for (let i = 0; i < ids.length; i += 1) {
    nodes[ids[i]] = { next: ids[i + 1] || null };
  }
  return { startId: ids[0] || null, nodes };
}

/**
 * When the next step is a pregnancy question and the patient is Male, follow that node's outgoing
 * edge without collecting an answer (clinical rules treat pregnancy as not applicable).
 * @param {object} pathway
 * @param {string} pathwayCode
 * @param {string|null} nextId
 * @param {Record<string, object>} nodes
 * @param {object} patient
 * @returns {string|null}
 */
function advancePastSkippedPregnancy(pathway, pathwayCode, nextId, nodes, patient) {
  const skipId = PREGNANCY_QUESTION_ID_BY_PATHWAY[pathwayCode];
  if (!skipId || patient.gender !== 'Male' || !nextId) {
    return nextId;
  }
  let cur = nextId;
  let guard = 0;
  while (cur === skipId && guard < 32) {
    guard += 1;
    const node = nodes[cur];
    if (!node) {
      return null;
    }
    let after = null;
    if (Array.isArray(node.branches) && node.branches.length > 0) {
      const fallback = node.branches.find((br) => br && (br.condition === 'true' || br.condition === true));
      if (fallback) {
        after = fallback.next === undefined ? null : fallback.next;
      }
    } else if (Object.prototype.hasOwnProperty.call(node, 'next')) {
      after = node.next;
    }
    cur = after;
  }
  return cur;
}

/**
 * @param {object} pathway
 * @param {string|null} currentId  null = before first question
 * @param {object} answers
 * @param {object} patient
 * @returns {{ nextId: string|null, isComplete: boolean }}
 */
function resolveNextQuestionId(pathway, currentId, answers, patient = {}) {
  const pathwayCode = pathway.pathway || pathway.code || '';
  const { startId, nodes } = getEffectiveGraph(pathway);

  if (!startId || !nodes || Object.keys(nodes).length === 0) {
    return { nextId: null, isComplete: true };
  }

  if (currentId == null) {
    const first = advancePastSkippedPregnancy(pathway, pathwayCode, startId, nodes, patient);
    if (first == null) {
      return { nextId: null, isComplete: true };
    }
    return { nextId: first, isComplete: false };
  }

  const node = nodes[currentId];
  if (!node) {
    return { nextId: null, isComplete: true };
  }

  let nextId = null;

  if (Array.isArray(node.branches) && node.branches.length > 0) {
    for (const br of node.branches) {
      if (br && br.condition != null && evaluateCondition(br.condition, answers, patient, pathway)) {
        nextId = br.next === undefined ? null : br.next;
        break;
      }
    }
  } else if (Object.prototype.hasOwnProperty.call(node, 'next')) {
    nextId = node.next;
  }

  if (nextId === null || nextId === undefined) {
    return { nextId: null, isComplete: true };
  }

  nextId = advancePastSkippedPregnancy(pathway, pathwayCode, nextId, nodes, patient);
  if (nextId == null) {
    return { nextId: null, isComplete: true };
  }

  return { nextId, isComplete: false };
}

/** Upper bound for progress UI (branching may finish earlier). */
function estimateMaxLinearSteps(pathway, patient = {}) {
  const code = pathway.pathway || pathway.code || '';
  const n = Math.max((pathway.questions || []).length, 1);
  if (patient.gender === 'Male' && PREGNANCY_QUESTION_ID_BY_PATHWAY[code]) {
    return Math.max(n - 1, 1);
  }
  return n;
}

/**
 * @param {string} pathwayCode
 * @param {string|null} currentId
 * @param {object} answers
 * @param {object} patient
 */
function getNextQuestionState(pathwayCode, currentId, answers, patient = {}) {
  const pathway = loadPathway(pathwayCode);
  const { nextId, isComplete } = resolveNextQuestionId(pathway, currentId, answers, patient);
  const maxSteps = estimateMaxLinearSteps(pathway, patient);
  const byId = Object.fromEntries((pathway.questions || []).map((q) => [q.id, q]));

  return {
    pathwayCode,
    nextQuestionId: nextId,
    isComplete,
    nextQuestion: nextId ? byId[nextId] || null : null,
    progressMax: maxSteps,
    questions: pathway.questions || [],
  };
}

/**
 * Validate that submitted answers cover every required step on the resolved path.
 * @returns {{ ok: true } | { ok: false, missing: string }}
 */
function validateClinicalAnswersComplete(pathwayCode, answers, patient = {}) {
  const pathway = loadPathway(pathwayCode);
  const byId = Object.fromEntries((pathway.questions || []).map((q) => [q.id, q]));
  let curId = null;
  let guard = 0;
  const maxSteps = 64;

  while (guard < maxSteps) {
    guard += 1;
    const { nextId, isComplete } = resolveNextQuestionId(pathway, curId, answers, patient);
    if (isComplete) {
      return { ok: true };
    }
    if (nextId == null) {
      return { ok: true };
    }
    const q = byId[nextId];
    if (q && q.required) {
      const v = answers[nextId];
      if (v === undefined || v === null) {
        return { ok: false, missing: nextId };
      }
      if (typeof v === 'string' && v.trim() === '' && q.type !== 'boolean') {
        return { ok: false, missing: nextId };
      }
      if (Array.isArray(v) && v.length === 0) {
        return { ok: false, missing: nextId };
      }
    }
    curId = nextId;
  }
  return { ok: false, missing: 'unknown', error: 'Question flow validation exceeded maximum steps.' };
}

module.exports = {
  loadPathway,
  getEffectiveGraph,
  resolveNextQuestionId,
  getNextQuestionState,
  estimateMaxLinearSteps,
  validateClinicalAnswersComplete,
};
