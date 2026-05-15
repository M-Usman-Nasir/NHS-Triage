import { labelForPatientSelectionCode, PATIENT_PATHWAYS } from "./patientPathways";
import {
  type ConsultationOutcome,
  outcomePresentation,
} from "./outcomePresentation";

const DURATION_PHRASES: Record<string, string> = {
  "Less than 24 hours": "symptoms for less than 24 hours",
  "1-3 days": "symptoms for 1–3 days",
  "4-7 days": "symptoms for 4–7 days",
  "More than 7 days": "symptoms for more than 7 days",
};

const IMPACT_PHRASES: Record<string, string> = {
  "Little — I can do most things": "limited impact on daily activities",
  "Moderate — some activities are difficult": "moderate impact on daily activities",
  "A lot — I need to rest or stay home": "significant impact on daily activities",
};

export type OutcomeSummaryInput = {
  pathwayCodes: string[];
  answers?: Record<string, unknown>;
  outcome: ConsultationOutcome;
  api?: {
    headline?: string;
    outcomeReason?: string;
    reasoningSteps?: string[];
    referralInstruction?: string;
    referralActions?: string[];
    redFlagTriggered?: boolean;
  };
};

export type OutcomeSummary = {
  headline: string;
  reasoningLine: string;
  actionLine: string;
  showFindPharmacy: boolean;
};

function pathwayLabels(codes: string[]): string[] {
  return codes.map((code) => {
    const meta = PATIENT_PATHWAYS.find((p) => p.code === code);
    return meta?.fullLabel ?? labelForPatientSelectionCode(code);
  });
}

function durationPhrase(answers: Record<string, unknown> | undefined): string | null {
  const raw = answers?._ctx_duration;
  if (typeof raw !== "string" || !raw || raw === "Prefer not to say") return null;
  return DURATION_PHRASES[raw] ?? `symptoms for ${raw.toLowerCase()}`;
}

function redFlagPhrase(
  answers: Record<string, unknown> | undefined,
  redFlagTriggered?: boolean,
): string {
  if (answers?._rf_none === true) return "no red flags";
  if (redFlagTriggered) return "red flags reported";
  return "no red flags";
}

function buildReasoningSegments(
  pathwayCodes: string[],
  answers: Record<string, unknown> | undefined,
  redFlagTriggered?: boolean,
): string[] {
  const segments: string[] = [];
  const labels = pathwayLabels(pathwayCodes);
  if (labels.length === 1) {
    segments.push(labels[0].toLowerCase());
  } else if (labels.length > 1) {
    segments.push(labels.map((l) => l.toLowerCase()).join(" and "));
  }
  segments.push(redFlagPhrase(answers, redFlagTriggered));
  const duration = durationPhrase(answers);
  if (duration) segments.push(duration);
  const impactRaw = answers?._ctx_impact;
  if (typeof impactRaw === "string" && impactRaw !== "Prefer not to say") {
    const impact = IMPACT_PHRASES[impactRaw] ?? impactRaw.toLowerCase();
    segments.push(impact);
  }
  return segments.filter(Boolean);
}

export function buildOutcomeSummary(input: OutcomeSummaryInput): OutcomeSummary {
  const pres = outcomePresentation(input.outcome);
  const headline = input.api?.headline ?? pres.headline;

  let reasoningBody: string;
  if (input.api?.reasoningSteps && input.api.reasoningSteps.length > 0) {
    reasoningBody = input.api.reasoningSteps.join(" · ");
  } else {
    const segments = buildReasoningSegments(
      input.pathwayCodes,
      input.answers,
      input.api?.redFlagTriggered,
    );
    if (segments.length > 0) {
      reasoningBody = segments.join(" · ");
    } else if (input.api?.outcomeReason) {
      reasoningBody = input.api.outcomeReason;
    } else {
      reasoningBody = "your answers were reviewed using clinical pathway rules";
    }
  }

  const actionLine =
    input.api?.referralActions?.[0] ??
    input.api?.referralInstruction ??
    pres.actionLine;

  return {
    headline,
    reasoningLine: reasoningBody,
    actionLine,
    showFindPharmacy: pres.showFindPharmacy,
  };
}

/** Build reasoning step array for API/mock payloads from consultation context. */
export function buildReasoningStepsForApi(
  pathwayCodes: string[],
  answers: Record<string, unknown> | undefined,
  redFlagTriggered: boolean,
  ruleReason?: string,
): string[] {
  const segments = buildReasoningSegments(pathwayCodes, answers, redFlagTriggered);
  if (ruleReason && !segments.includes(ruleReason)) {
    return [...segments, ruleReason];
  }
  return segments.length > 0 ? segments : ruleReason ? [ruleReason] : ["clinical assessment applied"];
}
