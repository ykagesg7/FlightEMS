import L from 'leaflet';
import type { MutableRefObject } from 'react';
import type { Feature } from 'geojson';
import type { Position } from 'geojson';
import {
  findAirspaceHitsAtPoint,
  type AirspaceDataset,
  type AirspaceFeatureHit,
  type AirspaceSourceId,
} from '../../../../utils/airspace';
import type { AirspaceSelection } from './planningAirspaceTypes';

export type AirspaceInteractionApi = {
  getActiveDatasets: () => { id: AirspaceSourceId; data: AirspaceDataset | null }[];
  onSelect: (selection: AirspaceSelection) => void;
};

const sourceKind = (sourceId: AirspaceSourceId): AirspaceFeatureHit['kind'] =>
  sourceId === 'RAPCON' ? 'rapcon' : 'acc';

function featureIdentity(feature: Feature): string | undefined {
  const props = feature.properties ?? {};
  const id = props.Area_ID ?? props.ID;
  return id != null ? String(id) : undefined;
}

function isSameAirspaceFeature(a: Feature, b: Feature): boolean {
  if (a === b) return true;
  const aId = featureIdentity(a);
  const bId = featureIdentity(b);
  return aId != null && aId === bId;
}

export function prioritizePrimaryHit(
  hits: AirspaceFeatureHit[],
  primary: AirspaceFeatureHit,
): AirspaceFeatureHit[] {
  const rest = hits.filter(
    (h) =>
      h.sourceId !== primary.sourceId ||
      !isSameAirspaceFeature(h.feature, primary.feature),
  );
  return [primary, ...rest];
}

export function resolveAirspaceSelectionAtPoint(
  latlng: L.LatLng,
  datasets: { id: AirspaceSourceId; data: AirspaceDataset | null }[],
  primary?: AirspaceFeatureHit,
): AirspaceSelection | null {
  const point: Position = [latlng.lng, latlng.lat];
  let hits = findAirspaceHitsAtPoint(point, datasets);
  if (hits.length === 0) return null;
  if (primary) {
    hits = prioritizePrimaryHit(hits, primary);
  }
  return { latlng, hits };
}

/** ACC / RAPCON ポリゴンクリック → 地図下部シート（Leaflet ポップアップは使わない） */
export function bindAirspaceFeatureSheetSelect(
  feature: Feature,
  layer: L.Layer,
  sourceId: AirspaceSourceId,
  apiRef: MutableRefObject<AirspaceInteractionApi>,
): void {
  layer.on('click', (e: L.LeafletMouseEvent) => {
    L.DomEvent.stopPropagation(e);
    const api = apiRef.current;
    const datasets = api.getActiveDatasets();
    if (datasets.length === 0) return;

    const primary: AirspaceFeatureHit = {
      sourceId,
      kind: sourceKind(sourceId),
      feature,
    };
    const selection = resolveAirspaceSelectionAtPoint(e.latlng, datasets, primary);
    if (selection) {
      api.onSelect(selection);
    }
  });
}
