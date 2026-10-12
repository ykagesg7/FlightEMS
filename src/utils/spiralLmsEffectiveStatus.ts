import type { SpiralLmsNode, SpiralLmsNodeStatus, SpiralLmsUserProgress } from '../types/spiralLms';
import { isSpiralNodeOpensAtLocked } from './spiralLmsOpensAt';

export function areSpiralPrerequisitesMet(
  prerequisiteNodeIds: readonly string[],
  progressByNodeId: Readonly<Record<string, SpiralLmsUserProgress | undefined>>,
): boolean {
  if (prerequisiteNodeIds.length === 0) {
    return true;
  }
  return prerequisiteNodeIds.every((id) => progressByNodeId[id]?.status === 'MASTERED');
}

/**
 * Display status: clears time-gate-only LOCKED when `opens_at` has passed and prerequisites are met.
 */
export function resolveSpiralEffectiveStatus(
  storedStatus: SpiralLmsNodeStatus,
  opensAtLocked: boolean,
  prerequisitesMet: boolean,
): SpiralLmsNodeStatus {
  if (storedStatus !== 'LOCKED') {
    return storedStatus;
  }
  if (opensAtLocked) {
    return 'LOCKED';
  }
  if (prerequisitesMet) {
    return 'AVAILABLE';
  }
  return storedStatus;
}

export function attachSpiralEffectiveStatuses(
  nodes: readonly SpiralLmsNode[],
  progressByNodeId: Record<string, SpiralLmsUserProgress>,
  now: Date = new Date(),
): Record<string, SpiralLmsUserProgress> {
  const enriched: Record<string, SpiralLmsUserProgress> = {};

  for (const [nodeId, row] of Object.entries(progressByNodeId)) {
    const node = nodes.find((n) => n.id === nodeId);
    const opensAtLocked = node
      ? isSpiralNodeOpensAtLocked(node.opens_at, now)
      : row.opensAtLocked;
    const prerequisitesMet = node
      ? areSpiralPrerequisitesMet(node.prerequisites, progressByNodeId)
      : true;

    enriched[nodeId] = {
      ...row,
      opensAtLocked,
      effectiveStatus: resolveSpiralEffectiveStatus(row.status, opensAtLocked, prerequisitesMet),
    };
  }

  return enriched;
}
