import L from 'leaflet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  buildFullLayerCatalog,
  getCatalogEntryById,
  getKnownOverlayIds,
  type MapBaseLayerId,
  type MapLayerCatalogEntry,
} from '../mapLayerCatalog';
import { computePresetEnabledIds, type MapLayerPresetId } from '../mapLayerPresets';
import {
  loadPlanningMapLayerPreferences,
  savePlanningMapLayerPreferences,
} from '../planningMapLayerPreferences';
import type { PlanningMapRegion } from '../planningMapTypes';
import {
  applyEnabledCatalogLayersToMap,
  bringWaypointLayerToFront,
  getWaypointRegionOverlayIds,
  mergeCatalogEntries,
  removeCatalogLayersFromMap,
  resolveOverlayLayer,
  type PlanningMapOverlayGroups,
} from '../mapLayerUtils';

export type PlanningMapLayerController = {
  baseLayerId: MapBaseLayerId;
  enabledOverlayIds: ReadonlySet<string>;
  activePresetId: MapLayerPresetId | null;
  catalog: MapLayerCatalogEntry[];
  setBaseLayer: (id: MapBaseLayerId) => void;
  toggleOverlay: (overlayId: string, enabled: boolean) => void;
  applyPreset: (presetId: MapLayerPresetId) => void;
  activeLayerLabels: string[];
};

type ReferenceLayerSetters = {
  setLiveTrafficEnabled: (enabled: boolean) => void;
  setRainViewerEnabled: (enabled: boolean) => void;
  setWindBarbsEnabled: (enabled: boolean) => void;
};

export type UsePlanningMapLayerControllerParams = {
  map: L.Map | null;
  overlayLayers: PlanningMapOverlayGroups;
  osmLayer: L.TileLayer;
  esriLayer: L.TileLayer;
  regions: PlanningMapRegion[];
  loadRegionWaypointsData: (regionId: string) => void;
  loadAllWaypointsData: () => void;
  referenceLayerSetters: ReferenceLayerSetters;
};

function syncReferenceLayerState(
  overlayId: string,
  enabled: boolean,
  setters: ReferenceLayerSetters,
): void {
  if (overlayId === 'opensky_traffic') {
    setters.setLiveTrafficEnabled(enabled);
  } else if (overlayId === 'rainviewer_radar') {
    setters.setRainViewerEnabled(enabled);
  } else if (overlayId === 'wind_barbs') {
    setters.setWindBarbsEnabled(enabled);
  }
}

export function usePlanningMapLayerController({
  map,
  overlayLayers,
  osmLayer,
  esriLayer,
  regions,
  loadRegionWaypointsData,
  loadAllWaypointsData,
  referenceLayerSetters,
}: UsePlanningMapLayerControllerParams): PlanningMapLayerController {
  const catalog = useMemo(() => buildFullLayerCatalog(regions), [regions]);
  const knownIds = useMemo(() => getKnownOverlayIds(catalog), [catalog]);
  const waypointRegionIds = useMemo(() => getWaypointRegionOverlayIds(catalog), [catalog]);

  const initialPrefs = useMemo(
    () => loadPlanningMapLayerPreferences(knownIds),
    [knownIds],
  );

  const [baseLayerId, setBaseLayerIdState] = useState<MapBaseLayerId>(initialPrefs.baseLayerId);
  const [enabledOverlayIds, setEnabledOverlayIds] = useState<Set<string>>(
    () => new Set(initialPrefs.enabledOverlayIds),
  );
  const [activePresetId, setActivePresetId] = useState<MapLayerPresetId | null>(
    initialPrefs.lastPresetId,
  );

  const initializedRef = useRef(false);
  const prevOverlayLayersRef = useRef<PlanningMapOverlayGroups | null>(null);
  const prevCatalogRef = useRef<MapLayerCatalogEntry[]>([]);
  const enabledOverlayIdsRef = useRef(enabledOverlayIds);
  enabledOverlayIdsRef.current = enabledOverlayIds;

  const persistPreferences = useDebouncedCallback(
    (base: MapBaseLayerId, enabled: Set<string>, preset: MapLayerPresetId | null) => {
      savePlanningMapLayerPreferences({
        baseLayerId: base,
        enabledOverlayIds: [...enabled],
        lastPresetId: preset,
      });
    },
    300,
  );

  const applyBaseLayerToMap = useCallback(
    (id: MapBaseLayerId) => {
      if (!map) return;
      const target = id === 'satellite' ? esriLayer : osmLayer;
      const other = id === 'satellite' ? osmLayer : esriLayer;
      if (map.hasLayer(other)) {
        map.removeLayer(other);
      }
      if (!map.hasLayer(target)) {
        target.addTo(map);
      }
    },
    [map, osmLayer, esriLayer],
  );

  const addOverlayToMap = useCallback(
    (entry: MapLayerCatalogEntry, layer: L.Layer) => {
      if (!map || map.hasLayer(layer)) return;

      layer.addTo(map);
      syncReferenceLayerState(entry.id, true, referenceLayerSetters);

      if (entry.id === 'waypoints_all') {
        loadAllWaypointsData();
        window.setTimeout(() => {
          for (const regionId of waypointRegionIds) {
            const regionEntry = getCatalogEntryById(catalog, regionId);
            if (!regionEntry) continue;
            const regionLayer = resolveOverlayLayer(overlayLayers, regionEntry);
            if (regionLayer && map && !map.hasLayer(regionLayer)) {
              regionLayer.addTo(map);
              const region = regions.find((r) => regionEntry.layerKey === r.name);
              if (region) {
                loadRegionWaypointsData(region.id);
              }
            }
          }
        }, 10);
      } else if (entry.group === 'waypoints') {
        const region = regions.find((r) => entry.layerKey === r.name);
        if (region) {
          loadRegionWaypointsData(region.id);
        }
        window.setTimeout(() => bringWaypointLayerToFront(layer), 100);
      }
    },
    [
      map,
      catalog,
      overlayLayers,
      regions,
      waypointRegionIds,
      loadAllWaypointsData,
      loadRegionWaypointsData,
      referenceLayerSetters,
    ],
  );

  const removeOverlayFromMap = useCallback(
    (entry: MapLayerCatalogEntry, layer: L.Layer) => {
      if (!map) return;
      if (!map.hasLayer(layer)) {
        syncReferenceLayerState(entry.id, false, referenceLayerSetters);
        return;
      }

      map.removeLayer(layer);
      syncReferenceLayerState(entry.id, false, referenceLayerSetters);

      if (entry.id === 'waypoints_all') {
        window.setTimeout(() => {
          for (const regionId of waypointRegionIds) {
            const regionEntry = getCatalogEntryById(catalog, regionId);
            if (!regionEntry) continue;
            const regionLayer = resolveOverlayLayer(overlayLayers, regionEntry);
            if (regionLayer && map?.hasLayer(regionLayer)) {
              map.removeLayer(regionLayer);
            }
          }
        }, 10);
      }

      if (entry.id === 'rjfa' || entry.id === 'rjfz') {
        if (layer instanceof L.LayerGroup) {
          layer.clearLayers();
        }
      }
    },
    [map, catalog, overlayLayers, waypointRegionIds, referenceLayerSetters],
  );

  const setEnabledOverlayIdsAndSync = useCallback(
    (next: Set<string>, presetId: MapLayerPresetId | null) => {
      if (!map) {
        setEnabledOverlayIds(next);
        setActivePresetId(presetId);
        return;
      }

      const prev = enabledOverlayIds;

      for (const entry of catalog) {
        const wasEnabled = prev.has(entry.id);
        const shouldEnable = next.has(entry.id);
        if (wasEnabled === shouldEnable) continue;

        const layer = resolveOverlayLayer(overlayLayers, entry);
        if (!layer) continue;

        if (shouldEnable) {
          addOverlayToMap(entry, layer);
        } else {
          removeOverlayFromMap(entry, layer);
        }
      }

      setEnabledOverlayIds(next);
      setActivePresetId(presetId);
    },
    [
      map,
      catalog,
      overlayLayers,
      enabledOverlayIds,
      addOverlayToMap,
      removeOverlayFromMap,
    ],
  );

  const setBaseLayer = useCallback(
    (id: MapBaseLayerId) => {
      setBaseLayerIdState(id);
      applyBaseLayerToMap(id);
      persistPreferences(id, enabledOverlayIds, activePresetId);
    },
    [applyBaseLayerToMap, enabledOverlayIds, activePresetId, persistPreferences],
  );

  const toggleOverlay = useCallback(
    (overlayId: string, enabled: boolean) => {
      if (!knownIds.has(overlayId)) return;

      const entry = getCatalogEntryById(catalog, overlayId);
      if (!entry) return;

      const next = new Set(enabledOverlayIds);
      if (enabled) {
        next.add(overlayId);
      } else {
        next.delete(overlayId);
      }

      if (map) {
        const layer = resolveOverlayLayer(overlayLayers, entry);
        if (layer) {
          if (enabled) {
            addOverlayToMap(entry, layer);
          } else {
            removeOverlayFromMap(entry, layer);
          }
        }
      }

      setEnabledOverlayIds(next);
      setActivePresetId(null);
      persistPreferences(baseLayerId, next, null);
    },
    [
      knownIds,
      catalog,
      enabledOverlayIds,
      map,
      overlayLayers,
      addOverlayToMap,
      removeOverlayFromMap,
      baseLayerId,
      persistPreferences,
    ],
  );

  const applyPreset = useCallback(
    (presetId: MapLayerPresetId) => {
      const next = computePresetEnabledIds(presetId, knownIds);
      setEnabledOverlayIdsAndSync(next, presetId);
      persistPreferences(baseLayerId, next, presetId);
    },
    [knownIds, setEnabledOverlayIdsAndSync, baseLayerId, persistPreferences],
  );

  // 初回: ベースレイヤー + 保存済みオーバーレイ
  useEffect(() => {
    if (!map || initializedRef.current) return;
    initializedRef.current = true;

    applyBaseLayerToMap(baseLayerId);

    const ids = new Set(initialPrefs.enabledOverlayIds);
    applyEnabledCatalogLayersToMap(map, catalog, overlayLayers, ids, addOverlayToMap);
    setEnabledOverlayIds(ids);

    prevOverlayLayersRef.current = overlayLayers;
    prevCatalogRef.current = catalog;
  }, [
    map,
    baseLayerId,
    initialPrefs.enabledOverlayIds,
    catalog,
    overlayLayers,
    applyBaseLayerToMap,
    addOverlayToMap,
  ]);

  // overlayLayers / catalog 世代差し替え時: 旧インスタンスを除去し enabled を再適用
  useEffect(() => {
    if (!map || !initializedRef.current) return;

    const prevLayers = prevOverlayLayersRef.current;
    const prevCatalog = prevCatalogRef.current;
    const layersUnchanged = prevLayers === overlayLayers;
    const catalogUnchanged = prevCatalog === catalog;
    if (layersUnchanged && catalogUnchanged) return;

    if (prevLayers) {
      const mergedCatalog = mergeCatalogEntries(prevCatalog, catalog);
      removeCatalogLayersFromMap(map, mergedCatalog, prevLayers, removeOverlayFromMap);
    }

    let idsToApply = enabledOverlayIdsRef.current;
    if (!catalogUnchanged) {
      const mergedIds = new Set(idsToApply);
      let changed = false;
      for (const overlayId of initialPrefs.enabledOverlayIds) {
        if (knownIds.has(overlayId) && !mergedIds.has(overlayId)) {
          mergedIds.add(overlayId);
          changed = true;
        }
      }
      if (changed) {
        idsToApply = mergedIds;
        setEnabledOverlayIds(mergedIds);
      }
    }

    for (const entry of catalog) {
      syncReferenceLayerState(
        entry.id,
        idsToApply.has(entry.id),
        referenceLayerSetters,
      );
    }

    applyEnabledCatalogLayersToMap(map, catalog, overlayLayers, idsToApply, addOverlayToMap);

    prevOverlayLayersRef.current = overlayLayers;
    prevCatalogRef.current = catalog;
  }, [
    map,
    overlayLayers,
    catalog,
    initialPrefs.enabledOverlayIds,
    knownIds,
    addOverlayToMap,
    removeOverlayFromMap,
    referenceLayerSetters,
  ]);

  const activeLayerLabels = useMemo(() => {
    return catalog
      .filter((entry) => enabledOverlayIds.has(entry.id))
      .map((entry) => entry.label);
  }, [catalog, enabledOverlayIds]);

  return {
    baseLayerId,
    enabledOverlayIds,
    activePresetId,
    catalog,
    setBaseLayer,
    toggleOverlay,
    applyPreset,
    activeLayerLabels,
  };
}
