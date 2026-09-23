import type { PlanningMode } from './planningAnalytics';
import type { MapLayerPresetId } from '../pages/planning/components/map/mapLayerPresets';

/** Initial map preset when entering a planning mode (does not override saved user prefs on revisit). */
export function mapPresetForPlanningMode(mode: PlanningMode): MapLayerPresetId | null {
  switch (mode) {
    case 'learn':
    case 'plan':
      return 'vfr_planning';
    case 'brief':
      return 'airspace_review';
    case 'debrief':
      return null;
    default:
      return null;
  }
}
