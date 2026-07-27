import type L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import {
  computeCursorNavaidDistance,
  findNearestNavaidId,
  type CursorNavaidDistance,
} from '../cursorNavaidUtils';
import type { PlanningMapNavaid } from '../planningMapTypes';

/**
 * カーソル位置に対する選択 NAVAID の磁方位・距離。
 * 未選択時は最寄りを初期選択。ユーザーが選んだ id はカーソル移動後も維持。
 */
export function useCursorSelectedNavaid(
  cursorPosition: L.LatLng | null,
  navaidData: PlanningMapNavaid[],
): {
  selectedNavaidId: string | null;
  setSelectedNavaidId: (id: string | null) => void;
  selectNearest: () => void;
  distanceInfo: CursorNavaidDistance | null;
  nearestId: string | null;
} {
  const [selectedNavaidId, setSelectedNavaidId] = useState<string | null>(null);

  const nearestId = useMemo(() => {
    if (!cursorPosition || navaidData.length === 0) return null;
    return findNearestNavaidId(cursorPosition, navaidData);
  }, [cursorPosition, navaidData]);

  useEffect(() => {
    if (!cursorPosition || !nearestId) {
      if (!cursorPosition) setSelectedNavaidId(null);
      return;
    }
    setSelectedNavaidId((prev) => {
      if (prev == null) return nearestId;
      const stillExists = navaidData.some((n) => n.id === prev);
      return stillExists ? prev : nearestId;
    });
  }, [cursorPosition, nearestId, navaidData]);

  const distanceInfo = useMemo(() => {
    if (!cursorPosition || !selectedNavaidId) return null;
    const navaid = navaidData.find((n) => n.id === selectedNavaidId);
    if (!navaid) return null;
    return computeCursorNavaidDistance(cursorPosition, navaid);
  }, [cursorPosition, selectedNavaidId, navaidData]);

  const selectNearest = () => {
    if (nearestId) setSelectedNavaidId(nearestId);
  };

  return {
    selectedNavaidId,
    setSelectedNavaidId,
    selectNearest,
    distanceInfo,
    nearestId,
  };
}
