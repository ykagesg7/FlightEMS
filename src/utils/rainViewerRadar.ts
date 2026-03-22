/**
 * RainViewer Weather Maps API（教育・個人向け無料）。
 * @see https://www.rainviewer.com/api/weather-maps-api.html
 */

export const RAINVIEWER_TILE_MAX_NATIVE_ZOOM = 7;
export const RAINVIEWER_DEFAULT_TILE_SIZE = 512;
/** Color scheme ID（公式一覧より固定。変更時は mapStyles / ヘルプの説明を確認） */
export const RAINVIEWER_DEFAULT_COLOR_SCHEME = 2;
/** options: {smooth}_{snow} — 平滑化あり・雪色分けあり */
export const RAINVIEWER_DEFAULT_TILE_OPTIONS = '1_1';

export const RAINVIEWER_MANIFEST_DIRECT_URL =
  'https://api.rainviewer.com/public/weather-maps.json';

export interface RainViewerManifest {
  version?: string;
  generated?: number;
  host: string;
  radar?: {
    past?: Array<{ time: number; path: string }>;
  };
}

/** マニフェストキャッシュ TTL（ms） */
export const RAINVIEWER_MANIFEST_TTL_MS = 7 * 60 * 1000;

let manifestCache: { data: RainViewerManifest; fetchedAt: number } | null = null;

export function clearRainViewerManifestCacheForTests(): void {
  manifestCache = null;
}

/**
 * `VITE_RAINVIEWER_USE_MANIFEST_PROXY=true` のとき同一オリジンの `/api/rainviewer-maps` を使う（CORS 回避用）。
 * それ以外は RainViewer 直 fetch。
 */
export function getRainViewerManifestFetchUrl(): string {
  const useProxy = import.meta.env.VITE_RAINVIEWER_USE_MANIFEST_PROXY === 'true';
  if (!useProxy) {
    return RAINVIEWER_MANIFEST_DIRECT_URL;
  }
  const custom = import.meta.env.VITE_RAINVIEWER_MANIFEST_URL;
  if (typeof custom === 'string' && custom.trim()) {
    return custom.trim();
  }
  return '/api/rainviewer-maps';
}

export async function fetchRainViewerManifest(forceRefresh = false): Promise<RainViewerManifest | null> {
  const now = Date.now();
  if (!forceRefresh && manifestCache && now - manifestCache.fetchedAt < RAINVIEWER_MANIFEST_TTL_MS) {
    return manifestCache.data;
  }

  const url = getRainViewerManifestFetchUrl();
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    console.warn('[rainViewer] manifest fetch failed', res.status);
    return manifestCache?.data ?? null;
  }

  const data = (await res.json()) as RainViewerManifest;
  if (!data?.host) {
    console.warn('[rainViewer] invalid manifest');
    return manifestCache?.data ?? null;
  }

  manifestCache = { data, fetchedAt: now };
  return data;
}

export function pickLatestPastPath(manifest: RainViewerManifest): string | null {
  const past = manifest.radar?.past;
  if (!past?.length) return null;
  return past[past.length - 1]?.path ?? null;
}

/**
 * Leaflet `L.tileLayer` 用 URL テンプレート。
 * 形式: `{host}{path}/{size}/{z}/{x}/{y}/{color}/{options}.png`
 */
export function buildRainViewerTileUrlTemplate(
  host: string,
  radarPath: string,
  size: number = RAINVIEWER_DEFAULT_TILE_SIZE,
  color: number = RAINVIEWER_DEFAULT_COLOR_SCHEME,
  options: string = RAINVIEWER_DEFAULT_TILE_OPTIONS
): string {
  const h = host.replace(/\/$/, '');
  const p = radarPath.startsWith('/') ? radarPath : `/${radarPath}`;
  return `${h}${p}/${size}/{z}/{x}/{y}/${color}/${options}.png`;
}

export const RAINVIEWER_ATTRIBUTION =
  'Radar: <a href="https://www.rainviewer.com/" target="_blank" rel="noopener noreferrer">RainViewer</a> (reference)';
