import L from 'leaflet';
import { useEffect, useRef, type MutableRefObject } from 'react';
import {
  sanitizeAirspaceDataset,
  type AirspaceDataset,
  type AirspaceSourceId,
} from '../../../../../utils/airspace';
import type { AirspaceSelection } from '../planningAirspaceTypes';
import {
  resolveAirspaceSelectionAtPoint,
  type AirspaceInteractionApi,
} from '../airspaceLayerInteraction';
import { usePlanningMapLayerControllerContext } from '../planningMapLayerControllerContext';

const AIRSPACE_LAYER_CONFIG: { layerKey: string; sourceId: AirspaceSourceId; overlayId: string }[] = [
  { layerKey: 'ACC-Sector High', sourceId: 'ACC_Sector_High', overlayId: 'acc_sector_high' },
  { layerKey: 'ACC-Sector Low', sourceId: 'ACC_Sector_Low', overlayId: 'acc_sector_low' },
  { layerKey: 'RAPCON', sourceId: 'RAPCON', overlayId: 'rapcon' },
];

function resolveDataset(
  sourceId: AirspaceSourceId,
  layerKey: string,
  commonLayersRef: MutableRefObject<Record<string, L.Layer> | null>,
  airspaceDataRef: MutableRefObject<Record<AirspaceSourceId, AirspaceDataset | null>>,
): AirspaceDataset | null {
  const cached = airspaceDataRef.current[sourceId];
  if (cached?.features?.length) return cached;

  const layer = commonLayersRef.current?.[layerKey];
  if (!(layer instanceof L.GeoJSON) || layer.getLayers().length === 0) {
    return null;
  }

  const fromLayer = sanitizeAirspaceDataset(layer.toGeoJSON() as AirspaceDataset);
  if (fromLayer.features.length === 0) return null;

  airspaceDataRef.current[sourceId] = fromLayer;
  return fromLayer;
}

export function useAirspaceLayerClick(
  map: L.Map | null,
  commonLayersRef: MutableRefObject<Record<string, L.Layer> | null>,
  airspaceDataRef: MutableRefObject<Record<AirspaceSourceId, AirspaceDataset | null>>,
  onAirspaceSelection: (selection: AirspaceSelection) => void,
  interactionRef: MutableRefObject<AirspaceInteractionApi>,
): void {
  const controller = usePlanningMapLayerControllerContext();
  const enabledOverlayIds = controller?.enabledOverlayIds;
  const onSelectRef = useRef(onAirspaceSelection);

  useEffect(() => {
    onSelectRef.current = onAirspaceSelection;
  }, [onAirspaceSelection]);

  useEffect(() => {
    const getActiveDatasets = (): { id: AirspaceSourceId; data: AirspaceDataset | null }[] => {
      return AIRSPACE_LAYER_CONFIG.filter(({ overlayId }) => enabledOverlayIds?.has(overlayId)).flatMap(
        ({ sourceId, layerKey }) => {
          const data = resolveDataset(sourceId, layerKey, commonLayersRef, airspaceDataRef);
          return data ? [{ id: sourceId, data }] : [];
        },
      );
    };

    interactionRef.current.getActiveDatasets = getActiveDatasets;
    interactionRef.current.onSelect = (selection) => onSelectRef.current(selection);
  }, [commonLayersRef, airspaceDataRef, enabledOverlayIds, interactionRef]);

  useEffect(() => {
    if (!map) return;

    const handler = (e: L.LeafletMouseEvent) => {
      const target = e.originalEvent.target;
      if (!(target instanceof Element) || !target.closest('.leaflet-interactive')) {
        return;
      }

      const datasets = interactionRef.current.getActiveDatasets();
      if (datasets.length === 0) return;

      const selection = resolveAirspaceSelectionAtPoint(e.latlng, datasets);
      if (!selection) return;

      L.DomEvent.stopPropagation(e);
      onSelectRef.current(selection);
    };

    map.on('click', handler);
    return () => {
      map.off('click', handler);
    };
  }, [map, interactionRef]);
}
