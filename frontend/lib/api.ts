import { isApiMocksEnabled, tryMockApiResponse } from './apiMocks';

/**
 * Browser-side API base URL. Set NEXT_PUBLIC_API_URL in .env for non-default hosts.
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (raw && typeof raw === 'string' && raw.trim()) {
    return raw.trim().replace(/\/$/, '');
  }
  return 'http://localhost:4000';
}

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${p}`;
}

/**
 * Plain fetch with JSON parse; on network/HTTP/parse errors returns `fallback` (keeps CRM mock-first UX when API is down).
 */
export async function safeFetchJson<T>(url: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) return fallback;
    const text = await res.text();
    if (!text.trim()) return fallback;
    const data = JSON.parse(text) as T;
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

/** True when consultation/summary mocks are active (see `lib/apiMocks.ts`). */
export { isApiMocksEnabled };

/**
 * Consultation/summary fetch: when mocks are allowed (default), tries in-browser mocks first, then the network.
 * If the network fails (e.g. backend not running), tries mocks again so offline demos still work.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const allowMock = isApiMocksEnabled();
  if (allowMock) {
    const mockFirst = await tryMockApiResponse(input, init);
    if (mockFirst) return mockFirst;
  }
  try {
    return await fetch(input, init);
  } catch {
    if (allowMock) {
      const mockRetry = await tryMockApiResponse(input, init);
      if (mockRetry) return mockRetry;
    }
    throw new Error(
      'Failed to fetch. Start the backend or leave NEXT_PUBLIC_USE_API_MOCKS unset so offline mocks handle consultation APIs.',
    );
  }
}
