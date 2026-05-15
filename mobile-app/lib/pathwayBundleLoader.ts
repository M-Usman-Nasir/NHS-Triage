import type { PathwayQuestion } from "./pathwayQuestions";
import type { PathwayBundle, RedFlagChecklistItem, RedFlagTier } from "./pathwayTypes";

import utiJson from "../assets/pathways/uti.json";
import soreThroatJson from "../assets/pathways/sore_throat.json";
import sinusitisJson from "../assets/pathways/sinusitis.json";
import otitisJson from "../assets/pathways/otitis_media.json";
import insectBitesJson from "../assets/pathways/insect_bites.json";
import impetigoJson from "../assets/pathways/impetigo.json";
import shinglesJson from "../assets/pathways/shingles.json";

type RawPathway = {
  pathway: string;
  label: string;
  questions: PathwayQuestion[];
  questionGraph?: PathwayBundle["questionGraph"];
  redFlagChecklist?: RedFlagChecklistItem[];
  redFlags?: PathwayBundle["redFlags"];
  emergencyOverrides?: PathwayBundle["emergencyOverrides"];
  outcomeRules?: PathwayBundle["outcomeRules"];
  eligibilityRules?: PathwayBundle["eligibilityRules"];
};

const OUTCOME_TIER: Record<string, RedFlagTier> = {
  emergency_999: "emergency_999",
  urgent_care: "urgent_care",
  gp: "gp",
};

function buildChecklistFromQuestions(raw: RawPathway): RedFlagChecklistItem[] {
  if (raw.redFlagChecklist?.length) return raw.redFlagChecklist;

  const items: RedFlagChecklistItem[] = [];
  const byId = Object.fromEntries((raw.questions || []).map((q) => [q.id, q]));

  for (const rf of raw.emergencyOverrides || []) {
    if (rf.outcome === "emergency_999") {
      items.push({
        id: rf.code,
        label: rf.message,
        tier: "emergency_999",
      });
    }
  }

  for (const q of raw.questions || []) {
    if (!q.redFlagHint) continue;
    const match = (raw.redFlags || []).find((rf) => {
      const c = rf.condition.trim();
      return c === `${q.id} === true` || c.startsWith(`${q.id} ===`);
    });
    items.push({
      id: `rf_${raw.pathway}_${q.id}`,
      label: match?.message ?? q.text,
      linkedQuestionId: q.id,
      tier: OUTCOME_TIER[match?.outcome ?? ""] ?? "emergency_999",
    });
  }

  for (const rf of raw.redFlags || []) {
    if (rf.outcome !== "emergency_999") continue;
    const exists = items.some((i) => i.label === rf.message);
    if (!exists) {
      const qMatch = rf.condition.match(/^(q\d+)\s*===/);
      items.push({
        id: rf.code,
        label: rf.message,
        linkedQuestionId: qMatch?.[1],
        tier: "emergency_999",
      });
    }
  }

  return items;
}

function normalizeBundle(raw: RawPathway): PathwayBundle {
  return {
    pathway: raw.pathway,
    label: raw.label,
    questions: raw.questions,
    questionGraph: raw.questionGraph,
    redFlagChecklist: buildChecklistFromQuestions(raw),
    redFlags: raw.redFlags,
    emergencyOverrides: raw.emergencyOverrides,
    outcomeRules: raw.outcomeRules,
    eligibilityRules: raw.eligibilityRules,
  };
}

const RAW_BY_CODE: Record<string, RawPathway> = {
  uti: utiJson as RawPathway,
  sore_throat: soreThroatJson as RawPathway,
  sinusitis: sinusitisJson as RawPathway,
  otitis_media: otitisJson as RawPathway,
  insect_bites: insectBitesJson as RawPathway,
  impetigo: impetigoJson as RawPathway,
  shingles: shinglesJson as RawPathway,
};

export function getPathwayBundle(pathwayCode: string): PathwayBundle | null {
  const raw = RAW_BY_CODE[pathwayCode];
  if (!raw) return null;
  return normalizeBundle(raw);
}

export function listBundledPathwayCodes(): string[] {
  return Object.keys(RAW_BY_CODE);
}
