import { describe, expect, it } from 'vitest';
import { dedupeConsecutiveGroundPositions } from '../../pages/planning/components/flight/flightViewer3d/flightViewerRouteGraphics';
import type { Waypoint3D } from '../../pages/planning/components/flight/flightViewer3d/types';

function wp(lon: number, lat: number): Waypoint3D {
  return { name: 'x', lon, lat, altFt: 5000 };
}

describe('dedupeConsecutiveGroundPositions', () => {
  it('removes consecutive duplicate coordinates', () => {
    const pts = dedupeConsecutiveGroundPositions([wp(1, 2), wp(1, 2), wp(3, 4)]);
    expect(pts).toHaveLength(2);
  });
});
