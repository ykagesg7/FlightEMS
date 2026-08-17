import { bearingDeg } from '../../planning/tracks/geoMath';

export type PlaybackPoint = {
  lon: number;
  lat: number;
  altFt: number;
  /** 再生開始からの秒 */
  tSec: number;
};

export type PlaybackPose = {
  lon: number;
  lat: number;
  altFt: number;
  /** 真方位 0–360。機首方向 */
  headingDeg: number;
};

export function interpolatePlayback(pts: PlaybackPoint[], tSec: number): PlaybackPose {
  if (pts.length === 0) {
    return { lon: 0, lat: 0, altFt: 0, headingDeg: 0 };
  }
  const first = pts[0]!;
  if (tSec <= first.tSec) {
    return { ...poseFromSegment(first, pts[1] ?? first), lon: first.lon, lat: first.lat, altFt: first.altFt };
  }
  const last = pts[pts.length - 1]!;
  if (tSec >= last.tSec) {
    const prev = pts[pts.length - 2] ?? last;
    return { ...poseFromSegment(prev, last), lon: last.lon, lat: last.lat, altFt: last.altFt };
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    if (tSec >= a.tSec && tSec <= b.tSec) {
      const u = (tSec - a.tSec) / (b.tSec - a.tSec || 1);
      return {
        lon: a.lon + (b.lon - a.lon) * u,
        lat: a.lat + (b.lat - a.lat) * u,
        altFt: a.altFt + (b.altFt - a.altFt) * u,
        headingDeg: poseFromSegment(a, b).headingDeg,
      };
    }
  }
  return { ...poseFromSegment(pts[pts.length - 2] ?? last, last), lon: last.lon, lat: last.lat, altFt: last.altFt };
}

function poseFromSegment(a: PlaybackPoint, b: PlaybackPoint): Pick<PlaybackPose, 'headingDeg'> {
  if (a.lat === b.lat && a.lon === b.lon) {
    return { headingDeg: 0 };
  }
  return {
    headingDeg: bearingDeg(
      { latitude: a.lat, longitude: a.lon },
      { latitude: b.lat, longitude: b.lon },
    ),
  };
}

export function trackBBox(
  pts: PlaybackPoint[],
  padDeg = 3.5,
): { minLon: number; minLat: number; maxLon: number; maxLat: number } | null {
  if (pts.length === 0) return null;
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  for (const p of pts) {
    minLon = Math.min(minLon, p.lon);
    maxLon = Math.max(maxLon, p.lon);
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
  }
  return {
    minLon: minLon - padDeg,
    minLat: minLat - padDeg,
    maxLon: maxLon + padDeg,
    maxLat: maxLat + padDeg,
  };
}

export function ringIntersectsBBox(
  ring: [number, number][],
  bbox: { minLon: number; minLat: number; maxLon: number; maxLat: number },
): boolean {
  let rMinLon = Infinity;
  let rMinLat = Infinity;
  let rMaxLon = -Infinity;
  let rMaxLat = -Infinity;
  for (const c of ring) {
    rMinLon = Math.min(rMinLon, c[0]);
    rMaxLon = Math.max(rMaxLon, c[0]);
    rMinLat = Math.min(rMinLat, c[1]);
    rMaxLat = Math.max(rMaxLat, c[1]);
  }
  return !(rMaxLon < bbox.minLon || rMinLon > bbox.maxLon || rMaxLat < bbox.minLat || rMinLat > bbox.maxLat);
}
