/** Patient-facing copy — plain, trustworthy tone (no builder jargon). */

export const BRAND_NAME = "CarePath";

export const CONSULTATION = {
  demographicsIntro:
    "We ask for basic details to tailor safety checks and your summary. Your answers help us suggest appropriate next steps.",
  nameMinimisation: "Used only for your summary on this device — not shared with advertisers.",
  ageMinimisation: "Some safety rules depend on age; we do not need your date of birth for this demo.",
  genderMinimisation: "Helps match clinical questions (for example pregnancy-related checks) where relevant.",
  symptomsMinimisation: "Optional — only add detail if you want it included in your check record.",
  coreTriageIntro: "These questions help us understand how you are feeling today.",
  clinicalSafetyHint:
    "Please answer honestly. Some questions check for urgent symptoms that need immediate care.",
  clinicalProgressLabel: "Clinical questions",
  submitTitle: "Checking your answers…",
  submitBody: "We are reviewing your symptoms using NHS-style clinical checks.",
  offlinePathwayTitle: "Working offline",
  offlinePathwayBody:
    "We could not reach the server. Your answers stay on this device while we use the built-in checks.",
  submitErrorOffline:
    "We could not complete that step. Your answers stay on this device — try again, or go back and change an answer.",
  skipConditionHint: "Not needed — already covered from your safety check",
  skipDurationHint: "Not needed — you already told us how long symptoms have lasted",
  skipBasedOnAnswers: "Not needed based on your earlier answers",
} as const;

export const HOME = {
  emergencyLine: "Not for emergencies — call 999 if you need urgent help.",
  durationHint: "About 5 minutes",
} as const;
