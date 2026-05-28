import type L from 'leaflet';
import { describe, expect, it, vi } from 'vitest';
import { STATIC_MAP_LAYER_CATALOG } from '../../pages/planning/components/map/mapLayerCatalog';
import {
  applyEnabledCatalogLayersToMap,
  mergeCatalogEntries,
  removeCatalogLayersFromMap,
  resolveOverlayLayer,
  type PlanningMapOverlayGroups,
} from '../../pages/planning/components/map/mapLayerUtils';

type MockLayer = L.Layer & { id: string };

function createMockLayer(id: string): MockLayer {
  return { id } as MockLayer;
}

function createMockMap(attachedLayers: Set<L.Layer>) {
  return {
    hasLayer: (layer: L.Layer) => attachedLayers.has(layer),
    removeLayer: vi.fn((layer: L.Layer) => {
      attachedLayers.delete(layer);
    }),
  } as unknown as L.Map;
}

function buildOverlayGroups(layerByKey: Record<string, L.Layer>): PlanningMapOverlayGroups {
  return {
    'Common Layers': layerByKey,
    Waypoints: {},
    'Local Layers': {},
  };
}

describe('mapLayerControllerSync helpers', () => {
  it('mergeCatalogEntries deduplicates by id and keeps latest entry', () => {
    const prev = STATIC_MAP_LAYER_CATALOG.slice(0, 2);
    const next = [
      ...STATIC_MAP_LAYER_CATALOG.slice(0, 2),
      { ...STATIC_MAP_LAYER_CATALOG[2], label: 'updated restricted' },
    ];
    const merged = mergeCatalogEntries(prev, next);
    expect(merged).toHaveLength(3);
    expect(merged.find((e) => e.id === 'restricted_airspace')?.label).toBe('updated restricted');
  });

  it('removeCatalogLayersFromMap removes only attached layers', () => {
    const attached = new Set<L.Layer>();
    const map = createMockMap(attached);
    const layerA = createMockLayer('a');
    const layerB = createMockLayer('b');
    attached.add(layerA);

    const overlayLayers = buildOverlayGroups({
      空港: layerA,
      Navaids: layerB,
    });
    const catalog = STATIC_MAP_LAYER_CATALOG.filter((e) =>
      e.id === 'airport' || e.id === 'navaids',
    );

    const removed: string[] = [];
    removeCatalogLayersFromMap(map, catalog, overlayLayers, (entry, layer) => {
      removed.push(entry.id);
      map.removeLayer(layer);
    });

    expect(removed).toEqual(['airport']);
    expect(map.hasLayer(layerA)).toBe(false);
    expect(map.hasLayer(layerB)).toBe(false);
  });

  it('applyEnabledCatalogLayersToMap adds enabled layers not yet on map', () => {
    const attached = new Set<L.Layer>();
    const map = createMockMap(attached);
    const layerA = createMockLayer('a');
    const layerB = createMockLayer('b');

    const overlayLayers = buildOverlayGroups({
      空港: layerA,
      Navaids: layerB,
    });
    const catalog = STATIC_MAP_LAYER_CATALOG.filter((e) =>
      e.id === 'airport' || e.id === 'navaids',
    );

    const added: string[] = [];
    applyEnabledCatalogLayersToMap(
      map,
      catalog,
      overlayLayers,
      new Set(['airport', 'navaids']),
      (entry, layer) => {
        added.push(entry.id);
        attached.add(layer);
      },
    );

    expect(added).toEqual(['airport', 'navaids']);
    expect(map.hasLayer(layerA)).toBe(true);
    expect(map.hasLayer(layerB)).toBe(true);
  });

  it('resolveOverlayLayer returns layer from correct group', () => {
    const accLayer = createMockLayer('acc');
    const overlayLayers = buildOverlayGroups({
      'ACC-Sector High': accLayer,
    });
    const entry = STATIC_MAP_LAYER_CATALOG.find((e) => e.id === 'acc_sector_high');
    expect(entry).toBeDefined();
    expect(resolveOverlayLayer(overlayLayers, entry!)).toBe(accLayer);
  });

  it('simulates generation swap: old instance stays until explicitly removed', () => {
    const attached = new Set<L.Layer>();
    const map = createMockMap(attached);
    const oldLayer = createMockLayer('old');
    const newLayer = createMockLayer('new');
    attached.add(oldLayer);

    const oldOverlay = buildOverlayGroups({ 空港: oldLayer });
    const newOverlay = buildOverlayGroups({ 空港: newLayer });
    const catalog = STATIC_MAP_LAYER_CATALOG.filter((e) => e.id === 'airport');

    removeCatalogLayersFromMap(map, catalog, oldOverlay, (_entry, layer) => {
      map.removeLayer(layer);
    });

    expect(map.hasLayer(oldLayer)).toBe(false);
    expect(map.hasLayer(newLayer)).toBe(false);

    applyEnabledCatalogLayersToMap(
      map,
      catalog,
      newOverlay,
      new Set(['airport']),
      (_entry, layer) => {
        attached.add(layer);
      },
    );

    expect(map.hasLayer(newLayer)).toBe(true);
    expect(map.hasLayer(oldLayer)).toBe(false);
  });
});
