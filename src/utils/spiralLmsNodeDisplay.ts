import type { SpiralLmsNode, SpiralLmsNodeStatus, SpiralLmsUserProgress } from '../types/spiralLms';
import { isSpiralRequiredContentScheduled } from './spiralLmsArticleRelease';
import { isSpiralNodeOpensAtLocked } from './spiralLmsOpensAt';
import {
  buildSpiralLmsRecomputeContext,
  recomputeSpiralNodeStoredStatus,
  type SpiralLmsRecomputeContext,
} from './spiralLmsRecomputeStatus';

/** UI label when content is not yet released to learners. */
export type SpiralLmsScheduledDisplayStatus = 'scheduled';

export type SpiralLmsDisplayStatus = SpiralLmsNodeStatus | SpiralLmsScheduledDisplayStatus;

export type SpiralLmsNodeDisplayContext = SpiralLmsRecomputeContext & {
  readonly slugToArticleId: Readonly<Record<string, string>>;
  readonly publishedAtByContentId: Readonly<Record<string, string | undefined>>;
};

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

export function isSpiralNodeScheduledForDisplay(
  node: SpiralLmsNode,
  displayContext: SpiralLmsNodeDisplayContext,
): boolean {
  if (isSpiralNodeOpensAtLocked(node.opens_at, displayContext.now)) {
    return true;
  }
  return isSpiralRequiredContentScheduled(
    node,
    displayContext.slugToArticleId,
    displayContext.publishedAtByContentId,
    displayContext.now,
  );
}

export function resolveSpiralNodeStoredStatus(
  node: SpiralLmsNode,
  progressByNodeId: Readonly<Record<string, SpiralLmsUserProgress | undefined>>,
  recomputeContext: SpiralLmsRecomputeContext,
): SpiralLmsNodeStatus {
  return recomputeSpiralNodeStoredStatus(node, progressByNodeId[node.id], recomputeContext);
}

export function resolveSpiralNodeDisplayStatus(
  node: SpiralLmsNode,
  displayContext: SpiralLmsNodeDisplayContext,
): SpiralLmsDisplayStatus {
  if (isSpiralNodeScheduledForDisplay(node, displayContext)) {
    return 'scheduled';
  }

  return resolveSpiralNodeStoredStatus(node, displayContext.progressByNodeId, displayContext);
}

export function listPublishedSpiralNodes(nodes: readonly SpiralLmsNode[]): SpiralLmsNode[] {
  return nodes.filter((node) => node.is_published).sort(compareSpiralLmsNodes);
}

export function pickTodaySpiralUnit(
  nodes: readonly SpiralLmsNode[],
  displayContext: SpiralLmsNodeDisplayContext,
): SpiralLmsNode | null {
  const published = listPublishedSpiralNodes(nodes);

  const pickFrom = (targetStatus: SpiralLmsNodeStatus): SpiralLmsNode | null => {
    for (const node of published) {
      const displayStatus = resolveSpiralNodeDisplayStatus(node, displayContext);
      if (displayStatus === targetStatus) {
        return node;
      }
    }
    return null;
  };

  return pickFrom('IN_PROGRESS') ?? pickFrom('AVAILABLE');
}

export function buildSpiralLmsNodeDisplayContext(
  nodes: readonly SpiralLmsNode[],
  progressByNodeId: Readonly<Record<string, SpiralLmsUserProgress | undefined>>,
  slugToArticleId: Readonly<Record<string, string>>,
  publishedAtByContentId: Readonly<Record<string, string | undefined>>,
  now: Date = new Date(),
): SpiralLmsNodeDisplayContext {
  return {
    ...buildSpiralLmsRecomputeContext(nodes, progressByNodeId, now),
    slugToArticleId,
    publishedAtByContentId,
  };
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
