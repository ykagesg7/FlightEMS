import type { FlightPlan } from '../../../types';

export interface RouteProfileSample {
  label: string;
  distanceNm: number;
  altitudeFt: number;
  windLabel?: string;
  frequency?: string;
}

export function buildRouteProfileSamples(plan: FlightPlan): RouteProfileSample[] {
  let cumulative = 0;
  const samples: RouteProfileSample[] = [];
  if (plan.departure) {
    samples.push({ label: plan.departure.value || plan.departure.name, distanceNm: 0, altitudeFt: plan.altitude });
  }

  plan.routeSegments.forEach((segment) => {
    cumulative += segment.distance;
    samples.push({
      label: segment.to,
      distanceNm: cumulative,
      altitudeFt: segment.altitude,
      windLabel: typeof segment.windFromDeg === 'number' && typeof segment.windSpeedKt === 'number'
        ? `${segment.windFromDeg.toFixed(0)}°/${segment.windSpeedKt.toFixed(0)}kt`
        : undefined,
      frequency: segment.frequency,
    });
  });

  return samples;
}
