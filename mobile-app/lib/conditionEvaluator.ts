/**
 * Safe evaluation of pathway rule conditions (mirrors backend redFlagDetector).
 */

import type { PathwayBundle } from "./pathwayTypes";

function mergePathwayAnswerDefaults(
  pathway: PathwayBundle,
  answers: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...answers };
  for (const q of pathway.questions || []) {
    if (!Object.prototype.hasOwnProperty.call(out, q.id)) {
      out[q.id] = undefined;
    }
  }
  return out;
}

export function evaluateCondition(
  condition: string | boolean | null | undefined,
  answers: Record<string, unknown>,
  patient: { age?: number; gender?: string } = {},
  pathway?: PathwayBundle | null,
): boolean {
  if (condition === true) return true;
  if (condition === false || condition == null) return false;
  if (typeof condition !== "string" || condition.trim() === "") return false;

  try {
    let merged = answers;
    if (pathway) {
      merged = mergePathwayAnswerDefaults(pathway, answers);
    }
    const ageVal =
      patient.age === undefined || patient.age === null || Number.isNaN(Number(patient.age))
        ? null
        : Number(patient.age);
    const context: Record<string, unknown> = {
      ...merged,
      age: ageVal,
      gender: patient.gender ?? null,
    };
    const keys = Object.keys(context);
    const values = Object.values(context);
    const fn = new Function(...keys, `return (${condition});`);
    return Boolean(fn(...values));
  } catch {
    return false;
  }
}
