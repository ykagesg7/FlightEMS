import type L from 'leaflet';
import { useEffect, useState } from 'react';
import { calculateMagneticBearing } from '../../../../../utils/bearing';
import type { PlanningMapNavaid } from '../planningMapTypes';

export interface NavaidHudInfo {
  bearing: number;
  distance: number;
  id: string;
}

export function useCursorNearestNavaids(
  cursorPosition: L.LatLng | null,
  navaidData: PlanningMapNavaid[]
): NavaidHudInfo[] {
  const [navaidInfos, setNavaidInfos] = useState<NavaidHudInfo[]>([]);

  useEffect(() => {
    if (!cursorPosition || navaidData.length === 0) {
      setNavaidInfos([]);
      return;
    }
    const calculations = navaidData.map((navaid) => {
      const dist = cursorPosition.distanceTo(navaid.coordinates);
      const bearing = calculateMagneticBearing(
        navaid.coordinates.lat,
        navaid.coordinates.lng,
        cursorPosition.lat,
        cursorPosition.lng
      );
      return { navaid, bearing, distance: dist };
    });
    calculations.sort((a, b) => a.distance - b.distance);
    const infos = calculations.slice(0, 3).map((item) => ({
      bearing: item.bearing,
      distance: parseFloat((item.distance / 1852).toFixed(1)),
      id: item.navaid.id,
    }));
    setNavaidInfos(infos);
  }, [cursorPosition, navaidData]);

  return navaidInfos;
}
