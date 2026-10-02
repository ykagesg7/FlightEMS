import type { Waypoint3D } from './types';

/** フィート → メートル（国際フィート） */
export function feetToMeters(altFt: number): number {
  return altFt * 0.3048;
}

/** 3D プレビュー用カメラ高度オフセット（計画高度は変更しない） */
export function applyPreviewAltitudeOffset(altFt: number, offsetFt: number): number {
  return altFt + offsetFt;
}

export type FlightPathSample = {
  lon: number;
  lat: number;
  altFt: number;
  /** ルート全体に対する 0–1 */
  fraction: number;
  headingDeg: number;
};

export type PlaybackPoint3D = {
  lon: number;
  lat: number;
  altFt: number;
  tSec: number;
};

function segmentHeadingDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1r = (lat1 * Math.PI) / 180;
  const lat2r = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2r);
  const x =
    Math.cos(lat1r) * Math.sin(lat2r) -
    Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

function haversineNm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const r = 3440.065;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * ウェイポイント列から再生用の密な点列と総時間（秒）を生成する。
 */
export function buildPlaybackPointsFromWaypoints(
  waypoints: Waypoint3D[],
  defaultSpeedKts = 120,
): { points: PlaybackPoint3D[]; totalSec: number } {
  if (waypoints.length < 2) {
    const only = waypoints[0];
    const pt: PlaybackPoint3D = only
      ? { lon: only.lon, lat: only.lat, altFt: only.altFt, tSec: 0 }
      : { lon: 0, lat: 0, altFt: 0, tSec: 0 };
    return { points: [pt], totalSec: 0 };
  }

  const points: PlaybackPoint3D[] = [];
  let tSec = 0;
  const first = waypoints[0]!;
  points.push({ lon: first.lon, lat: first.lat, altFt: first.altFt, tSec: 0 });

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i]!;
    const to = waypoints[i + 1]!;
    const gs =
      (typeof from.speedKts === 'number' && from.speedKts > 0 && from.speedKts) ||
      (typeof to.speedKts === 'number' && to.speedKts > 0 && to.speedKts) ||
      defaultSpeedKts;
    const distNm = haversineNm(from.lat, from.lon, to.lat, to.lon);
    const durationSec = Math.max(20, (distNm / gs) * 3600);
    const steps = Math.max(2, Math.min(16, Math.round(durationSec / 30)));
    for (let s = 1; s <= steps; s++) {
      const u = s / steps;
      tSec += durationSec / steps;
      points.push({
        lon: from.lon + (to.lon - from.lon) * u,
        lat: from.lat + (to.lat - from.lat) * u,
        altFt: from.altFt + (to.altFt - from.altFt) * u,
        tSec,
      });
    }
  }

  const totalSec = points[points.length - 1]?.tSec ?? 0;
  return { points, totalSec };
}

/** 再生点列上の時刻 tSec に対する姿勢を補間 */
export function interpolatePlaybackAtTime(
  points: PlaybackPoint3D[],
  tSec: number,
): Pick<FlightPathSample, 'lon' | 'lat' | 'altFt' | 'headingDeg' | 'fraction'> {
  if (points.length === 0) {
    return { lon: 0, lat: 0, altFt: 0, headingDeg: 0, fraction: 0 };
  }
  const total = points[points.length - 1]!.tSec || 1;
  const fraction = total > 0 ? Math.min(1, Math.max(0, tSec / total)) : 0;
  const first = points[0]!;
  if (tSec <= first.tSec) {
    const next = points[1] ?? first;
    return {
      lon: first.lon,
      lat: first.lat,
      altFt: first.altFt,
      headingDeg: segmentHeadingDeg(first.lat, first.lon, next.lat, next.lon),
      fraction,
    };
  }
  const last = points[points.length - 1]!;
  if (tSec >= last.tSec) {
    const prev = points[points.length - 2] ?? last;
    return {
      lon: last.lon,
      lat: last.lat,
      altFt: last.altFt,
      headingDeg: segmentHeadingDeg(prev.lat, prev.lon, last.lat, last.lon),
      fraction,
    };
  }
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    if (tSec >= a.tSec && tSec <= b.tSec) {
      const span = b.tSec - a.tSec || 1;
      const u = (tSec - a.tSec) / span;
      return {
        lon: a.lon + (b.lon - a.lon) * u,
        lat: a.lat + (b.lat - a.lat) * u,
        altFt: a.altFt + (b.altFt - a.altFt) * u,
        headingDeg: segmentHeadingDeg(a.lat, a.lon, b.lat, b.lon),
        fraction,
      };
    }
  }
  return {
    lon: last.lon,
    lat: last.lat,
    altFt: last.altFt,
    headingDeg: 0,
    fraction: 1,
  };
}

/** 0–1 の進捗でルート上を補間（スライダー用） */
export function interpolatePathByFraction(
  points: PlaybackPoint3D[],
  fraction: number,
): Pick<FlightPathSample, 'lon' | 'lat' | 'altFt' | 'headingDeg' | 'fraction'> {
  const total = points[points.length - 1]?.tSec ?? 0;
  const tSec = total * Math.min(1, Math.max(0, fraction));
  return interpolatePlaybackAtTime(points, tSec);
}
