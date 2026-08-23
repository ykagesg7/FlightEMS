import { tailwindComponentKt } from './windComponents';

export interface WindTriangleSolution {
  groundSpeedKt: number;
  windCorrectionAngleDeg: number;
  trueHeadingDeg: number;
  unsolvable: boolean;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** 右からの横風を正（kt）。風向・針路は真方位。 */
export function crosswindComponentKt(windFromDeg: number, windSpeedKt: number, trackDeg: number): number {
  if (!Number.isFinite(windFromDeg) || !Number.isFinite(windSpeedKt) || !Number.isFinite(trackDeg)) {
    return NaN;
  }
  return windSpeedKt * Math.sin(toRad(windFromDeg - trackDeg));
}

/**
 * 真対気速度・真コース・真風向から地速と偏流修正角を求める。
 * WCA は右修正を正。|横風| >= TAS のときは unsolvable。
 */
export function solveWindTriangle(
  tasKt: number,
  trueCourseDeg: number,
  windFromDeg: number,
  windSpeedKt: number,
  minGsKt = 20,
): WindTriangleSolution {
  const fallbackGs = Math.max(minGsKt, Number.isFinite(tasKt) ? tasKt : 0);
  const fallback: WindTriangleSolution = {
    groundSpeedKt: fallbackGs,
    windCorrectionAngleDeg: 0,
    trueHeadingDeg: normalizeDeg(trueCourseDeg),
    unsolvable: true,
  };

  if (
    !Number.isFinite(tasKt) ||
    tasKt <= 0 ||
    !Number.isFinite(trueCourseDeg) ||
    !Number.isFinite(windFromDeg) ||
    !Number.isFinite(windSpeedKt)
  ) {
    return fallback;
  }

  const xw = crosswindComponentKt(windFromDeg, windSpeedKt, trueCourseDeg);
  if (!Number.isFinite(xw)) return fallback;

  if (Math.abs(xw) >= tasKt) {
    return fallback;
  }

  const wcaRad = Math.asin(xw / tasKt);
  const wcaDeg = (wcaRad * 180) / Math.PI;
  const tw = tailwindComponentKt(windFromDeg, windSpeedKt, trueCourseDeg);
  const gs = Math.max(minGsKt, tasKt * Math.cos(wcaRad) + (Number.isFinite(tw) ? tw : 0));

  return {
    groundSpeedKt: gs,
    windCorrectionAngleDeg: wcaDeg,
    trueHeadingDeg: normalizeDeg(trueCourseDeg + wcaDeg),
    unsolvable: false,
  };
}
