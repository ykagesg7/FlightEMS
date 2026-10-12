import type { SpiralLmsNode, SpiralLmsNodeStatus, SpiralLmsUserProgress } from '../types/spiralLms';
import {
  areSpiralPrerequisitesMet,
  resolveSpiralEffectiveStatus,
} from './spiralLmsEffectiveStatus';
import { isSpiralNodeOpensAtLocked } from './spiralLmsOpensAt';

/** UI label when `opens_at` is still in the future. */
export type SpiralLmsScheduledDisplayStatus = 'scheduled';

export type SpiralLmsDisplayStatus = SpiralLmsNodeStatus | SpiralLmsScheduledDisplayStatus;

export function compareSpiralLmsNodes(a: SpiralLmsNode, b: SpiralLmsNode): number {
  if (a.z_level !== b.z_level) {
    return a.z_level - b.z_level;
  }
  if (a.quadrant !== b.quadrant) {
    return a.quadrant - b.quadrant;
  }
  if (a.sort_order !== b.sort_order) {
    return a.sort_order - b.sort_order;
  }
  return a.id.localeCompare(b.id);
}

export function resolveSpiralNodeDisplayStatus(
  node: SpiralLmsNode,
  progressByNodeId: Readonly<Record<string, SpiralLmsUserProgress | undefined>>,
  now: Date = new Date(),
): SpiralLmsDisplayStatus {
  const opensAtLocked = isSpiralNodeOpensAtLocked(node.opens_at, now);
  if (opensAtLocked) {
    return 'scheduled';
  }

  const progress = progressByNodeId[node.id];
  const storedStatus: SpiralLmsNodeStatus = progress?.status ?? 'LOCKED';
  const prerequisitesMet = areSpiralPrerequisitesMet(node.prerequisites, progressByNodeId);

  return resolveSpiralEffectiveStatus(storedStatus, false, prerequisitesMet);
}

export function listPublishedSpiralNodes(nodes: readonly SpiralLmsNode[]): SpiralLmsNode[] {
  return nodes.filter((node) => node.is_published).sort(compareSpiralLmsNodes);
}

export function pickTodaySpiralUnit(
  nodes: readonly SpiralLmsNode[],
  progressByNodeId: Readonly<Record<string, SpiralLmsUserProgress | undefined>>,
  now: Date = new Date(),
): SpiralLmsNode | null {
  const published = listPublishedSpiralNodes(nodes);
  for (const node of published) {
    if (resolveSpiralNodeDisplayStatus(node, progressByNodeId, now) === 'AVAILABLE') {
      return node;
    }
  }
  return null;
}

export function spiralLmsDisplayStatusLabel(status: SpiralLmsDisplayStatus): string {
  switch (status) {
    case 'scheduled':
      return '公開予定';
    case 'LOCKED':
      return 'ロック中';
    case 'AVAILABLE':
      return '学習可能';
    case 'IN_PROGRESS':
      return '学習中';
    case 'MASTERED':
      return '習得済み';
    case 'MAINTENANCE':
      return '整備点検';
    default:
      return status;
  }
}

export function spiralLmsQuadrantLabel(quadrant: number): string {
  return `Q${quadrant}`;
}

export function spiralLmsLevelLabel(zLevel: number): string {
  return `L${zLevel}`;
}
