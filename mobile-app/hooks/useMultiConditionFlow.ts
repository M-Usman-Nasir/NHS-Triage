import { useMemo, useState } from "react";

/** Port of frontend/hooks/useMultiConditionFlow.ts — pathways comma-separated codes from navigation. */
export function useMultiConditionFlow(pathwaysParam: string | undefined) {
  const pathwayCodes = useMemo(() => {
    if (!pathwaysParam) return [];
    return pathwaysParam
      .split(",")
      .map((code) => code.trim())
      .filter(Boolean);
  }, [pathwaysParam]);

  const [pathwayIndex, setPathwayIndex] = useState(0);
  const [completedConsultationIds, setCompletedConsultationIds] = useState<string[]>([]);

  const activePathwayCode = pathwayCodes[pathwayIndex];
  const hasMorePathways = pathwayIndex < pathwayCodes.length - 1;

  const moveToNextPathway = () => {
    setPathwayIndex((idx) => Math.min(idx + 1, Math.max(pathwayCodes.length - 1, 0)));
  };

  return {
    pathwayCodes,
    pathwayIndex,
    setPathwayIndex,
    activePathwayCode,
    hasMorePathways,
    moveToNextPathway,
    completedConsultationIds,
    setCompletedConsultationIds,
  };
}
