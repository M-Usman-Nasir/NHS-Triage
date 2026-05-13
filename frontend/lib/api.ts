import { isApiMocksEnabled, tryMockApiResponse } from './apiMocks';

/**
 * If the browser gave a URL tryMock could not parse, rebuild with pathname only (host is ignored by mocks).
 */
function mockRetryUrl(input: RequestInfo | URL): URL | null {
  try {
    const raw = typeof input === 'string' ? input : input instanceof Request ? input.url : `${input}`;
    const u = new URL(raw, 'http://localhost');
    return new URL(u.pathname + u.search, 'http://localhost');
  } catch {
    return null;
  }
}

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
    const res = await (isApiMocksEnabled() ? apiFetch(url, init) : fetch(url, init));
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
 * When `NEXT_PUBLIC_USE_API_MOCKS` is not `false`, all requests go through in-browser mocks only (no network).
 * Set `NEXT_PUBLIC_USE_API_MOCKS=false` to use a real backend.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const allowMock = isApiMocksEnabled();
  if (allowMock) {
    const mockFirst = await tryMockApiResponse(input, init);
    if (mockFirst) return mockFirst;
    const retryInput = mockRetryUrl(input);
    if (retryInput) {
      const mockSecond = await tryMockApiResponse(retryInput, init);
      if (mockSecond) return mockSecond;
    }
    const path = (retryInput ?? mockRetryUrl(input))?.pathname ?? 'unknown';
    const method = (init?.method || 'GET').toUpperCase();
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Demo mode: no mock for this endpoint.',
        path,
        method,
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }
  try {
    return await fetch(input, init);
  } catch {
    throw new Error('Failed to fetch. Start the backend or enable API mocks (default in dev).');
  }
}

/**
 * API fetch with timeout so pages can degrade gracefully in poor network conditions.
 */
export async function apiFetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 10000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await apiFetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Shared JSON parser for API responses that keeps a consistent return shape.
 */
export async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
