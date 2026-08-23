import type { AircraftPreset, FlightPlan, RouteSegment, RouteSegmentPhase } from '../../../types';
import { calculateAirspeeds, calculateDistance, calculateETA, calculateETE, formatTime } from '../../../utils';
import { calculateTrueBearing, trueToMagneticDeg } from '../../../utils/bearing';
import { interpolateJapanMagneticVariationWestDeg } from '../../../utils/japanMagneticVariation';
import { ROUTE_GS_MIN_KT } from '../../../utils/routeOpenMeteoWind';
import { solveWindTriangle } from '../../../utils/windTriangle';
import { getAircraftPreset, resolveAircraftPreset } from '../../../data/aircraftPresets';
import { interpolateFuelFlowLbPerHr, planClimbDescent } from './computeVerticalProfile';
import { interpolateLatLon, segmentOverrideKey, type NavPoint } from './navPoints';

export type NavLogWind = {
  windFromDeg: number;
  windSpeedKt: number;
};

export type NavLogInput = {
  plan: Pick<
    FlightPlan,
    | 'speed'
    | 'altitude'
    | 'departureTime'
    | 'groundTempC'
    | 'groundElevationFt'
    | 'segmentOverrides'
    | 'aircraftId'
    | 'initialFuelLb'
    | 'taxiFuelLb'
    | 'reserveFuelLb'
    | 'cruiseFuelFlowLbPerHr'
    | 'alternateFuelLb'
    | 'performanceOverrides'
    | 'descentMode'
  >;
  points: NavPoint[];
  winds?: Array<NavLogWind | null | undefined>;
  frequencies?: Array<{ frequency?: string; frequencySourceId?: string } | undefined>;
  preset?: AircraftPreset;
  includeVerticalProfile?: boolean;
};

export type NavLog = {
  segments: RouteSegment[];
  totalDistanceNm: number;
  ete: string;
  eta: string;
  tasKt: number;
  mach: number;
  totalFuelUsedLb: number;
  totalFuelRemainingLb: number;
  reserveFuelLb: number;
  alternateFuelLb: number;
  fuelBelowReserve: boolean;
  /** 巡航高度が実用上昇限度を超えている */
  aboveServiceCeiling: boolean;
  /** 初期燃料が最大搭載量を超えている */
  aboveMaxFuel: boolean;
  tocDistanceNm?: number;
  todDistanceNm?: number;
};

type GeometricLeg = {
  from: string;
  to: string;
  fromPt: NavPoint;
  toPt: NavPoint;
  distanceNm: number;
  trueCourseDeg: number;
  variationDeg: number;
};

function buildGeometricLegs(points: NavPoint[]): GeometricLeg[] {
  const legs: GeometricLeg[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const midLat = (a.latitude + b.latitude) / 2;
    const midLon = (a.longitude + b.longitude) / 2;
    const variationDeg = interpolateJapanMagneticVariationWestDeg(midLat, midLon);
    legs.push({
      from: a.id,
      to: b.id,
      fromPt: a,
      toPt: b,
      distanceNm: calculateDistance(a.latitude, a.longitude, b.latitude, b.longitude),
      trueCourseDeg: calculateTrueBearing(a.latitude, a.longitude, b.latitude, b.longitude),
      variationDeg,
    });
  }
  return legs;
}

type SubLeg = {
  from: string;
  to: string;
  fromPt: NavPoint;
  toPt: NavPoint;
  distanceNm: number;
  trueCourseDeg: number;
  variationDeg: number;
  phase: RouteSegmentPhase;
  startAltitudeFt: number;
  endAltitudeFt: number;
  casKt: number;
  overrideKey: string;
  geometricIndex: number;
};

function splitLegsForVertical(
  legs: GeometricLeg[],
  cruiseCas: number,
  cruiseAlt: number,
  overrides: FlightPlan['segmentOverrides'],
  includeVertical: boolean,
  preset: AircraftPreset | undefined,
  groundTempC: number,
  groundElevationFt: number,
  departureElevFt: number,
  arrivalElevFt: number,
): { subLegs: SubLeg[]; tocDistanceNm?: number; todDistanceNm?: number } {
  const totalDistanceNm = legs.reduce((s, l) => s + l.distanceNm, 0);
  const climbProf = preset?.climb;
  const descentProf = preset?.descent;
  const canVertical =
    includeVertical &&
    climbProf != null &&
    descentProf != null &&
    totalDistanceNm > 0 &&
    cruiseAlt > departureElevFt;

  const profile = canVertical
    ? planClimbDescent(
        totalDistanceNm,
        departureElevFt,
        arrivalElevFt,
        cruiseAlt,
        climbProf,
        descentProf,
        groundTempC,
        groundElevationFt,
      )
    : null;

  const subLegs: SubLeg[] = [];
  let cumulative = 0;

  for (let gi = 0; gi < legs.length; gi++) {
    const leg = legs[gi];
    const overrideKey = segmentOverrideKey(leg.from, leg.to);
    const ovr = overrides?.[overrideKey];
    const baseCas = ovr?.casKt != null && ovr.casKt > 0 ? ovr.casKt : cruiseCas;
    const baseAlt = ovr?.altitudeFt != null && ovr.altitudeFt >= 0 ? ovr.altitudeFt : cruiseAlt;
    const legStart = cumulative;
    const legEnd = cumulative + leg.distanceNm;

    if (!profile) {
      subLegs.push({
        from: leg.from,
        to: leg.to,
        fromPt: leg.fromPt,
        toPt: leg.toPt,
        distanceNm: leg.distanceNm,
        trueCourseDeg: leg.trueCourseDeg,
        variationDeg: leg.variationDeg,
        phase: 'cruise',
        startAltitudeFt: baseAlt,
        endAltitudeFt: baseAlt,
        casKt: baseCas,
        overrideKey,
        geometricIndex: gi,
      });
      cumulative = legEnd;
      continue;
    }

    const cuts: Array<{ at: number; label: string }> = [];
    if (profile.tocDistanceNm > legStart + 0.05 && profile.tocDistanceNm < legEnd - 0.05) {
      cuts.push({ at: profile.tocDistanceNm, label: 'TOC' });
    }
    if (
      profile.todDistanceNm > legStart + 0.05 &&
      profile.todDistanceNm < legEnd - 0.05 &&
      Math.abs(profile.todDistanceNm - profile.tocDistanceNm) > 0.05
    ) {
      cuts.push({ at: profile.todDistanceNm, label: 'TOD' });
    }
    cuts.sort((a, b) => a.at - b.at);

    const boundaries = [legStart, ...cuts.map((c) => c.at), legEnd];
    const labels = [leg.from, ...cuts.map((c) => c.label), leg.to];

    for (let i = 0; i < boundaries.length - 1; i++) {
      const aNm = boundaries[i];
      const bNm = boundaries[i + 1];
      const dist = bNm - aNm;
      if (dist < 0.001) continue;
      const fa = (aNm - legStart) / Math.max(leg.distanceNm, 1e-6);
      const fb = (bNm - legStart) / Math.max(leg.distanceNm, 1e-6);
      const fromPt =
        i === 0
          ? leg.fromPt
          : { id: labels[i], ...interpolateLatLon(leg.fromPt.latitude, leg.fromPt.longitude, leg.toPt.latitude, leg.toPt.longitude, fa) };
      const toPt =
        i === boundaries.length - 2
          ? leg.toPt
          : { id: labels[i + 1], ...interpolateLatLon(leg.fromPt.latitude, leg.fromPt.longitude, leg.toPt.latitude, leg.toPt.longitude, fb) };

      let phase: RouteSegmentPhase = 'cruise';
      let startAlt = baseAlt;
      let endAlt = baseAlt;
      let cas = baseCas;
      if (bNm <= profile.tocDistanceNm + 0.05) {
        phase = 'climb';
        const climbFrac0 = profile.tocDistanceNm > 0 ? aNm / profile.tocDistanceNm : 0;
        const climbFrac1 = profile.tocDistanceNm > 0 ? bNm / profile.tocDistanceNm : 1;
        startAlt = departureElevFt + (baseAlt - departureElevFt) * climbFrac0;
        endAlt = departureElevFt + (baseAlt - departureElevFt) * climbFrac1;
        cas = climbProf?.targetCasKt ?? baseCas;
      } else if (aNm >= profile.todDistanceNm - 0.05) {
        phase = 'descent';
        const descentLen = Math.max(0.001, totalDistanceNm - profile.todDistanceNm);
        const d0 = (aNm - profile.todDistanceNm) / descentLen;
        const d1 = (bNm - profile.todDistanceNm) / descentLen;
        startAlt = baseAlt + (arrivalElevFt - baseAlt) * d0;
        endAlt = baseAlt + (arrivalElevFt - baseAlt) * d1;
        cas = descentProf?.targetCasKt ?? baseCas;
      }

      subLegs.push({
        from: labels[i],
        to: labels[i + 1],
        fromPt,
        toPt,
        distanceNm: dist,
        trueCourseDeg: leg.trueCourseDeg,
        variationDeg: leg.variationDeg,
        phase,
        startAltitudeFt: startAlt,
        endAltitudeFt: endAlt,
        casKt: cas,
        overrideKey,
        geometricIndex: gi,
      });
    }
    cumulative = legEnd;
  }

  return {
    subLegs,
    tocDistanceNm: profile?.tocDistanceNm,
    todDistanceNm: profile?.todDistanceNm,
  };
}

export function computeNavLog(input: NavLogInput): NavLog {
  const {
    plan,
    points,
    winds,
    frequencies,
    includeVerticalProfile = false,
  } = input;
  const preset = resolveAircraftPreset(
    input.preset ?? getAircraftPreset(plan.aircraftId),
    plan.performanceOverrides,
    plan.descentMode ?? 'standard',
  );
  const cruiseCas = plan.speed;
  const cruiseAlt = plan.altitude;
  const groundTempC = plan.groundTempC;
  const groundElevationFt = plan.groundElevationFt;
  const departureElevFt = points[0]?.elevationFt ?? groundElevationFt ?? 0;
  const arrivalElevFt = points[points.length - 1]?.elevationFt ?? 0;

  const cruiseAir = calculateAirspeeds(cruiseCas, cruiseAlt, groundTempC, groundElevationFt);
  const tasKt = cruiseAir?.tasKt ?? 0;
  const mach = cruiseAir?.mach ?? 0;

  const initialFuelLb = plan.initialFuelLb ?? preset?.defaultInitialFuelLb ?? 0;
  const aboveServiceCeiling =
    preset?.serviceCeilingFt != null && cruiseAlt > preset.serviceCeilingFt;
  const aboveMaxFuel = preset?.maxFuelLb != null && initialFuelLb > preset.maxFuelLb;

  if (points.length < 2) {
    return {
      segments: [],
      totalDistanceNm: 0,
      ete: '',
      eta: '',
      tasKt,
      mach,
      totalFuelUsedLb: 0,
      totalFuelRemainingLb: initialFuelLb,
      reserveFuelLb: plan.reserveFuelLb ?? preset?.reserveFuelLb ?? 0,
      alternateFuelLb: plan.alternateFuelLb ?? preset?.alternateFuelLb ?? 0,
      fuelBelowReserve: false,
      aboveServiceCeiling,
      aboveMaxFuel,
    };
  }

  const geometric = buildGeometricLegs(points);
  const { subLegs, tocDistanceNm, todDistanceNm } = splitLegsForVertical(
    geometric,
    cruiseCas,
    cruiseAlt,
    plan.segmentOverrides,
    includeVerticalProfile,
    preset,
    groundTempC,
    groundElevationFt,
    departureElevFt,
    arrivalElevFt,
  );

  const taxiFuel = plan.taxiFuelLb ?? preset?.taxiFuelLb ?? 0;
  const reserveFuel = plan.reserveFuelLb ?? preset?.reserveFuelLb ?? 0;
  const alternateFuel = plan.alternateFuelLb ?? preset?.alternateFuelLb ?? 0;
  const initialFuel = initialFuelLb;
  const defaultCruiseFf = plan.cruiseFuelFlowLbPerHr ?? preset?.cruiseFuelFlowLbPerHr ?? 0;

  let remainingFuel = initialFuel - taxiFuel;
  let totalFuelUsed = taxiFuel;
  let cumulativeEte = 0;
  const segments: RouteSegment[] = [];
  let totalDistanceNm = 0;

  for (const sub of subLegs) {
    const midAlt = (sub.startAltitudeFt + sub.endAltitudeFt) / 2;
    const air = calculateAirspeeds(sub.casKt, midAlt, groundTempC, groundElevationFt);
    const tas = air?.tasKt ?? 0;
    const wind = winds?.[sub.geometricIndex];
    let gs = tas;
    let wca = 0;
    let trueHeading = sub.trueCourseDeg;
    let windUnsolvable = false;
    let windFromDeg: number | undefined;
    let windSpeedKt: number | undefined;

    if (wind && Number.isFinite(wind.windFromDeg) && Number.isFinite(wind.windSpeedKt) && tas > 0) {
      const tri = solveWindTriangle(tas, sub.trueCourseDeg, wind.windFromDeg, wind.windSpeedKt, ROUTE_GS_MIN_KT);
      gs = tri.groundSpeedKt;
      wca = tri.windCorrectionAngleDeg;
      trueHeading = tri.trueHeadingDeg;
      windUnsolvable = tri.unsolvable;
      windFromDeg = wind.windFromDeg;
      windSpeedKt = wind.windSpeedKt;
    }

    const segmentEteMinutes = tas > 0 ? (sub.distanceNm / Math.max(gs, ROUTE_GS_MIN_KT)) * 60 : calculateETE(sub.distanceNm, tas);
    cumulativeEte += segmentEteMinutes;
    const eta = calculateETA(plan.departureTime, cumulativeEte);

    let ff = defaultCruiseFf;
    if (sub.phase === 'climb' && preset?.climb) ff = preset.climb.fuelFlowLbPerHr;
    else if (sub.phase === 'descent' && preset?.descent) ff = preset.descent.fuelFlowLbPerHr;
    else ff = interpolateFuelFlowLbPerHr(preset?.cruiseFuelFlowByAltitude, midAlt, defaultCruiseFf);

    const fuelUsed = ff * (segmentEteMinutes / 60);
    remainingFuel -= fuelUsed;
    totalFuelUsed += fuelUsed;

    const magCourse = trueToMagneticDeg(sub.trueCourseDeg, sub.variationDeg);
    const magHeading = trueToMagneticDeg(trueHeading, sub.variationDeg);
    const dAlt = sub.endAltitudeFt - sub.startAltitudeFt;
    const vsFpm = segmentEteMinutes > 0 ? dAlt / segmentEteMinutes : 0;

    const freq = frequencies?.[sub.geometricIndex];
    const seg: RouteSegment = {
      from: sub.from,
      to: sub.to,
      speed: sub.casKt,
      bearing: magCourse,
      altitude: Math.round((sub.startAltitudeFt + sub.endAltitudeFt) / 2),
      eta,
      distance: sub.distanceNm,
      duration: formatTime(segmentEteMinutes),
      fuelUsedLb: fuelUsed,
      fuelRemainingLb: remainingFuel,
      phase: sub.phase,
      trueCourseDeg: sub.trueCourseDeg,
      magneticCourseDeg: magCourse,
      magneticVariationDeg: sub.variationDeg,
      windCorrectionAngleDeg: wca,
      trueHeadingDeg: trueHeading,
      magneticHeadingDeg: magHeading,
      startAltitudeFt: sub.startAltitudeFt,
      endAltitudeFt: sub.endAltitudeFt,
      verticalSpeedFpm: vsFpm,
      fuelFlowLbPerHr: ff,
      overrideKey: sub.overrideKey,
    };
    if (freq?.frequency) {
      seg.frequency = freq.frequency;
      seg.frequencySourceId = freq.frequencySourceId;
    }
    if (windFromDeg != null && windSpeedKt != null) {
      seg.windFromDeg = windFromDeg;
      seg.windSpeedKt = windSpeedKt;
      seg.groundSpeedKt = gs;
    }
    if (windUnsolvable) seg.windUnsolvable = true;
    segments.push(seg);
    totalDistanceNm += sub.distanceNm;
  }

  const eteMinutes = cumulativeEte;
  return {
    segments,
    totalDistanceNm,
    ete: formatTime(eteMinutes),
    eta: calculateETA(plan.departureTime, eteMinutes),
    tasKt,
    mach,
    totalFuelUsedLb: totalFuelUsed,
    totalFuelRemainingLb: remainingFuel,
    reserveFuelLb: reserveFuel,
    alternateFuelLb: alternateFuel,
    fuelBelowReserve: remainingFuel < reserveFuel + alternateFuel,
    aboveServiceCeiling,
    aboveMaxFuel,
    tocDistanceNm,
    todDistanceNm,
  };
}

export function applyNavLogToPlan(plan: FlightPlan, log: NavLog): FlightPlan {
  return {
    ...plan,
    totalDistance: log.totalDistanceNm,
    ete: log.ete,
    eta: log.eta,
    tas: log.tasKt,
    mach: log.mach,
    routeSegments: log.segments,
    totalFuelUsedLb: log.totalFuelUsedLb,
    totalFuelRemainingLb: log.totalFuelRemainingLb,
  };
}
