import { GSI_DEM5A_MAX_LEVEL } from './gsiTileConfig';

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
