import { useMemo, useState } from 'react';

export function useMultiConditionFlow(pathwaysParam: string | string[] | undefined, pathwayParam: string | string[] | undefined) {
  const pathwayCodes = useMemo(() => {
    const parseCodes = (raw: string) =>
      raw
        .split(',')
        .map((code) => code.trim())
        .filter(Boolean);

    if (typeof pathwaysParam === 'string') return parseCodes(pathwaysParam);
    if (Array.isArray(pathwaysParam) && pathwaysParam.length > 0) return parseCodes(pathwaysParam[0]);
    if (typeof pathwayParam === 'string') return [pathwayParam];
    if (Array.isArray(pathwayParam) && pathwayParam.length > 0) return [pathwayParam[0]];
    return [];
  }, [pathwayParam, pathwaysParam]);

  const [pathwayIndex, setPathwayIndex] = useState(0);
  const [completedConsultationIds, setCompletedConsultationIds] = useState<string[]>([]);

  const activePathwayCode = pathwayCodes[pathwayIndex];
  const hasMorePathways = pathwayIndex < pathwayCodes.length - 1;

  const moveToNextPathway = () => {
    setPathwayIndex((idx) => Math.min(idx + 1, Math.max(pathwayCodes.length - 1, 0)));
  };

  const appendCompletedConsultation = (consultationId: string) => {
    setCompletedConsultationIds((current) => [...current, consultationId]);
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
    appendCompletedConsultation,
  };
}
