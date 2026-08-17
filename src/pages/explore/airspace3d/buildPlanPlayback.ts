import type { Airport, FlightPlan, Waypoint } from '../../../types';
import { calculateDistance } from '../../../utils';
import type { PlaybackPoint } from './playbackTrack';

type RouteNode = Pick<Airport, 'latitude' | 'longitude'> | Pick<Waypoint, 'latitude' | 'longitude'>;

function hasLatLon(n: RouteNode | undefined | null): n is RouteNode {
  return (
    !!n &&
    typeof n.latitude === 'number' &&
    typeof n.longitude === 'number' &&
    Number.isFinite(n.latitude) &&
    Number.isFinite(n.longitude)
  );
}

function elevFt(plan: FlightPlan): number {
  const fromDep = plan.departure?.properties?.['Elev(ft)'];
  const n = typeof fromDep === 'number' ? fromDep : Number(fromDep);
  if (Number.isFinite(n) && n >= 0) return n;
  if (Number.isFinite(plan.groundElevationFt) && plan.groundElevationFt >= 0) {
    return plan.groundElevationFt;
  }
  return 0;
}

/**
 * Planning 下書きから教育用の疑似再生点列を作る。
 * レグの高度・地速（なければ TAS/CAS）で時刻を割り当て、高度はレグ内で線形補間する。
 */
export function buildPlanPlaybackPoints(plan: FlightPlan): PlaybackPoint[] | null {
  const nodes: RouteNode[] = [];
  if (hasLatLon(plan.departure)) nodes.push(plan.departure);
  for (const wp of plan.waypoints ?? []) {
    if (hasLatLon(wp)) nodes.push(wp);
  }
  if (hasLatLon(plan.arrival)) nodes.push(plan.arrival);
  if (nodes.length < 2) return null;

  const points: PlaybackPoint[] = [];
  let tSec = 0;
  let altFt = elevFt(plan);

  points.push({
    lon: nodes[0]!.longitude,
    lat: nodes[0]!.latitude,
    altFt,
    tSec: 0,
  });

  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i]!;
    const to = nodes[i + 1]!;
    const seg = plan.routeSegments[i];
    const distNm =
      seg?.distance && Number.isFinite(seg.distance) && seg.distance > 0
        ? seg.distance
        : calculateDistance(from.latitude, from.longitude, to.latitude, to.longitude);
    const gsKt =
      (typeof seg?.groundSpeedKt === 'number' && seg.groundSpeedKt > 0 && seg.groundSpeedKt) ||
      (typeof seg?.speed === 'number' && seg.speed > 0 && seg.speed) ||
      (plan.speed > 0 ? plan.speed : 180);
    const durationSec = Math.max(30, (distNm / gsKt) * 3600);
    const altEnd =
      typeof seg?.altitude === 'number' && Number.isFinite(seg.altitude) && seg.altitude > 0
        ? seg.altitude
        : plan.altitude > 0
          ? plan.altitude
          : altFt;

    const steps = Math.max(2, Math.min(12, Math.round(durationSec / 45)));
    for (let s = 1; s <= steps; s++) {
      const u = s / steps;
      tSec += durationSec / steps;
      points.push({
        lon: from.longitude + (to.longitude - from.longitude) * u,
        lat: from.latitude + (to.latitude - from.latitude) * u,
        altFt: altFt + (altEnd - altFt) * u,
        tSec,
      });
    }
    altFt = altEnd;
  }

  return points.length >= 2 ? points : null;
}
