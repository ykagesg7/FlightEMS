import { useMemo } from 'react';
import { FlightPlan } from '../types';

export const useMapRoute = (flightPlan: FlightPlan) => {
  return useMemo(() => {
    const points: [number, number][] = [];
    if (flightPlan.departure && typeof flightPlan.departure.latitude === 'number' && typeof flightPlan.departure.longitude === 'number') {
      points.push([flightPlan.departure.latitude, flightPlan.departure.longitude]);
    }
    flightPlan.waypoints.forEach(waypoint => {
      if (waypoint && typeof waypoint.latitude === 'number' && typeof waypoint.longitude === 'number') {
        points.push([waypoint.latitude, waypoint.longitude]);
      }
    });
    if (flightPlan.arrival && typeof flightPlan.arrival.latitude === 'number' && typeof flightPlan.arrival.longitude === 'number') {
      points.push([flightPlan.arrival.latitude, flightPlan.arrival.longitude]);
    }
    return points;
  }, [flightPlan]);
}; 