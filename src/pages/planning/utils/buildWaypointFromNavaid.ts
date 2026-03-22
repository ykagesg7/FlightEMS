import type { NavaidOption, Waypoint } from '../../../types/index';
import { calculateOffsetPoint } from '../../../utils/offset';
import { validateMagneticOffsetFields } from './magneticOffsetValidation';

export type BuildWaypointFromNavaidResult =
  | { ok: true; waypoint: Waypoint }
  | { ok: false; error: string };

export function buildWaypointFromNavaid(
  selected: NavaidOption,
  bearingStr: string,
  distanceStr: string
): BuildWaypointFromNavaidResult {
  const pairErr = validateMagneticOffsetFields(bearingStr, distanceStr);
  if (pairErr) return { ok: false, error: pairErr };

  const displayName = selected.name?.trim() ? selected.name : selected.label;
  const hasOffset = bearingStr.trim() !== '';

  if (hasOffset) {
    const bearingNum = parseFloat(bearingStr);
    const distanceNum = parseFloat(distanceStr);
    if (!Number.isFinite(bearingNum) || !Number.isFinite(distanceNum)) {
      return { ok: false, error: '磁方位・距離の数値が無効です' };
    }
    const offset = calculateOffsetPoint(
      selected.latitude,
      selected.longitude,
      bearingNum,
      distanceNum
    );
    if (!offset) {
      return { ok: false, error: 'オフセット計算に失敗しました' };
    }
    return {
      ok: true,
      waypoint: {
        id: `${selected.value}-${bearingNum}-${distanceNum}`,
        name: `${displayName}/${bearingNum}°/${distanceNum}nm`,
        type: 'navaid',
        sourceId: selected.value,
        ch: selected.ch,
        coordinates: [offset.lon, offset.lat],
        latitude: offset.lat,
        longitude: offset.lon,
        nameEditable: true,
        metadata: {
          baseNavaid: displayName,
          bearing: bearingNum,
          distance: distanceNum,
          baseLatitude: selected.latitude,
          baseLongitude: selected.longitude,
        },
      },
    };
  }

  return {
    ok: true,
    waypoint: {
      id: selected.value,
      name: displayName,
      type: 'navaid',
      sourceId: selected.value,
      ch: selected.ch,
      coordinates: [selected.longitude, selected.latitude],
      latitude: selected.latitude,
      longitude: selected.longitude,
      nameEditable: true,
      metadata: {
        baseNavaid: displayName,
        bearing: undefined,
        distance: undefined,
        baseLatitude: selected.latitude,
        baseLongitude: selected.longitude,
      },
    },
  };
}
