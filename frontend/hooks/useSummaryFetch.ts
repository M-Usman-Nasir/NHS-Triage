import { useEffect, useState } from 'react';
import { apiFetchWithTimeout, apiUrl, parseJsonSafe } from '../lib/api';
import { mapSummaryToResult } from '../lib/mapSummaryToResult';
import type { SummaryApiResponse, TriageResultView } from '../types/consultation';

interface UseSummaryFetchParams {
  isReady: boolean;
  idParam: string | string[] | undefined;
  idsParam: string | string[] | undefined;
  demoParam: string | string[] | undefined;
  mockResult: TriageResultView;
}

export function useSummaryFetch({ isReady, idParam, idsParam, demoParam, mockResult }: UseSummaryFetchParams) {
  const [result, setResult] = useState<TriageResultView | null>(null);
  const [multiResults, setMultiResults] = useState<TriageResultView[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

    const consultationId = typeof idParam === 'string' ? idParam : Array.isArray(idParam) ? idParam[0] : undefined;
    const consultationIds = (() => {
      if (typeof idsParam === 'string') return idsParam.split(',').map((x) => x.trim()).filter(Boolean);
      if (Array.isArray(idsParam) && idsParam.length > 0) return idsParam[0].split(',').map((x) => x.trim()).filter(Boolean);
      return consultationId ? [consultationId] : [];
    })();
    const demo = typeof demoParam === 'string' ? demoParam : Array.isArray(demoParam) ? demoParam[0] : undefined;

    if (demo === 'true' || consultationIds.length === 0) {
      setResult(mockResult);
      setMultiResults([mockResult]);
      setFetchError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setFetchError(null);
    setLoading(true);

    (async () => {
      try {
        const loaded: TriageResultView[] = [];
        for (const consultationIdToLoad of consultationIds) {
          const r = await apiFetchWithTimeout(apiUrl(`/api/summary/${encodeURIComponent(consultationIdToLoad)}`));
          const data = (await parseJsonSafe<SummaryApiResponse | { error?: string }>(r)) ?? {};
          if (!r.ok) {
            const msg = typeof (data as { error?: string }).error === 'string'
              ? (data as { error: string }).error
              : `Could not load summary (HTTP ${r.status}).`;
            setFetchError(msg);
            setResult(null);
            setMultiResults([]);
            setLoading(false);
            return;
          }
          loaded.push(mapSummaryToResult(data as SummaryApiResponse));
        }
        if (cancelled) return;
        setMultiResults(loaded);
        setResult(loaded[0] ?? null);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setFetchError(
          'Could not reach the API. Showing the built-in demo result below. When you connect the backend, set NEXT_PUBLIC_USE_API_MOCKS=false and use a real consultation id.',
        );
        setResult(mockResult);
        setMultiResults([mockResult]);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [demoParam, idParam, idsParam, isReady, mockResult]);

  return { result, multiResults, loading, fetchError };
}
