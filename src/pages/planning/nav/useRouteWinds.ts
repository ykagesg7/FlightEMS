import { useEffect, useMemo, useState } from 'react';
import type { FlightPlan } from '../../../types';
import { addMinutesUtc, flightPlanTimeJstToUtc } from '../../../utils/flightTime';
import { fetchWindAtLocationTime, type RouteWindSample } from '../../../utils/routeOpenMeteoWind';
import { collectNavPoints, type NavPoint } from './navPoints';

export function useRouteWinds(flightPlan: FlightPlan, points?: NavPoint[]): {
  winds: Array<RouteWindSample | null> | undefined;
  loading: boolean;
} {
  const navPoints = points ?? collectNavPoints(flightPlan);
  const enabled = flightPlan.useOpenMeteoWind === true && navPoints.length >= 2;
  const [winds, setWinds] = useState<Array<RouteWindSample | null> | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const signature = useMemo(() => {
    if (!enabled) return '';
    return [
      flightPlan.departureTime,
      flightPlan.altitude,
      navPoints.map((p) => `${p.id}:${p.latitude.toFixed(4)},${p.longitude.toFixed(4)}`).join('|'),
    ].join('::');
  }, [enabled, flightPlan.departureTime, flightPlan.altitude, navPoints]);

  useEffect(() => {
    if (!enabled) {
      setWinds(undefined);
      setLoading(false);
      return;
    }
    const ref = flightPlanTimeJstToUtc(flightPlan.departureTime);
    if (Number.isNaN(ref.getTime())) {
      setWinds(undefined);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const jobs = navPoints.slice(0, -1).map((from, i) => {
      const to = navPoints[i + 1];
      const midLat = (from.latitude + to.latitude) / 2;
      const midLon = (from.longitude + to.longitude) / 2;
      return fetchWindAtLocationTime(midLat, midLon, flightPlan.altitude, addMinutesUtc(ref, i * 5), 3);
    });
    void Promise.all(jobs).then((rows) => {
      if (cancelled) return;
      setWinds(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, signature, flightPlan.altitude, flightPlan.departureTime, navPoints]);

  return { winds: enabled ? winds : undefined, loading };
}
