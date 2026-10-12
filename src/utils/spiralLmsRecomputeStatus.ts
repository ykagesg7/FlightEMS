import type { SpiralLmsNode, SpiralLmsNodeStatus, SpiralLmsUserProgress } from '../types/spiralLms';
import { isSpiralNodeOpensAtLocked } from './spiralLmsOpensAt';

export type SpiralLmsRecomputeContext = {
  readonly publishedNodes: readonly SpiralLmsNode[];
  readonly progressByNodeId: Readonly<Record<string, SpiralLmsUserProgress | undefined>>;
  readonly now: Date;
};

function publishedNodeIds(nodes: readonly SpiralLmsNode[]): Set<string> {
  return new Set(nodes.filter((node) => node.is_published).map((node) => node.id));
}

/** Mirrors `private.spiral_lms_published_prerequisites_met` (published prereqs only). */
export function isSpiralPublishedPrerequisitesMet(
  node: SpiralLmsNode,
  publishedIds: ReadonlySet<string>,
  progressByNodeId: Readonly<Record<string, SpiralLmsUserProgress | undefined>>,
): boolean {
  for (const prerequisiteNodeId of node.prerequisites) {
    if (!publishedIds.has(prerequisiteNodeId)) {
      continue;
    }
    if (progressByNodeId[prerequisiteNodeId]?.status !== 'MASTERED') {
      return false;
    }
  }
  return true;
}

/** Mirrors `private.spiral_lms_z_level_gate_met`. */
export function isSpiralZLevelGateMet(
  zLevel: number,
  publishedNodes: readonly SpiralLmsNode[],
  progressByNodeId: Readonly<Record<string, SpiralLmsUserProgress | undefined>>,
): boolean {
  if (zLevel <= 1) {
    return true;
  }
  const previousLevel = zLevel - 1;
  for (const node of publishedNodes) {
    if (node.z_level !== previousLevel) {
      continue;
    }
    if (progressByNodeId[node.id]?.status !== 'MASTERED') {
      return false;
    }
  }
  return true;
}

function isSpiralZLevelGateSkipped(node: SpiralLmsNode): boolean {
  return node.unlock_config?.z_level_gate === 'off';
}

/**
 * Mirrors `v_locked` in `private.spiral_lms_recompute_node_progress`
 * (`20261012_spiral_lms_record_attempt.sql`).
 */
export function isSpiralNodeRecomputeLocked(
  node: SpiralLmsNode,
  context: SpiralLmsRecomputeContext,
): boolean {
  if (!node.is_published) {
    return true;
  }

  const publishedIds = publishedNodeIds(context.publishedNodes);

  if (isSpiralNodeOpensAtLocked(node.opens_at, context.now)) {
    return true;
  }

  if (!isSpiralPublishedPrerequisitesMet(node, publishedIds, context.progressByNodeId)) {
    return true;
  }

  if (
    !isSpiralZLevelGateSkipped(node) &&
    !isSpiralZLevelGateMet(node.z_level, context.publishedNodes, context.progressByNodeId)
  ) {
    return true;
  }

  return false;
}

/**
 * Display / picker status aligned with server `recompute_node_progress` stored `status`.
 * Progress rows for MASTERED / IN_PROGRESS / AVAILABLE are trusted when not locked
 * (client lacks `user_attempts` to re-derive mastery).
 */
export function recomputeSpiralNodeStoredStatus(
  node: SpiralLmsNode,
  progress: SpiralLmsUserProgress | undefined,
  context: SpiralLmsRecomputeContext,
): SpiralLmsNodeStatus {
  if (!node.is_published) {
    return 'LOCKED';
  }

  if (progress?.status === 'MAINTENANCE') {
    return 'MAINTENANCE';
  }

  if (isSpiralNodeRecomputeLocked(node, context)) {
    return 'LOCKED';
  }

  if (progress?.status === 'MASTERED') {
    return 'MASTERED';
  }
  if (progress?.status === 'IN_PROGRESS') {
    return 'IN_PROGRESS';
  }
  if (progress?.status === 'AVAILABLE') {
    return 'AVAILABLE';
  }

  return 'AVAILABLE';
}

export function buildSpiralLmsRecomputeContext(
  nodes: readonly SpiralLmsNode[],
  progressByNodeId: Readonly<Record<string, SpiralLmsUserProgress | undefined>>,
  now: Date = new Date(),
): SpiralLmsRecomputeContext {
  return {
    publishedNodes: nodes.filter((node) => node.is_published),
    progressByNodeId,
    now,
  };
}
