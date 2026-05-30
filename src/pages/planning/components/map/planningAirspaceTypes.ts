import type L from 'leaflet';
import type { AirspaceFeatureHit } from '../../../../utils/airspace';

export type AirspaceSelection = {
  latlng: L.LatLng;
  hits: AirspaceFeatureHit[];
};
