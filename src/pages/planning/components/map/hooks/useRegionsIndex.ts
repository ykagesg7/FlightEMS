import { useEffect, useState } from 'react';
import type { PlanningMapRegion } from '../planningMapTypes';

export function useRegionsIndex(): PlanningMapRegion[] {
  const [regions, setRegions] = useState<PlanningMapRegion[]>([]);

  useEffect(() => {
    fetch('/geojson/waypoints/regions_index.json')
      .then((res) => res.json())
      .then((data: { regions: PlanningMapRegion[] }) => {
        setRegions(data.regions);
      })
      .catch(console.error);
  }, []);

  return regions;
}
