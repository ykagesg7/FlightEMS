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
    const prereqStatus = progressByNodeId[prerequisiteNodeId]?.status;
    if (prereqStatus !== 'MASTERED' && prereqStatus !== 'MAINTENANCE') {
      return false;
    }
  }
  return true;
}

function isNodeExcludedFromZGate(node: SpiralLmsNode): boolean {
  const flag = node.unlock_config?.exclude_from_z_gate;
  return flag === true || flag === 'true';
}

/** Mirrors `private.spiral_lms_z_level_gate_met` (PR ④: `exclude_from_z_gate` nodes omitted). */
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
    if (!node.is_published || node.z_level !== previousLevel) {
      continue;
    }
    if (isNodeExcludedFromZGate(node)) {
      continue;
    }
    const levelStatus = progressByNodeId[node.id]?.status;
    if (levelStatus !== 'MASTERED' && levelStatus !== 'MAINTENANCE') {
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
 * Hub display status when gates are open. MASTERED / IN_PROGRESS / AVAILABLE come from
 * `user_progress` (server is authoritative; UI does not re-grade attempts or slugs).
 * After unlock, a stale LOCKED row may still read as AVAILABLE here until the server
 * recomputes — accepted for dev preview (see scripts/database/INDEX.md).
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
