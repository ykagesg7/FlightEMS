export type AltitudeBandFt = {
  minFt: number;
  maxFt: number;
};

/** 教育用: UNL は仮の天井（FL600 相当） */
export const UNL_FT = 60_000;

/** 空のトークンは null。不明な文字列も null（SFC-UNL の穴埋めは呼び出し側）。 */
export function parseAltitudeTokenFt(tok: string | undefined | null): number | null {
  const t = (tok ?? '').trim().toUpperCase().replace(/,/g, '');
  if (!t) return null;
  if (t === 'SFC') return 0;
  if (t === 'UNL') return UNL_FT;
  const fl = t.match(/^FL(\d+)$/);
  if (fl) return Number(fl[1]) * 100;
  const ft = t.match(/^(\d+)\s*FT$/);
  if (ft) return Number(ft[1]);
  const bare = t.match(/^(\d+)$/);
  if (bare) return Number(bare[1]);
  return null;
}

/**
 * RAPCON / ACC の Floor + Ceiling。両方空なら null（立体にしない）。
 */
export function parseFloorCeilingFt(
  floor: string | undefined | null,
  ceiling: string | undefined | null,
): AltitudeBandFt | null {
  const minFt = parseAltitudeTokenFt(floor);
  const maxFt = parseAltitudeTokenFt(ceiling);
  if (minFt == null && maxFt == null) return null;
  const lo = minFt ?? 0;
  const hi = maxFt ?? UNL_FT;
  return { minFt: Math.min(lo, hi), maxFt: Math.max(lo, hi) };
}

/**
 * 空域の高度文字列をフィート帯にパースする（教育用モデル）。
 * 例: SFC-FL350, FL240-FL800, SFC-UNL, SFC-9,000ft
 */
export function parseAltitudeBandFt(altitude: string | undefined | null): AltitudeBandFt {
  const raw = (altitude ?? 'SFC-UNL').trim().toUpperCase();
  const dash = raw.indexOf('-');
  if (dash < 0) {
    return { minFt: 0, maxFt: UNL_FT };
  }
  const minTok = raw.slice(0, dash).trim();
  const maxTok = raw.slice(dash + 1).trim();
  return {
    minFt: parseAltitudeTokenFt(minTok) ?? 0,
    maxFt: parseAltitudeTokenFt(maxTok) ?? UNL_FT,
  };
}

export function feetToMeters(ft: number): number {
  return ft * 0.3048;
}
