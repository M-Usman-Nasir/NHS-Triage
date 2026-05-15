import { evaluateCondition } from "./conditionEvaluator";
import { getPathwayBundle } from "./pathwayBundleLoader";
import type { PathwayBundle, QuestionGraph, QuestionGraphNode } from "./pathwayTypes";
import type { PathwayQuestion } from "./pathwayQuestions";
import { pathwayClinicalQuestionsForPatient } from "./pathwayQuestions";
import { hasCoreDurationAnswer, shouldSkipDurationQuestion } from "./consultationAnswerMaps";
import { CONSULTATION } from "./patientCopy";

const PREGNANCY_QUESTION_ID_BY_PATHWAY: Record<string, string> = {
  uti: "q7",
  impetigo: "q8",
  shingles: "q8",
};

export function getEffectiveGraph(pathway: PathwayBundle): { startId: string | null; nodes: QuestionGraph["nodes"] } {
  if (pathway.questionGraph?.startId && pathway.questionGraph.nodes) {
    return {
      startId: pathway.questionGraph.startId,
      nodes: pathway.questionGraph.nodes,
    };
  }
  const ids = pathway.questions.map((q) => q.id);
  const nodes: QuestionGraph["nodes"] = {};
  for (let i = 0; i < ids.length; i += 1) {
    nodes[ids[i]] = { next: ids[i + 1] ?? null };
  }
  return { startId: ids[0] ?? null, nodes };
}

function advancePastSkippedPregnancy(
  pathwayCode: string,
  nextId: string | null,
  nodes: QuestionGraph["nodes"],
  patient: { gender?: string },
): string | null {
  const skipId = PREGNANCY_QUESTION_ID_BY_PATHWAY[pathwayCode];
  if (!skipId || patient.gender !== "Male" || !nextId) return nextId;

  let cur: string | null = nextId;
  let guard = 0;
  while (cur === skipId && guard < 32) {
    guard += 1;
    const node: QuestionGraphNode | undefined = nodes[cur];
    if (!node) return null;
    let after: string | null = null;
    if (Array.isArray(node.branches) && node.branches.length > 0) {
      const fallback: { condition: string | boolean; next: string | null } | undefined = node.branches.find(
        (br) => br.condition === "true" || br.condition === true,
      );
      after = fallback?.next === undefined ? null : (fallback.next ?? null);
    } else if (Object.prototype.hasOwnProperty.call(node, "next")) {
      after = node.next ?? null;
    }
    cur = after;
  }
  return cur;
}

function shouldSkipQuestion(
  pathway: PathwayBundle,
  questionId: string,
  answers: Record<string, unknown>,
): boolean {
  if (answers[`_skip_${questionId}`] === true) {
    return true;
  }
  if (questionId === "q1" && shouldSkipDurationQuestion(answers)) {
    return true;
  }
  const q = pathway.questions.find((x) => x.id === questionId);
  if (q?.displayWhen && typeof q.displayWhen === "string") {
    return !evaluateCondition(q.displayWhen, answers, {}, pathway);
  }
  return false;
}

/** Caption when the first clinical question is not the pathway default start (skipped items). */
export function getClinicalSkipCaption(
  pathwayCode: string,
  firstQuestionId: string | null,
  answers: Record<string, unknown>,
): string | null {
  if (!firstQuestionId) return null;
  if (firstQuestionId !== "q1" && shouldSkipDurationQuestion(answers)) {
    return CONSULTATION.skipDurationHint;
  }
  const bundle = getPathwayBundle(pathwayCode);
  if (!bundle) return null;
  if (answers[`_skip_${firstQuestionId}`] === true) {
    return CONSULTATION.skipConditionHint;
  }
  return null;
}

function advancePastSkippedQuestions(
  pathway: PathwayBundle,
  pathwayCode: string,
  nextId: string | null,
  nodes: QuestionGraph["nodes"],
  answers: Record<string, unknown>,
  patient: { gender?: string; age?: number },
): string | null {
  let cur = advancePastSkippedPregnancy(pathwayCode, nextId, nodes, patient);
  let guard = 0;
  while (cur && shouldSkipQuestion(pathway, cur, answers) && guard < 32) {
    guard += 1;
    const node = nodes[cur];
    if (!node) return null;
    const resolved = resolveNextFromNode(pathway, cur, node, answers, patient);
    cur = resolved.nextId;
    if (resolved.isComplete) return null;
  }
  return cur;
}

function resolveNextFromNode(
  pathway: PathwayBundle,
  currentId: string,
  node: QuestionGraph["nodes"][string],
  answers: Record<string, unknown>,
  patient: { gender?: string; age?: number },
): { nextId: string | null; isComplete: boolean } {
  let nextId: string | null = null;

  if (Array.isArray(node.branches) && node.branches.length > 0) {
    for (const br of node.branches) {
      if (br.condition != null && evaluateCondition(br.condition, answers, patient, pathway)) {
        nextId = br.next === undefined ? null : br.next;
        break;
      }
    }
  } else if (Object.prototype.hasOwnProperty.call(node, "next")) {
    nextId = node.next ?? null;
  }

  if (nextId === null || nextId === undefined) {
    return { nextId: null, isComplete: true };
  }
  return { nextId, isComplete: false };
}

export function resolveNextQuestionId(
  pathway: PathwayBundle,
  currentId: string | null,
  answers: Record<string, unknown>,
  patient: { gender?: string; age?: number } = {},
): { nextId: string | null; isComplete: boolean } {
  const pathwayCode = pathway.pathway;
  const { startId, nodes } = getEffectiveGraph(pathway);

  if (!startId || Object.keys(nodes).length === 0) {
    return { nextId: null, isComplete: true };
  }

  if (currentId == null) {
    const first = advancePastSkippedQuestions(pathway, pathwayCode, startId, nodes, answers, patient);
    if (first == null) return { nextId: null, isComplete: true };
    return { nextId: first, isComplete: false };
  }

  const node = nodes[currentId];
  if (!node) return { nextId: null, isComplete: true };

  const { nextId: rawNext, isComplete } = resolveNextFromNode(pathway, currentId, node, answers, patient);
  if (isComplete) return { nextId: null, isComplete: true };

  const nextId = advancePastSkippedQuestions(pathway, pathwayCode, rawNext, nodes, answers, patient);
  if (nextId == null) return { nextId: null, isComplete: true };
  return { nextId, isComplete: false };
}

export function estimateMaxLinearSteps(pathway: PathwayBundle, patient: { gender?: string } = {}): number {
  const code = pathway.pathway;
  let n = Math.max(pathway.questions.length, 1);
  if (patient.gender === "Male" && PREGNANCY_QUESTION_ID_BY_PATHWAY[code]) {
    n = Math.max(n - 1, 1);
  }
  return n;
}

export function getNextQuestionState(
  pathwayCode: string,
  currentId: string | null,
  answers: Record<string, unknown>,
  patient: { gender?: string; age?: number } = {},
): {
  nextQuestionId: string | null;
  isComplete: boolean;
  nextQuestion: PathwayQuestion | null;
  progressMax: number;
  questions: PathwayQuestion[];
} {
  const bundle = getPathwayBundle(pathwayCode);
  if (!bundle) {
    return { nextQuestionId: null, isComplete: true, nextQuestion: null, progressMax: 1, questions: [] };
  }

  const gender = patient.gender ?? "";
  const clinicalList = pathwayClinicalQuestionsForPatient(pathwayCode, bundle.questions, gender);
  const byId = Object.fromEntries(clinicalList.map((q) => [q.id, q]));

  const { nextId, isComplete } = resolveNextQuestionId(bundle, currentId, answers, patient);

  return {
    nextQuestionId: nextId,
    isComplete,
    nextQuestion: nextId ? byId[nextId] ?? null : null,
    progressMax: estimateMaxLinearSteps(bundle, patient),
    questions: clinicalList,
  };
}

export function getDefinitionsForPathway(
  pathwayCode: string,
  gender: string,
  answers: Record<string, unknown> = {},
): {
  pathwayCode: string;
  label: string;
  questions: PathwayQuestion[];
  firstQuestionId: string | null;
  progressMax: number;
} | null {
  const bundle = getPathwayBundle(pathwayCode);
  if (!bundle) return null;

  const questions = pathwayClinicalQuestionsForPatient(pathwayCode, bundle.questions, gender);
  const patient = { gender };
  const { nextId } = resolveNextQuestionId(bundle, null, answers, patient);

  return {
    pathwayCode,
    label: bundle.label,
    questions,
    firstQuestionId: nextId,
    progressMax: estimateMaxLinearSteps(bundle, patient),
  };
}

export function applyChecklistAnswersToClinical(
  pathwayCode: string,
  answers: Record<string, unknown>,
  selectedIds: string[],
  noneSelected: boolean,
): Record<string, unknown> {
  const bundle = getPathwayBundle(pathwayCode);
  if (!bundle || noneSelected) {
    return { ...answers, _rf_none: true };
  }

  const merged: Record<string, unknown> = { ...answers, _rf_none: false };
  for (const item of bundle.redFlagChecklist) {
    if (!selectedIds.includes(item.id) || !item.linkedQuestionId) continue;
    merged[item.linkedQuestionId] = true;
    merged[`_skip_${item.linkedQuestionId}`] = true;
  }
  return merged;
}

export { hasCoreDurationAnswer };
