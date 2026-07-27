import { describe, expect, it } from 'vitest';
import {
  computeCursorNavaidDistance,
  filterNavaidsByQuery,
  findNearestNavaidId,
} from '../../pages/planning/components/map/cursorNavaidUtils';
import type { PlanningMapNavaid } from '../../pages/planning/components/map/planningMapTypes';

const navaids: PlanningMapNavaid[] = [
  { id: 'AAA', name: 'Alpha', coordinates: { lat: 35.0, lng: 139.0 } as PlanningMapNavaid['coordinates'] },
  { id: 'BBB', name: 'Bravo Station', coordinates: { lat: 36.0, lng: 140.0 } as PlanningMapNavaid['coordinates'] },
  { id: 'CCC', name: 'Charlie', coordinates: { lat: 34.0, lng: 135.0 } as PlanningMapNavaid['coordinates'] },
];

describe('cursorNavaidUtils', () => {
  it('findNearestNavaidId returns closest id', () => {
    expect(findNearestNavaidId({ lat: 35.01, lng: 139.01 }, navaids)).toBe('AAA');
  });

  it('findNearestNavaidId returns null for empty list', () => {
    expect(findNearestNavaidId({ lat: 35, lng: 139 }, [])).toBeNull();
  });

  it('computeCursorNavaidDistance returns nm and bearing', () => {
    const info = computeCursorNavaidDistance({ lat: 35.0, lng: 139.1 }, navaids[0]!);
    expect(info.id).toBe('AAA');
    expect(info.distanceNm).toBeGreaterThan(0);
    expect(info.bearing).toBeGreaterThanOrEqual(0);
    expect(info.bearing).toBeLessThan(360);
  });

  it('filterNavaidsByQuery matches id and name', () => {
    expect(filterNavaidsByQuery(navaids, 'bb').map((n) => n.id)).toEqual(['BBB']);
    expect(filterNavaidsByQuery(navaids, 'bravo').map((n) => n.id)).toEqual(['BBB']);
  });

  it('filterNavaidsByQuery limits results', () => {
    const many = Array.from({ length: 50 }, (_, i) => ({
      id: `N${String(i).padStart(2, '0')}`,
      name: `Navaid ${i}`,
      coordinates: { lat: 35, lng: 139 } as PlanningMapNavaid['coordinates'],
    }));
    expect(filterNavaidsByQuery(many, '', 10)).toHaveLength(10);
  });
});
