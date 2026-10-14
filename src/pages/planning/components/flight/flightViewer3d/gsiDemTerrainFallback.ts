import {
  GSI_DEM5A_MAX_LEVEL,
  GSI_DEM_PNG_MIN_LEVEL,
  GSI_PREVIEW_MAX_FETCH_LEVEL,
} from './gsiTileConfig';

const GSI_DEM_RASTER_SIZE = 256;

/** 海上・欠損タイルでも LOD を継続し黒穴／浮き板を抑える */
export function gsiDemSeaLevelAllowsChildRefinement(
  tileLevel: number,
  maxLevel: number = GSI_DEM5A_MAX_LEVEL,
): boolean {
  return tileLevel < maxLevel;
}

/** 子タイル取得失敗時に親 DEM へフォールバックする座標 */
export function gsiDemParentFallbackFetch(
  fetchLevel: number,
  fetchX: number,
  fetchY: number,
): { parentLevel: number; parentX: number; parentY: number } | null {
  if (fetchLevel <= 1) return null;
  return {
    parentLevel: fetchLevel - 1,
    parentX: fetchX >> 1,
    parentY: fetchY >> 1,
  };
}

/**
 * 親タイルの heightmap を使うときのサブリージョン（既存 shift 系と整合）。
 */
export function gsiDemUpsampleShiftFromParent(
  fetchX: number,
  fetchY: number,
  shift: number,
  shiftX: number,
  shiftY: number,
): { shift: number; shiftX: number; shiftY: number } {
  return {
    shift: shift + 1,
    shiftX: (fetchX % 2) / 2 + shiftX / 2,
    shiftY: (fetchY % 2) / 2 + shiftY / 2,
  };
}

export type GsiDemFetchTile = {
  displayLevel: number;
  fetchLevel: number;
  fetchX: number;
  fetchY: number;
  shift: number;
  shiftX: number;
  shiftY: number;
};

/** requestTileGeometry / getTileDataAvailable 共通の DEM フェッチ座標 */
export function resolveGsiDemFetchTile(
  x: number,
  y: number,
  level: number,
  previewMaxLevel: number = GSI_PREVIEW_MAX_FETCH_LEVEL,
  maxTerrainLevel: number = GSI_DEM5A_MAX_LEVEL,
): GsiDemFetchTile {
  const orgX = x;
  const orgY = y;
  let shift = 0;
  let requestLevel = level;
  if (requestLevel > maxTerrainLevel) {
    shift = requestLevel - maxTerrainLevel;
    requestLevel = maxTerrainLevel;
  }

  x >>= shift + 1;
  y >>= shift;
  let shiftX = (orgX % 2 ** (shift + 1)) / 2 ** (shift + 1);
  let shiftY = (orgY % 2 ** shift) / 2 ** shift;

  let fetchLevel = requestLevel;
  let fetchX = x;
  let fetchY = y;
  if (fetchLevel > previewMaxLevel) {
    const drop = fetchLevel - previewMaxLevel;
    fetchX >>= drop;
    fetchY >>= drop;
    fetchLevel = previewMaxLevel;
    shift += drop;
    shiftX = (x % 2 ** drop) / 2 ** drop + shiftX / 2 ** drop;
    shiftY = (y % 2 ** drop) / 2 ** drop + shiftY / 2 ** drop;
  }

  return {
    displayLevel: level,
    fetchLevel,
    fetchX,
    fetchY,
    shift,
    shiftX,
    shiftY,
  };
}

export function gsiDemFetchTileNeedsNetwork(
  fetch: GsiDemFetchTile,
  minLevel: number = GSI_DEM_PNG_MIN_LEVEL,
): boolean {
  return fetch.fetchLevel >= minLevel;
}

/** 親 256px タイル内の子クアドラント（fetchX/fetchY の LSB） */
export function gsiDemExtractChildQuadrant(
  heightCSV: number[][],
  childFetchX: number,
  childFetchY: number,
): number[][] {
  const wim = heightCSV[0]?.length ?? GSI_DEM_RASTER_SIZE;
  const him = heightCSV.length;
  const col = childFetchX & 1;
  const row = childFetchY & 1;
  const x0 = col * (wim >> 1);
  const y0 = row * (him >> 1);
  const qw = wim >> 1;
  const qh = him >> 1;
  const out: number[][] = [];
  for (let yy = y0; yy < y0 + qh; yy++) {
    out.push(heightCSV[yy]!.slice(x0, x0 + qw));
  }
  return out;
}

/** GSI 海上 nodata / 0m 付近の画素が大半か（陸地クアドラントへの誤アップサンプル防止） */
export function gsiDemHeightsLookLikeSea(
  heights: number[][],
  seaThresholdM = 2,
  minSeaRatio = 0.92,
): boolean {
  let sea = 0;
  let n = 0;
  for (const row of heights) {
    for (const h of row) {
      n++;
      if (Math.abs(h) <= seaThresholdM) sea++;
    }
  }
  return n > 0 && sea / n >= minSeaRatio;
}

export const GSI_DEM_TILE_UNAVAILABLE = 'gsi-dem-tile-unavailable';

export function isGsiDemTileUnavailableError(error: unknown): boolean {
  return error instanceof Error && error.message === GSI_DEM_TILE_UNAVAILABLE;
}
