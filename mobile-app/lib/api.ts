import { Platform } from "react-native";
import { isNativeApiMocksEnabled, tryNativeMockApiResponse } from "./consultationApiMocks";

const DEFAULT_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";

/** API origin for consultation endpoints. Android emulator uses 10.0.2.2 to reach the host machine. */
export const API_BASE_URL = `http://${DEFAULT_HOST}:4000`;

export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export { isNativeApiMocksEnabled };

/**
 * When native API mocks are enabled (default), consultation routes are served in-process — no network.
 * Set USE_NATIVE_API_MOCKS=false (via env injection) to use real fetch to {@link API_BASE_URL}.
 */
export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  if (isNativeApiMocksEnabled()) {
    const mock = await tryNativeMockApiResponse(input, init);
    if (mock) return mock;
    return new Response(
      JSON.stringify({
        error: "No offline mock for this request.",
        mockOnly: true,
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
  return fetch(input, init);
}
