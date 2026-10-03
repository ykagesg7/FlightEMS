/**
 * GSI DEM タイルのメモリキャッシュ（404 / 全無効画素を記録し再 fetch を防ぐ）。
 * sessionStorage は任意（同一タブ内の再マウント向け）。
 */
export type GsiDemTileStatus = 'elevated' | 'nodata' | 'missing' | 'seaFilled';

const SESSION_PREFIX = 'flight-gsi-dem:';
const SESSION_MAX_KEYS = 4000;

export function gsiDemTileKey(level: number, x: number, y: number): string {
  return `${level}/${x}/${y}`;
}

export function gsiDemParentKey(level: number, x: number, y: number): string | null {
  if (level <= 1) return null;
  return gsiDemTileKey(level - 1, x >> 1, y >> 1);
}

export function isBarrenGsiDemTileStatus(status: GsiDemTileStatus | undefined): boolean {
  return status === 'missing' || status === 'nodata';
}

function readSession(key: string): GsiDemTileStatus | undefined {
  if (typeof sessionStorage === 'undefined') return undefined;
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + key);
    if (
      raw === 'elevated' ||
      raw === 'nodata' ||
      raw === 'missing' ||
      raw === 'seaFilled'
    ) {
      return raw;
    }
  } catch {
    /* quota / private mode */
  }
  return undefined;
}

function writeSession(key: string, status: GsiDemTileStatus): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_PREFIX + key, status);
  } catch {
    /* quota */
  }
}

/** 教育用プレビュー向け — dem5a z15 を取りに行かず dem_png z14 で十分 */
export class GsiDemTileCache {
  private readonly mem = new Map<string, GsiDemTileStatus>();
  private sessionWrites = 0;

  get(level: number, x: number, y: number): GsiDemTileStatus | undefined {
    const key = gsiDemTileKey(level, x, y);
    const hit = this.mem.get(key);
    if (hit) return hit;
    const fromSession = readSession(key);
    if (fromSession) {
      this.mem.set(key, fromSession);
      return fromSession;
    }
    return undefined;
  }

  set(level: number, x: number, y: number, status: GsiDemTileStatus): void {
    const key = gsiDemTileKey(level, x, y);
    this.mem.set(key, status);
    if (this.sessionWrites < SESSION_MAX_KEYS) {
      writeSession(key, status);
      this.sessionWrites += 1;
    }
  }

  shouldSkipNetworkFetch(level: number, x: number, y: number): GsiDemTileStatus | null {
    const self = this.get(level, x, y);
    if (self === 'seaFilled') return 'seaFilled';
    if (isBarrenGsiDemTileStatus(self)) return self!;
    const parent = gsiDemParentKey(level, x, y);
    if (parent) {
      const parts = parent.split('/');
      const pLevel = Number(parts[0]);
      const pX = Number(parts[1]);
      const pY = Number(parts[2]);
      if (Number.isFinite(pLevel) && Number.isFinite(pX) && Number.isFinite(pY)) {
        const parentStatus = this.get(pLevel, pX, pY);
        if (isBarrenGsiDemTileStatus(parentStatus)) return parentStatus!;
      }
    }
    return null;
  }
}

/** Viewer インスタンス間で共有（同一セッションの重複 404 抑制） */
let sharedCache: GsiDemTileCache | null = null;

export function getSharedGsiDemTileCache(): GsiDemTileCache {
  if (!sharedCache) sharedCache = new GsiDemTileCache();
  return sharedCache;
}

/** テスト用 */
export function resetSharedGsiDemTileCacheForTests(): void {
  sharedCache = null;
}
