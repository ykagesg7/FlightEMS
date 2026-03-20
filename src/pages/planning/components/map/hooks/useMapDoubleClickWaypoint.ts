import type L from 'leaflet';
import React, { useEffect } from 'react';
import type { FlightPlan } from '../../../../../types/index';

export function useMapDoubleClickWaypoint(
  map: L.Map | null,
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>
): void {
  useEffect(() => {
    if (!map) return;
    const onDblClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const newWaypoint = {
        id: String(Date.now()),
        name: `Waypoint (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        latitude: lat,
        longitude: lng,
        type: 'custom' as const,
        coordinates: [lng, lat] as [number, number],
      };
      setFlightPlan((prev: FlightPlan) => ({
        ...prev,
        waypoints: [...prev.waypoints, newWaypoint],
      }));
    };
    map.on('dblclick', onDblClick);
    return () => {
      map.off('dblclick', onDblClick);
    };
  }, [map, setFlightPlan]);
}
