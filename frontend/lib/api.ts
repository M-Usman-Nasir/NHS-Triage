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

/** True when consultation/summary mocks are active (see `lib/apiMocks.ts`). */
export { isApiMocksEnabled };

/**
 * Same as `fetch`, but when mocks are enabled returns local responses for consultation/summary routes.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (isApiMocksEnabled()) {
    const mock = await tryMockApiResponse(input, init);
    if (mock) return mock;
  }
  return fetch(input, init);
}
