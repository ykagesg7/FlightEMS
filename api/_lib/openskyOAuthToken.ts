/**
 * OpenSky OAuth2 client credentials token manager (module singleton).
 * Tokens expire after ~30 minutes; refresh proactively before expiry.
 */

export const OPENSKY_TOKEN_URL =
  'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

/** Refresh this many seconds before token expiry. */
export const TOKEN_REFRESH_MARGIN_SEC = 30;

export type TokenCache = {
  accessToken: string;
  expiresAtMs: number;
};

export type TokenResponseJson = {
  access_token?: string;
  expires_in?: number;
};

/**
 * Returns true when a cached token is still valid (with refresh margin).
 */
export function isTokenValid(cache: TokenCache | null, nowMs: number): boolean {
  if (!cache?.accessToken) return false;
  return nowMs < cache.expiresAtMs - TOKEN_REFRESH_MARGIN_SEC * 1000;
}

/**
 * Compute expiry timestamp from OAuth token response.
 */
export function tokenExpiresAtMs(nowMs: number, expiresInSec: number | undefined): number {
  const sec =
    typeof expiresInSec === 'number' && Number.isFinite(expiresInSec) && expiresInSec > 0
      ? expiresInSec
      : 1800;
  return nowMs + sec * 1000;
}

/**
 * Parse OAuth token JSON into cache entry. Returns null on invalid payload.
 */
export function parseTokenResponse(json: unknown, nowMs: number): TokenCache | null {
  if (!json || typeof json !== 'object') return null;
  const o = json as TokenResponseJson;
  if (typeof o.access_token !== 'string' || !o.access_token) return null;
  return {
    accessToken: o.access_token,
    expiresAtMs: tokenExpiresAtMs(nowMs, o.expires_in),
  };
}

let tokenCache: TokenCache | null = null;

/** @internal test hook */
export function resetOpenSkyTokenCacheForTests(): void {
  tokenCache = null;
}

/** @internal test hook */
export function setOpenSkyTokenCacheForTests(cache: TokenCache | null): void {
  tokenCache = cache;
}

export type FetchOpenSkyToken = () => Promise<TokenCache | null>;

/**
 * Returns a valid Bearer token, refreshing via `fetchToken` when needed.
 * Returns null when credentials are missing or refresh fails.
 */
export async function getOpenSkyBearerToken(
  fetchToken: FetchOpenSkyToken,
  nowMs = Date.now()
): Promise<string | null> {
  if (isTokenValid(tokenCache, nowMs)) {
    return tokenCache!.accessToken;
  }
  const next = await fetchToken();
  if (!next) return null;
  tokenCache = next;
  return next.accessToken;
}
