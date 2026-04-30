import type { TrackPoint } from './types';

export function downsampleTrackPoints(points: TrackPoint[], maxPoints = 1500): TrackPoint[] {
  if (points.length <= maxPoints) return points;
  if (maxPoints < 2) return points.slice(0, 1);

  const result: TrackPoint[] = [points[0]];
  const bucketSize = (points.length - 2) / (maxPoints - 2);

  for (let index = 0; index < maxPoints - 2; index += 1) {
    const sourceIndex = 1 + Math.floor(index * bucketSize);
    result.push(points[sourceIndex]);
  }

  result.push(points[points.length - 1]);
  return result;
}
