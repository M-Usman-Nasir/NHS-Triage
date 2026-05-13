// Keep in sync with frontend/lib/consultationPrefaceQuestions.ts

/**
 * Optional questions shown before pathway-specific items.
 * IDs must start with `_ctx_` — stripped from `answers` before POST; values are merged into `symptoms` for context only.
 */

import type { PathwayQuestion } from "./pathwayQuestions";

export const CONSULTATION_PREFACE_QUESTIONS: PathwayQuestion[] = [
  {
    id: "_ctx_duration",
    text: "How long have you had symptoms?",
    type: "select",
    options: ["Less than 24 hours", "1-3 days", "4-7 days", "More than 7 days", "Prefer not to say"],
    required: false,
  },
  {
    id: "_ctx_severity",
    text: "How severe are your symptoms right now?",
    type: "select",
    options: ["Mild", "Moderate", "Severe", "Very severe", "Prefer not to say"],
    required: false,
  },
  {
    id: "_ctx_impact",
    text: "How much are your symptoms affecting what you can do today?",
    type: "select",
    options: [
      "Little — I can do most things",
      "Moderate — some activities are difficult",
      "A lot — I need to rest or stay home",
      "Prefer not to say",
    ],
    required: false,
  },
  {
    id: "_ctx_first_episode",
    text: "Have you had this kind of problem before?",
    type: "select",
    options: ["First time", "Yes — similar before", "Not sure", "Prefer not to say"],
    required: false,
  },
  {
    id: "_ctx_prior_advice",
    text: "Have you already sought advice for these symptoms (pharmacist, NHS 111, or GP)?",
    type: "select",
    options: ["No, not yet", "Yes — pharmacist", "Yes — NHS 111 or GP", "Prefer not to say"],
    required: false,
  },
];

export function isContextQuestionId(id: string): boolean {
  return id.startsWith("_ctx_");
}

export function stripContextAnswers(answers: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(answers).filter(([k]) => !isContextQuestionId(k)));
}

const PREFACE_LABELS: Record<string, string> = {
  _ctx_duration: "Symptom duration",
  _ctx_severity: "Symptom severity",
  _ctx_impact: "Impact on day",
  _ctx_first_episode: "Previous episodes",
  _ctx_prior_advice: "Prior advice",
};

export function contextAnswersToSymptomHints(answers: Record<string, unknown>): string[] {
  const hints: string[] = [];
  for (const q of CONSULTATION_PREFACE_QUESTIONS) {
    const v = answers[q.id];
    if (v === undefined || v === null || v === "") continue;
    const s = String(v);
    if (s === "Prefer not to say") continue;
    const label = PREFACE_LABELS[q.id] || q.id;
    hints.push(`${label}: ${s}`);
  }
  return hints;
}
