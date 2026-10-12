import { describe, expect, it } from 'vitest';
import type { SpiralLmsNode } from '../../types/spiralLms';
import {
  buildSpiralLms3dLayout,
  computeSpiralLmsNodePosition,
  SPIRAL_LMS_LEVEL_HEIGHT,
} from '../../utils/spiralLmsSpiralLayout';

function makeNode(overrides: Partial<SpiralLmsNode> & Pick<SpiralLmsNode, 'id'>): SpiralLmsNode {
  return {
    title: overrides.title ?? overrides.id,
    quadrant: overrides.quadrant ?? 1,
    z_level: overrides.z_level ?? 1,
    sort_order: overrides.sort_order ?? 1,
    passing_score: null,
    unlock_config: {},
    is_published: overrides.is_published ?? true,
    opens_at: null,
    created_at: '2026-10-01T00:00:00.000Z',
    updated_at: '2026-10-01T00:00:00.000Z',
    opensAtLocked: false,
    prerequisites: [],
    contents: [],
    ...overrides,
  };
}

describe('spiralLmsSpiralLayout', () => {
  it('raises Y with z_level', () => {
    const l1 = computeSpiralLmsNodePosition(makeNode({ id: 'a', z_level: 1 }));
    const l2 = computeSpiralLmsNodePosition(makeNode({ id: 'b', z_level: 2 }));
    expect(l2.y).toBeGreaterThan(l1.y);
    expect(l2.y - l1.y).toBeCloseTo(SPIRAL_LMS_LEVEL_HEIGHT, 5);
  });

  it('separates quadrants by angle (different x/z for same level)', () => {
    const q1 = computeSpiralLmsNodePosition(makeNode({ id: 'q1', quadrant: 1, z_level: 1, sort_order: 1 }));
    const q3 = computeSpiralLmsNodePosition(makeNode({ id: 'q3', quadrant: 3, z_level: 1, sort_order: 1 }));
    expect(q1.x).not.toBeCloseTo(q3.x, 1);
    expect(q1.z).not.toBeCloseTo(q3.z, 1);
  });

  it('buildSpiralLms3dLayout includes only published nodes', () => {
    const layout = buildSpiralLms3dLayout([
      makeNode({ id: 'pub', is_published: true, z_level: 1 }),
      makeNode({ id: 'hidden', is_published: false, z_level: 1 }),
    ]);
    expect(layout.map((entry) => entry.node.id)).toEqual(['pub']);
  });
});
