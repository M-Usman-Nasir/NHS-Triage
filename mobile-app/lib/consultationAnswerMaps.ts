/**
 * Maps core triage (_ctx_*) answers onto pathway clinical answers where they overlap.
 */

const DURATION_TO_Q1: Record<string, Record<string, string>> = {
  uti: {
    "Less than 24 hours": "Less than 24 hours",
    "1-3 days": "1–3 days",
    "4-7 days": "4–7 days",
    "More than 7 days": "More than 7 days",
  },
  sore_throat: {
    "Less than 24 hours": "Less than 3 days",
    "1-3 days": "Less than 3 days",
    "4-7 days": "3–7 days",
    "More than 7 days": "More than 7 days",
  },
  sinusitis: {
    "Less than 24 hours": "Less than 10 days",
    "1-3 days": "Less than 10 days",
    "4-7 days": "Less than 10 days",
    "More than 7 days": "10 days or more",
  },
  otitis_media: {
    "Less than 24 hours": "Less than 3 days",
    "1-3 days": "Less than 3 days",
    "4-7 days": "3–7 days",
    "More than 7 days": "More than 7 days",
  },
  insect_bites: {
    "Less than 24 hours": "Less than 48 hours",
    "1-3 days": "Less than 48 hours",
    "4-7 days": "3–7 days",
    "More than 7 days": "More than 7 days",
  },
  impetigo: {
    "Less than 24 hours": "Less than 3 days",
    "1-3 days": "Less than 3 days",
    "4-7 days": "3–7 days",
    "More than 7 days": "More than 7 days",
  },
  shingles: {
    "Less than 24 hours": "Today (within 24 hours)",
    "1-3 days": "1–2 days ago",
    "4-7 days": "4–7 days ago",
    "More than 7 days": "More than 7 days ago",
  },
};

export function hasCoreDurationAnswer(answers: Record<string, unknown>): boolean {
  const d = answers._ctx_duration;
  return typeof d === "string" && d.length > 0 && d !== "Prefer not to say";
}

export function shouldSkipDurationQuestion(answers: Record<string, unknown>): boolean {
  return hasCoreDurationAnswer(answers);
}

/** Prefill pathway q1 from _ctx_duration when the pathway's first question is duration-like. */
export function mergeCoreDurationIntoAnswers(
  pathwayCode: string,
  answers: Record<string, unknown>,
): Record<string, unknown> {
  const ctx = answers._ctx_duration;
  if (typeof ctx !== "string" || ctx === "Prefer not to say") return answers;

  const map = DURATION_TO_Q1[pathwayCode];
  if (!map || answers.q1 !== undefined) return answers;

  const mapped = map[ctx];
  if (!mapped) return answers;

  return { ...answers, q1: mapped };
}
