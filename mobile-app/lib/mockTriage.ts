/**
 * Offline triage — simplified mirror of backend decisionEngine for native mocks.
 */

import { evaluateCondition } from "./conditionEvaluator";
import { getPathwayBundle } from "./pathwayBundleLoader";
import { mergeCoreDurationIntoAnswers } from "./consultationAnswerMaps";
import { outcomePresentation, type ConsultationOutcome } from "./outcomePresentation";

const OUTCOME_LABELS: Record<string, string> = {
  self_care: "Self-Care Advice",
  pharmacy: "Pharmacy Referral",
  gp: "GP Appointment Recommended",
  urgent_care: "Urgent Care Required",
  emergency_999: "Call 999 — Emergency",
};

const OUTCOME_TITLES: Record<string, string> = {
  self_care: "Self-care recommended",
  pharmacy: "Pharmacy consultation recommended",
  gp: "GP appointment recommended",
  urgent_care: "Urgent care required",
  emergency_999: "Call 999 now",
};

const OUTCOME_COLOURS: Record<string, string> = {
  self_care: "green",
  pharmacy: "blue",
  gp: "yellow",
  urgent_care: "orange",
  emergency_999: "red",
};

const SEVERITY_ORDER = ["emergency_999", "urgent_care", "gp", "pharmacy", "self_care"];

function pickHighestOutcome(outcomes: string[]): string {
  for (const o of SEVERITY_ORDER) {
    if (outcomes.includes(o)) return o;
  }
  return "pharmacy";
}

export function runMockTriage(
  pathwayCode: string,
  rawAnswers: Record<string, unknown>,
  patient: { fullName: string; age: number; gender: string },
): {
  outcome: string;
  outcomeLabel: string;
  outcomeReason: string;
  outcomeColour: string;
  redFlagTriggered: boolean;
  redFlags: { code: string; message: string; outcome: string }[];
  pharmacyEligible: boolean;
  decision: { code: string; label: string; title: string };
  referralActions: string[];
  referralInstruction: string;
} {
  const bundle = getPathwayBundle(pathwayCode);
  if (!bundle) {
    return {
      outcome: "pharmacy",
      outcomeLabel: OUTCOME_LABELS.pharmacy,
      outcomeReason: "Unknown pathway — demo default.",
      outcomeColour: OUTCOME_COLOURS.pharmacy,
      redFlagTriggered: false,
      redFlags: [],
      pharmacyEligible: true,
      decision: { code: "pharmacy", label: OUTCOME_LABELS.pharmacy, title: OUTCOME_TITLES.pharmacy },
      referralActions: outcomePresentation("pharmacy").referralActions,
      referralInstruction: outcomePresentation("pharmacy").actionLine,
    };
  }

  const answers = mergeCoreDurationIntoAnswers(pathwayCode, rawAnswers);
  const triggered: { code: string; message: string; outcome: string }[] = [];

  for (const rule of [...(bundle.emergencyOverrides || []), ...(bundle.redFlags || [])]) {
    if (evaluateCondition(rule.condition, answers, patient, bundle)) {
      triggered.push({ code: rule.code, message: rule.message, outcome: rule.outcome });
    }
  }

  if (triggered.length > 0) {
    const outcome = pickHighestOutcome(triggered.map((t) => t.outcome));
    return {
      outcome,
      outcomeLabel: OUTCOME_LABELS[outcome] ?? outcome,
      outcomeReason: triggered[0].message,
      outcomeColour: OUTCOME_COLOURS[outcome] ?? "orange",
      redFlagTriggered: true,
      redFlags: triggered,
      pharmacyEligible: false,
      decision: {
        code: outcome,
        label: OUTCOME_LABELS[outcome] ?? outcome,
        title: OUTCOME_TITLES[outcome] ?? OUTCOME_LABELS[outcome] ?? outcome,
      },
      referralActions: outcomePresentation(outcome as ConsultationOutcome).referralActions,
      referralInstruction: outcomePresentation(outcome as ConsultationOutcome).actionLine,
    };
  }

  let pharmacyEligible = true;
  for (const rule of bundle.eligibilityRules || []) {
    if (evaluateCondition(rule.condition, answers, patient, bundle) && rule.eligible === false) {
      pharmacyEligible = false;
      break;
    }
  }

  const ctx: Record<string, unknown> = {
    ...answers,
    pharmacyEligible,
    redFlagTriggered: false,
    age: patient.age,
    gender: patient.gender,
  };

  const sorted = [...(bundle.outcomeRules || [])].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
  let outcome = "pharmacy";
  let reason = "Based on your answers.";

  for (const rule of sorted) {
    if (rule.outcome === "escalated_by_red_flag") continue;
    if (evaluateCondition(rule.condition, ctx, patient, bundle)) {
      outcome = rule.outcome;
      reason = rule.reason ?? reason;
      break;
    }
  }

  if (!pharmacyEligible && outcome === "pharmacy") {
    outcome = "gp";
    reason = "Pharmacy First may not be suitable — speak to your GP.";
  }

  const pres = outcomePresentation(outcome as ConsultationOutcome);
  return {
    outcome,
    outcomeLabel: OUTCOME_LABELS[outcome] ?? outcome,
    outcomeReason: reason,
    outcomeColour: OUTCOME_COLOURS[outcome] ?? "blue",
    redFlagTriggered: false,
    redFlags: [],
    pharmacyEligible,
    decision: {
      code: outcome,
      label: OUTCOME_LABELS[outcome] ?? outcome,
      title: OUTCOME_TITLES[outcome] ?? OUTCOME_LABELS[outcome] ?? outcome,
    },
    referralActions: pres.referralActions,
    referralInstruction: pres.actionLine,
  };
}
