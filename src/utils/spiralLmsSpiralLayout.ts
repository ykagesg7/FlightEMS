import type { SpiralLmsNode } from '../types/spiralLms';
import { compareSpiralLmsNodes, listPublishedSpiralNodes } from './spiralLmsNodeDisplay';

export type SpiralLms3dVec3 = {
  readonly x: number;
  readonly y: number;
  readonly z: number;
};

export type SpiralLms3dLayoutEntry = {
  readonly node: SpiralLmsNode;
  readonly position: SpiralLms3dVec3;
};

/** Height per Z level (meters in scene units). */
export const SPIRAL_LMS_LEVEL_HEIGHT = 2.5;

/** Base radius at L1; grows per level and sort_order. */
export const SPIRAL_LMS_BASE_RADIUS = 3;

const QUADRANT_SECTOR = Math.PI / 2;
const QUADRANT_CENTER_OFFSET = QUADRANT_SECTOR * 0.25;
const SORT_ANGLE_SPREAD = 0.12;
const SORT_RADIUS_STEP = 0.35;
const SORT_HEIGHT_STEP = 0.18;
const LEVEL_RADIUS_STEP = 1.15;

/**
 * Place published nodes on a spiral: L → height, quadrant → angle sector, sort_order → offset within sector.
 */
export function computeSpiralLmsNodePosition(node: SpiralLmsNode): SpiralLms3dVec3 {
  const levelIndex = Math.max(0, node.z_level - 1);
  const quadrantIndex = Math.max(0, node.quadrant - 1);
  const sortIndex = Math.max(0, node.sort_order - 1);

  const angle =
    quadrantIndex * QUADRANT_SECTOR + QUADRANT_CENTER_OFFSET + sortIndex * SORT_ANGLE_SPREAD;

  const radius =
    SPIRAL_LMS_BASE_RADIUS + levelIndex * LEVEL_RADIUS_STEP + sortIndex * SORT_RADIUS_STEP;

  const y = levelIndex * SPIRAL_LMS_LEVEL_HEIGHT + sortIndex * SORT_HEIGHT_STEP;

  return {
    x: Math.cos(angle) * radius,
    y,
    z: Math.sin(angle) * radius,
  };
}

export function buildSpiralLms3dLayout(nodes: readonly SpiralLmsNode[]): SpiralLms3dLayoutEntry[] {
  const published = listPublishedSpiralNodes(nodes);
  published.sort(compareSpiralLmsNodes);
  return published.map((node) => ({
    node,
    position: computeSpiralLmsNodePosition(node),
  }));
}
