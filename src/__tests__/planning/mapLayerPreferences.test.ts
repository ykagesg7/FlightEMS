import { describe, expect, it } from 'vitest';
import { getKnownOverlayIds, STATIC_MAP_LAYER_CATALOG } from '../../pages/planning/components/map/mapLayerCatalog';
import { computePresetEnabledIds, getPresetOverlayIds } from '../../pages/planning/components/map/mapLayerPresets';
import {
  DEFAULT_PLANNING_MAP_LAYER_PREFERENCES,
  filterValidOverlayIds,
  normalizePreferences,
  serializePreferences,
} from '../../pages/planning/components/map/planningMapLayerPreferences';

const knownIds = getKnownOverlayIds(STATIC_MAP_LAYER_CATALOG);

describe('planningMapLayerPreferences', () => {
  it('filters unknown overlay ids', () => {
    expect(filterValidOverlayIds(['airport', 'unknown_layer', 'navaids'], knownIds)).toEqual([
      'airport',
      'navaids',
    ]);
  });

  it('normalizes invalid json shape to defaults', () => {
    expect(normalizePreferences(null, knownIds)).toEqual(DEFAULT_PLANNING_MAP_LAYER_PREFERENCES);
    expect(normalizePreferences({ baseLayerId: 'invalid' }, knownIds).baseLayerId).toBe('map');
  });

  it('round-trips serialize', () => {
    const prefs = {
      baseLayerId: 'satellite' as const,
      enabledOverlayIds: ['airport'],
      lastPresetId: 'vfr_planning' as const,
    };
    const parsed = normalizePreferences(JSON.parse(serializePreferences(prefs)), knownIds);
    expect(parsed).toEqual(prefs);
  });
});

describe('mapLayerPresets', () => {
  it('returns vfr_planning overlay ids', () => {
    const ids = getPresetOverlayIds('vfr_planning');
    expect(ids).toContain('airport');
    expect(ids).toContain('navaids');
    expect(ids).not.toContain('opensky_traffic');
  });

  it('computePresetEnabledIds ignores unknown ids', () => {
    const enabled = computePresetEnabledIds('weather_reference', knownIds);
    expect(enabled.has('rainviewer_radar')).toBe(true);
    expect(enabled.has('wind_barbs')).toBe(true);
    expect(enabled.size).toBe(2);
  });
});
