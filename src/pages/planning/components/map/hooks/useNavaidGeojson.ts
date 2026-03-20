import L from 'leaflet';
import { useEffect, useState } from 'react';
import { NavaidGeoJSONFeature } from '../../../../../types/map';
import type { PlanningMapNavaid } from '../planningMapTypes';

export function useNavaidGeojson(): PlanningMapNavaid[] {
  const [navaidData, setNavaidData] = useState<PlanningMapNavaid[]>([]);

  useEffect(() => {
    fetch('/geojson/Navaids.geojson')
      .then((res) => res.json())
      .then((data: { features: NavaidGeoJSONFeature[] }) => {
        const navaids = data.features.map((feat: NavaidGeoJSONFeature): PlanningMapNavaid => {
          const [lng, lat] = feat.geometry.coordinates;
          return {
            coordinates: L.latLng(lat, lng),
            id: feat.properties.id,
            name: feat.properties.name,
          };
        });
        setNavaidData(navaids);
      })
      .catch(console.error);
  }, []);

  return navaidData;
}
