/** GSI 標高 PNG の無効画素 (128, 0, 0) — 仕様上 NA（海上は 0m 相当） */
export function isGsiDemNoDataRgb(r: number, g: number, b: number): boolean {
  return r === 128 && g === 0 && b === 0;
}

/** 海上タイルで nodata が無く小さな正の値だけになる帯（GSI dem_png の沖パターン） */
export const GSI_DEM_OPEN_OCEAN_MIN_M = 2.5;
export const GSI_DEM_OPEN_OCEAN_MAX_M = 35;
/** nodata 混在タイルの海上画素（小さい正の値）を 0m に揃える */
export const GSI_DEM_COASTAL_SEA_CLAMP_M = 12;
export const GSI_DEM_MIXED_TILE_NODATA_RATIO = 0.35;

/** DEM デコード後の標高（m）— 海・欠損は 0 に揃え、LOD 間の段差を抑える */
export function normalizeGsiDemHeightMeters(altM: number, isNoData: boolean): number {
  if (isNoData) return 0;
  if (altM < 0) return 0;
  return altM;
}

/**
 * 沖の dem_png が nodata 無しで 4〜26m 等のみのとき true（陸混じりは max で除外）。
 * 404 フォールバック 0m と高さを揃えるためタイル全体を 0m 平坦にする。
 */
export function gsiDemHeightGridIsOpenOceanWithoutNodata(heights: number[][]): boolean {
  let min = Infinity;
  let max = -Infinity;
  for (const row of heights) {
    for (const h of row) {
      if (!Number.isFinite(h)) continue;
      if (h < min) min = h;
      if (h > max) max = h;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return false;
  return min > GSI_DEM_OPEN_OCEAN_MIN_M && max < GSI_DEM_OPEN_OCEAN_MAX_M;
}

export function computeGsiDemHeightGridMinMax(heights: number[][]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const row of heights) {
    for (const h of row) {
      if (!Number.isFinite(h)) continue;
      if (h < min) min = h;
      if (h > max) max = h;
    }
  }
  return { min, max };
}

export function sampleGsiDemHeightForTerrain(
  rawM: number,
  nodataRatio: number,
  tileMinM: number,
  tileMaxM: number,
): number {
  if (!Number.isFinite(rawM)) return 0;
  if (rawM < 0) return 0;
  if (nodataRatio >= GSI_DEM_MIXED_TILE_NODATA_RATIO && rawM <= GSI_DEM_COASTAL_SEA_CLAMP_M) {
    return 0;
  }
  if (tileMinM <= 15 && rawM <= tileMinM + 0.5) {
    return 0;
  }
  if (tileMaxM > 30 && rawM <= 25) {
    return 0;
  }
  return rawM;
}

/** ImageData がすべて無効画素なら海上など — 子 refinement 不要 */
export function imageDataIsAllGsiDemNoData(data: Uint8ClampedArray, width: number, height: number): boolean {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const addr = (x + y * width) * 4;
      if (!isGsiDemNoDataRgb(data[addr]!, data[addr + 1]!, data[addr + 2]!)) {
        return false;
      }
    }
  }
  return true;
}
