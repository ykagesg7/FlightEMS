import type { VerticalRatePoint, VerticalSegmentProfile } from '../../../types';
import { calculateAirspeeds, calculateTASFromMachPrecise } from '../../../utils';

export function interpolateRateFpm(table: VerticalRatePoint[], altitudeFt: number): number {
  if (table.length === 0) return 0;
  const sorted = [...table].sort((a, b) => a.altitudeFt - b.altitudeFt);
  if (altitudeFt <= sorted[0].altitudeFt) return sorted[0].fpm;
  const last = sorted[sorted.length - 1];
  if (altitudeFt >= last.altitudeFt) return last.fpm;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (altitudeFt >= a.altitudeFt && altitudeFt <= b.altitudeFt) {
      const t = (altitudeFt - a.altitudeFt) / Math.max(1, b.altitudeFt - a.altitudeFt);
      return a.fpm + t * (b.fpm - a.fpm);
    }
  }
  return last.fpm;
}

export function interpolateFuelFlowLbPerHr(
  table: Array<{ altitudeFt: number; lbPerHr: number }> | undefined,
  altitudeFt: number,
  fallback: number,
): number {
  if (!table || table.length === 0) return fallback;
  const sorted = [...table].sort((a, b) => a.altitudeFt - b.altitudeFt);
  if (altitudeFt <= sorted[0].altitudeFt) return sorted[0].lbPerHr;
  const last = sorted[sorted.length - 1];
  if (altitudeFt >= last.altitudeFt) return last.lbPerHr;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (altitudeFt >= a.altitudeFt && altitudeFt <= b.altitudeFt) {
      const t = (altitudeFt - a.altitudeFt) / Math.max(1, b.altitudeFt - a.altitudeFt);
      return a.lbPerHr + t * (b.lbPerHr - a.lbPerHr);
    }
  }
  return fallback;
}

function tasKtAt(
  casKt: number,
  altitudeFt: number,
  groundTempC: number,
  groundElevationFt: number,
  targetMach?: number,
): number | null {
  const result = calculateAirspeeds(casKt, altitudeFt, groundTempC, groundElevationFt);
  if (!result) return null;
  if (targetMach != null && result.mach > targetMach) {
    return calculateTASFromMachPrecise(targetMach, altitudeFt, groundTempC, groundElevationFt);
  }
  return result.tasKt;
}

export type VerticalIntegration = {
  distanceNm: number;
  timeMin: number;
  fuelLb: number;
};

const STEP_FT = 1000;

/**
 * 上昇: 高度帯ごとに TAS と上昇率で距離・時間・燃料を積分する。
 */
export function integrateClimb(
  fromAltFt: number,
  toAltFt: number,
  profile: VerticalSegmentProfile,
  groundTempC: number,
  groundElevationFt: number,
): VerticalIntegration {
  if (toAltFt <= fromAltFt) return { distanceNm: 0, timeMin: 0, fuelLb: 0 };
  let distanceNm = 0;
  let timeMin = 0;
  for (let alt = fromAltFt; alt < toAltFt; alt += STEP_FT) {
    const next = Math.min(toAltFt, alt + STEP_FT);
    const mid = (alt + next) / 2;
    const dAlt = next - alt;
    const fpm = Math.max(1, interpolateRateFpm(profile.ratesFpm, mid));
    const minutes = dAlt / fpm;
    const tas = tasKtAt(profile.targetCasKt, mid, groundTempC, groundElevationFt, profile.targetMach);
    if (tas != null && tas > 0) {
      distanceNm += (tas * minutes) / 60;
    }
    timeMin += minutes;
  }
  const fuelLb = (profile.fuelFlowLbPerHr * timeMin) / 60;
  return { distanceNm, timeMin, fuelLb };
}

/**
 * 降下: 上昇と同じく高度帯ごとに TAS と降下率で積分する。
 *
 * 3:1（1000 ft あたり 3 nm）の目安は使わない。教官提供の降下率が標準 3000 fpm /
 * アイドル 6000 fpm と大きく異なり、率を無視すると降下モードの選択が
 * TOD にも燃料にも反映されなくなるため。
 */
export function integrateDescent(
  fromAltFt: number,
  toAltFt: number,
  profile: VerticalSegmentProfile,
  groundTempC: number,
  groundElevationFt: number,
): VerticalIntegration {
  if (fromAltFt <= toAltFt) return { distanceNm: 0, timeMin: 0, fuelLb: 0 };
  let distanceNm = 0;
  let timeMin = 0;
  for (let alt = fromAltFt; alt > toAltFt; alt -= STEP_FT) {
    const next = Math.max(toAltFt, alt - STEP_FT);
    const mid = (alt + next) / 2;
    const dAlt = alt - next;
    const fpm = Math.max(1, interpolateRateFpm(profile.ratesFpm, mid));
    const minutes = dAlt / fpm;
    const tas = tasKtAt(profile.targetCasKt, mid, groundTempC, groundElevationFt, profile.targetMach);
    if (tas != null && tas > 0) {
      distanceNm += (tas * minutes) / 60;
    }
    timeMin += minutes;
  }
  const fuelLb = (profile.fuelFlowLbPerHr * timeMin) / 60;
  return { distanceNm, timeMin, fuelLb };
}

export type VerticalProfilePlan = {
  climb: VerticalIntegration;
  descent: VerticalIntegration;
  tocDistanceNm: number;
  todDistanceNm: number;
  totalDistanceNm: number;
  hasCruise: boolean;
};

export function planClimbDescent(
  totalDistanceNm: number,
  departureElevFt: number,
  arrivalElevFt: number,
  cruiseAltFt: number,
  climb: VerticalSegmentProfile,
  descent: VerticalSegmentProfile,
  groundTempC: number,
  groundElevationFt: number,
): VerticalProfilePlan {
  const climbInt = integrateClimb(departureElevFt, cruiseAltFt, climb, groundTempC, groundElevationFt);
  const descentInt = integrateDescent(cruiseAltFt, arrivalElevFt, descent, groundTempC, groundElevationFt);
  let climbDist = climbInt.distanceNm;
  let descentDist = descentInt.distanceNm;
  let hasCruise = true;
  if (climbDist + descentDist > totalDistanceNm && totalDistanceNm > 0) {
    hasCruise = false;
    const scale = totalDistanceNm / (climbDist + descentDist);
    climbDist *= scale;
    descentDist *= scale;
  }
  const tocDistanceNm = Math.min(totalDistanceNm, climbDist);
  const todDistanceNm = Math.max(tocDistanceNm, totalDistanceNm - descentDist);
  return {
    climb: climbInt,
    descent: descentInt,
    tocDistanceNm,
    todDistanceNm,
    totalDistanceNm,
    hasCruise,
  };
}
