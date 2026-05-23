import type { MapBaseLayerId } from './mapLayerCatalog';
import type { MapLayerPresetId } from './mapLayerPresets';

export const PLANNING_MAP_LAYER_PREFERENCES_KEY = 'planning-map-layer-preferences-v1';

export type PlanningMapLayerPreferences = {
  baseLayerId: MapBaseLayerId;
  enabledOverlayIds: string[];
  lastPresetId: MapLayerPresetId | null;
};

export const DEFAULT_PLANNING_MAP_LAYER_PREFERENCES: PlanningMapLayerPreferences = {
  baseLayerId: 'map',
  enabledOverlayIds: [],
  lastPresetId: null,
};

export function serializePreferences(prefs: PlanningMapLayerPreferences): string {
  return JSON.stringify(prefs);
}

export function parsePreferencesJson(raw: string): unknown {
  return JSON.parse(raw) as unknown;
}

export function filterValidOverlayIds(ids: string[], knownIds: ReadonlySet<string>): string[] {
  return ids.filter((id) => knownIds.has(id));
}

export function normalizePreferences(
  input: unknown,
  knownIds: ReadonlySet<string>,
): PlanningMapLayerPreferences {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_PLANNING_MAP_LAYER_PREFERENCES };
  }

  const obj = input as Partial<PlanningMapLayerPreferences>;
  const baseLayerId: MapBaseLayerId =
    obj.baseLayerId === 'satellite' ? 'satellite' : 'map';

  const enabledOverlayIds = Array.isArray(obj.enabledOverlayIds)
    ? filterValidOverlayIds(obj.enabledOverlayIds, knownIds)
    : [];

  const lastPresetId =
    obj.lastPresetId === 'vfr_planning' ||
    obj.lastPresetId === 'airspace_review' ||
    obj.lastPresetId === 'weather_reference'
      ? obj.lastPresetId
      : null;

  return { baseLayerId, enabledOverlayIds, lastPresetId };
}

export function loadPlanningMapLayerPreferences(
  knownIds: ReadonlySet<string>,
): PlanningMapLayerPreferences {
  try {
    const raw = localStorage.getItem(PLANNING_MAP_LAYER_PREFERENCES_KEY);
    if (!raw) return { ...DEFAULT_PLANNING_MAP_LAYER_PREFERENCES };
    return normalizePreferences(parsePreferencesJson(raw), knownIds);
  } catch {
    return { ...DEFAULT_PLANNING_MAP_LAYER_PREFERENCES };
  }
}

export function savePlanningMapLayerPreferences(prefs: PlanningMapLayerPreferences): void {
  try {
    localStorage.setItem(PLANNING_MAP_LAYER_PREFERENCES_KEY, serializePreferences(prefs));
  } catch {
    /* ignore quota / private mode */
  }
}
