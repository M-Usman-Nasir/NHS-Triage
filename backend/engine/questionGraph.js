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
 * @param {object} pathway
 * @param {string|null} currentId  null = before first question
 * @param {object} answers
 * @param {object} patient
 * @returns {{ nextId: string|null, isComplete: boolean }}
 */
function resolveNextQuestionId(pathway, currentId, answers, patient = {}) {
  const { startId, nodes } = getEffectiveGraph(pathway);

  if (!startId || !nodes || Object.keys(nodes).length === 0) {
    return { nextId: null, isComplete: true };
  }

  if (currentId == null) {
    return { nextId: startId, isComplete: false };
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

  return { nextId, isComplete: false };
}

/** Upper bound for progress UI (branching may finish earlier). */
function estimateMaxLinearSteps(pathway) {
  return Math.max((pathway.questions || []).length, 1);
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
  const maxSteps = estimateMaxLinearSteps(pathway);
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
