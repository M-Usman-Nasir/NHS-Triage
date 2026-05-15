export type ConsultationOutcome =
  | "self_care"
  | "pharmacy"
  | "gp"
  | "urgent_care"
  | "emergency_999";

export type ActionVariant = "pharmacy" | "gp" | "emergency" | "plain";

const ACTION_LINES: Record<ConsultationOutcome, string> = {
  pharmacy: "Visit a pharmacy today",
  gp: "Contact your GP surgery for an appointment",
  urgent_care: "Seek same-day urgent care (NHS 111 can advise)",
  emergency_999: "Call 999 now",
  self_care: "Follow self-care advice and monitor your symptoms",
};

const REFERRAL_ACTIONS: Record<ConsultationOutcome, string[]> = {
  pharmacy: [
    "Visit your nearest pharmacy today.",
    "Speak to the pharmacist and describe your symptoms.",
  ],
  gp: ["Contact your GP surgery for an appointment.", "Use NHS 111 if you cannot reach your GP."],
  urgent_care: ["Seek same-day urgent assessment now.", "Use NHS 111 if you need help finding urgent care."],
  emergency_999: ["Call 999 now.", "Do not drive yourself if you feel unwell."],
  self_care: ["Follow the self-care advice below.", "Monitor your symptoms over the next 24 to 48 hours."],
};

const EMERGENCY_ACTION_COPY: Record<"urgent_care" | "emergency_999", string> = {
  emergency_999:
    "Call 999 immediately. Do not delay for online or routine care.",
  urgent_care:
    "Use urgent care now. If symptoms worsen, call 999 immediately.",
};

const URGENT_TOP_NOTICE: Record<"urgent_care" | "emergency_999", { title: string; body: string }> = {
  emergency_999: {
    title: "Emergency action required",
    body: "Call 999 now. Do not delay care if symptoms are severe or rapidly worsening.",
  },
  urgent_care: {
    title: "Urgent action required",
    body: "Arrange same-day urgent assessment. Call NHS 111 if you need help finding the right urgent service.",
  },
};

export function normalizeOutcome(raw?: string): ConsultationOutcome {
  if (
    raw === "self_care" ||
    raw === "pharmacy" ||
    raw === "gp" ||
    raw === "urgent_care" ||
    raw === "emergency_999"
  ) {
    return raw;
  }
  return "pharmacy";
}

export function getUrgentTopNotice(
  outcome: ConsultationOutcome,
): { title: string; body: string } | null {
  if (outcome === "emergency_999" || outcome === "urgent_care") {
    return URGENT_TOP_NOTICE[outcome];
  }
  return null;
}

export function outcomePresentation(outcome: ConsultationOutcome): {
  headline: string;
  actionLine: string;
  referralActions: string[];
  showFindPharmacy: boolean;
  actionVariant: ActionVariant;
  actionHighlightLabel?: string;
  emergencyCopy?: string;
} {
  switch (outcome) {
    case "emergency_999":
      return {
        headline: "Call 999 now",
        actionLine: ACTION_LINES.emergency_999,
        referralActions: REFERRAL_ACTIONS.emergency_999,
        showFindPharmacy: false,
        actionVariant: "emergency",
        actionHighlightLabel: "Emergency options only",
        emergencyCopy: EMERGENCY_ACTION_COPY.emergency_999,
      };
    case "urgent_care":
      return {
        headline: "Urgent assessment needed",
        actionLine: ACTION_LINES.urgent_care,
        referralActions: REFERRAL_ACTIONS.urgent_care,
        showFindPharmacy: false,
        actionVariant: "emergency",
        actionHighlightLabel: "Emergency options only",
        emergencyCopy: EMERGENCY_ACTION_COPY.urgent_care,
      };
    case "gp":
      return {
        headline: "GP assessment recommended",
        actionLine: ACTION_LINES.gp,
        referralActions: REFERRAL_ACTIONS.gp,
        showFindPharmacy: false,
        actionVariant: "gp",
        actionHighlightLabel: "GP appointment",
      };
    case "self_care":
      return {
        headline: "Self-care may be appropriate",
        actionLine: ACTION_LINES.self_care,
        referralActions: REFERRAL_ACTIONS.self_care,
        showFindPharmacy: false,
        actionVariant: "plain",
      };
    case "pharmacy":
    default:
      return {
        headline: "Pharmacy consultation recommended",
        actionLine: ACTION_LINES.pharmacy,
        referralActions: REFERRAL_ACTIONS.pharmacy,
        showFindPharmacy: true,
        actionVariant: "pharmacy",
        actionHighlightLabel: "Pharmacy",
      };
  }
}
