import type { RedFlagChecklistItem, RedFlagTier } from "./pathwayTypes";

export const RED_FLAG_NONE_ID = "_rf_none";

const TIER_RANK: Record<RedFlagTier, number> = {
  emergency_999: 3,
  urgent_care: 2,
  gp: 1,
};

export type RedFlagSelectionResult =
  | { action: "emergency"; tier: "emergency_999"; labels: string[]; question: string }
  | { action: "continue"; tier: RedFlagTier | null; labels: string[] };

export function evaluateRedFlagSelections(
  items: RedFlagChecklistItem[],
  selectedIds: string[],
  noneSelected: boolean,
): RedFlagSelectionResult {
  if (noneSelected || selectedIds.length === 0) {
    return { action: "continue", tier: null, labels: [] };
  }

  const selected = items.filter((i) => selectedIds.includes(i.id));
  const labels = selected.map((i) => i.label);

  const has999 = selected.some((i) => i.tier === "emergency_999");
  if (has999) {
    return {
      action: "emergency",
      tier: "emergency_999",
      labels,
      question: labels.join("; "),
    };
  }

  let highest: RedFlagTier | null = null;
  for (const item of selected) {
    if (!highest || TIER_RANK[item.tier] > TIER_RANK[highest]) {
      highest = item.tier;
    }
  }

  return { action: "continue", tier: highest, labels };
}
