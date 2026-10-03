import type { WaypointOption } from '../../../types';
import type { UserSavedWaypoint } from './types';

export const SAVED_WAYPOINT_VALUE_PREFIX = 'user-saved:';

export function savedWaypointOptionValue(id: string): string {
  return `${SAVED_WAYPOINT_VALUE_PREFIX}${id}`;
}

export function isSavedWaypointOptionValue(value: string): boolean {
  return value.startsWith(SAVED_WAYPOINT_VALUE_PREFIX);
}

export function parseSavedWaypointIdFromOptionValue(value: string): string | null {
  if (!isSavedWaypointOptionValue(value)) return null;
  return value.slice(SAVED_WAYPOINT_VALUE_PREFIX.length);
}

export function userSavedWaypointToOption(row: UserSavedWaypoint): WaypointOption {
  const ident = row.ident?.trim();
  const labelParts = ['マイ', row.name];
  if (ident) labelParts.push(`(${ident})`);
  return {
    value: savedWaypointOptionValue(row.id),
    label: labelParts.join(' · '),
    name: row.name,
    type: 'UserSaved',
    latitude: row.latitude,
    longitude: row.longitude,
  };
}

/** カタログ Waypoint 検索にマイポイントをマージ（マイを先頭付近） */
export function mergeWaypointSearchOptions(
  catalog: WaypointOption[],
  saved: UserSavedWaypoint[],
): WaypointOption[] {
  const savedOptions = saved.map(userSavedWaypointToOption);
  if (savedOptions.length === 0) return catalog;
  return [...savedOptions, ...catalog];
}
