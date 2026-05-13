// Keep in sync with frontend/lib/augmentConsultationAnswers.ts

/**
 * Adds derived answer fields expected by the clinical engine (see pathway JSON rules).
 */

const IMPETIGO_WIDESPREAD_OPTION = "Widespread across multiple areas";

export function augmentAnswersForPathway(
  pathwayCode: string,
  answers: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...answers };

  if (pathwayCode === "impetigo" && Array.isArray(out.q2)) {
    const selected = out.q2 as string[];
    let count = selected.length;
    if (selected.includes(IMPETIGO_WIDESPREAD_OPTION)) {
      count = Math.max(count, 2);
    }
    out.q2_areas_count = count;
  }

  return out;
}
