import { describe, expect, it } from 'vitest';
import {
  applyPlanning3dPopoutState,
  cloneWaypoint3D,
  createPlanning3dPopoutState,
  parsePlanning3dPopoutMessage,
} from '../../pages/planning/components/flight/flightViewer3d/planning3dPopoutSync';

describe('planning3dPopoutSync', () => {
  const sampleWaypoints = [
    { name: 'A', lat: 33.1, lon: 130.2, altFt: 1000, speedKts: 120 },
    { name: 'B', lat: 33.2, lon: 130.3, altFt: 2000, speedKts: 120 },
  ];

  it('round-trips state messages', () => {
    const payload = createPlanning3dPopoutState(sampleWaypoints, false, 3);
    const parsed = parsePlanning3dPopoutMessage({ type: 'state', payload });
    expect(parsed).toEqual({ type: 'state', payload });
  });

  it('ignores stale revisions', () => {
    const newer = applyPlanning3dPopoutState(5, {
      type: 'state',
      payload: createPlanning3dPopoutState(sampleWaypoints, true, 4),
    });
    expect(newer).toBeNull();

    const ok = applyPlanning3dPopoutState(2, {
      type: 'state',
      payload: createPlanning3dPopoutState(sampleWaypoints, true, 3),
    });
    expect(ok?.revision).toBe(3);
    expect(ok?.next.isProUser).toBe(true);
    expect(ok?.next.waypoints).toHaveLength(2);
  });

  it('clones waypoint objects', () => {
    const wp = sampleWaypoints[0]!;
    const copy = cloneWaypoint3D(wp);
    expect(copy).toEqual(wp);
    expect(copy).not.toBe(wp);
  });

  it('parses ready and closed control messages', () => {
    expect(parsePlanning3dPopoutMessage({ type: 'ready' })).toEqual({ type: 'ready' });
    expect(parsePlanning3dPopoutMessage({ type: 'closed' })).toEqual({ type: 'closed' });
  });
});
