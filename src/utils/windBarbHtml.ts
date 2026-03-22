/**
 * 吹いてくる方位 windFromDeg（真方位）に対し、**流れの向き**を指す矢印用の CSS rotate(deg)。
 * SVG の矢印は +x（画面上は東＝方位 90°）を向いている。CSS の rotate は時計回りで、
 * 結果の地理方位は (90 + rotateDeg) mod 360。流れ方位 F = (windFrom + 180) mod 360 なので
 * rotateDeg = (F - 90 + 360) mod 360 = (windFrom + 90 + 360) mod 360。
 */
export function windToRotationCssDeg(windFromDeg: number): number {
  return ((windFromDeg + 90) % 360 + 360) % 360;
}

export function buildWindBarbDivHtml(windFromDeg: number, speedKt: number, sizePx = 36): string {
  const rot = windToRotationCssDeg(windFromDeg);
  const len = Math.min(22, 10 + Math.min(speedKt, 120) / 8);
  const w = sizePx;
  const h = sizePx;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${len + 6}" height="6" viewBox="0 0 ${len + 6} 6" aria-hidden="true"><line x1="0" y1="3" x2="${len}" y2="3" stroke="#7dd3fc" stroke-width="2"/><polygon points="${len + 5},3 ${len - 4},0 ${len - 4},6" fill="#38bdf8" stroke="#0ea5e9" stroke-width="0.5"/></svg>`;
  return `<div class="wind-barb-icon" style="position:relative;width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;transform:rotate(${rot}deg);pointer-events:none;opacity:0.88">${svg}<span class="wind-barb-kt" style="position:absolute;bottom:0;right:0;font-size:7px;color:#e0f2fe;text-shadow:0 0 2px #000">${Math.round(speedKt)}</span></div>`;
}
