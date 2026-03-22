/**
 * 気象風（吹いてくる方位）と進行方位から、沿線の風成分を求める。
 * 正の値は追い風（進行方向への射影が風速ベクトルと同向き）。
 */

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * @param windFromDeg 風向（真方位、どこから吹くか）°
 * @param windSpeedKt 風速 kt
 * @param trackDeg 進行方位（真方位）°
 */
export function tailwindComponentKt(windFromDeg: number, windSpeedKt: number, trackDeg: number): number {
  if (!Number.isFinite(windFromDeg) || !Number.isFinite(windSpeedKt) || !Number.isFinite(trackDeg)) {
    return NaN;
  }
  const r = toRad(windFromDeg);
  const u = -windSpeedKt * Math.sin(r);
  const v = -windSpeedKt * Math.cos(r);
  const tr = toRad(trackDeg);
  const tx = Math.sin(tr);
  const ty = Math.cos(tr);
  return u * tx + v * ty;
}
