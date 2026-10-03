import { gsiDemTileKey } from './gsiDemTileCache';

export type DemFetchSimulationOptions = {
  barrenKeys: ReadonlySet<string>;
  maxLevel: number;
  rootKeys: readonly string[];
  refineAfterBarren: boolean;
  inheritParentBarren: boolean;
  dedupeFetches: boolean;
};

function parseKey(key: string): { level: number; x: number; y: number } | null {
  const parts = key.split('/');
  const level = Number(parts[0]);
  const x = Number(parts[1]);
  const y = Number(parts[2]);
  if (!Number.isFinite(level) || !Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { level, x, y };
}

/**
 * 欠損 DEM タイル木の network 試行回数（404 回数の近似）。
 */
export function countSimulatedDemNetworkAttempts(options: DemFetchSimulationOptions): number {
  const attempted = new Set<string>();
  let attempts = 0;

  const tryFetch = (level: number, x: number, y: number): void => {
    const key = gsiDemTileKey(level, x, y);
    if (options.inheritParentBarren && level > 1) {
      const parentKey = gsiDemTileKey(level - 1, x >> 1, y >> 1);
      if (options.barrenKeys.has(parentKey)) {
        return;
      }
    }

    if (options.dedupeFetches && attempted.has(key)) {
      return;
    }

    if (!options.barrenKeys.has(key)) {
      if (level >= options.maxLevel) return;
      tryFetch(level + 1, x * 2, y * 2);
      tryFetch(level + 1, x * 2 + 1, y * 2);
      tryFetch(level + 1, x * 2, y * 2 + 1);
      tryFetch(level + 1, x * 2 + 1, y * 2 + 1);
      return;
    }

    attempts += 1;
    if (options.dedupeFetches) attempted.add(key);

    if (!options.refineAfterBarren || level >= options.maxLevel) return;

    tryFetch(level + 1, x * 2, y * 2);
    tryFetch(level + 1, x * 2 + 1, y * 2);
    tryFetch(level + 1, x * 2, y * 2 + 1);
    tryFetch(level + 1, x * 2 + 1, y * 2 + 1);
  };

  for (const root of options.rootKeys) {
    const parsed = parseKey(root);
    if (!parsed) continue;
    tryFetch(parsed.level, parsed.x, parsed.y);
  }

  return attempts;
}

/** 欠損タイルの子孫をすべて barren とみなす（海上タイル木・理論上界用） */
export function expandBarrenTileSubtree(seeds: readonly string[], maxLevel: number): Set<string> {
  const out = new Set<string>(seeds);
  for (const seed of seeds) {
    const parsed = parseKey(seed);
    if (!parsed) continue;
    const stack: Array<{ level: number; x: number; y: number }> = [parsed];
    while (stack.length > 0) {
      const cur = stack.pop()!;
      out.add(gsiDemTileKey(cur.level, cur.x, cur.y));
      if (cur.level >= maxLevel) continue;
      const n = cur.level + 1;
      stack.push(
        { level: n, x: cur.x * 2, y: cur.y * 2 },
        { level: n, x: cur.x * 2 + 1, y: cur.y * 2 },
        { level: n, x: cur.x * 2, y: cur.y * 2 + 1 },
        { level: n, x: cur.x * 2 + 1, y: cur.y * 2 + 1 },
      );
    }
  }
  return out;
}

/** 本番 RJAA→RJTT 冷キャッシュで Console に出た欠損タイル例 */
export const RJTT_ROUTE_BARREN_DEM_SEEDS = [
  '5/29/12',
  '7/112/48',
  '13/7278/3230',
  '13/7279/3230',
  '14/14555/6458',
  '14/14555/6459',
  '14/14557/6456',
  '15/29108/12915',
  '15/29109/12917',
  '15/29110/12915',
  '15/29110/12916',
  '15/29112/12917',
] as const;

/** 手動 QA（production 冷キャッシュ）で観測された 404 件数 */
export const OBSERVED_RJTT_PRODUCTION_DEM_404 = 128;

const RJTT_FRUSTUM_ROOTS = ['5/29/12', '7/112/48', '13/7278/3230', '13/7279/3230'] as const;

/**
 * RJAA→RJTT シナリオの before/after 見積もり。
 * before = 本番観測値。after = 最適化後のモデル（inherit + 非 refinement + dedupe）。
 */
export function estimateRjttRouteDem404BeforeAfter(maxLevel: number = 15): {
  observedProductionBefore: number;
  modeledAfterAttempts: number;
  modeledAfterWorstCaseSeeds: number;
  theoreticalOldRefineUpperBound: number;
} {
  const barrenKeys = new Set(RJTT_ROUTE_BARREN_DEM_SEEDS);
  const modeledAfterAttempts = countSimulatedDemNetworkAttempts({
    barrenKeys,
    maxLevel,
    rootKeys: [...RJTT_FRUSTUM_ROOTS],
    refineAfterBarren: false,
    inheritParentBarren: true,
    dedupeFetches: true,
  });
  const modeledAfterWorstCaseSeeds = RJTT_ROUTE_BARREN_DEM_SEEDS.length;
  const theoreticalOldRefineUpperBound = countSimulatedDemNetworkAttempts({
    barrenKeys: expandBarrenTileSubtree(RJTT_ROUTE_BARREN_DEM_SEEDS, maxLevel),
    maxLevel,
    rootKeys: [...RJTT_FRUSTUM_ROOTS],
    refineAfterBarren: true,
    inheritParentBarren: false,
    dedupeFetches: false,
  });
  return {
    observedProductionBefore: OBSERVED_RJTT_PRODUCTION_DEM_404,
    modeledAfterAttempts,
    modeledAfterWorstCaseSeeds,
    theoreticalOldRefineUpperBound,
  };
}
