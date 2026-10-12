import { describe, expect, it } from 'vitest';
import type { SpiralLmsNode, SpiralLmsUserProgress } from '../../types/spiralLms';
import {
  buildSpiralLmsRecomputeContext,
  isSpiralNodeRecomputeLocked,
  isSpiralPublishedPrerequisitesMet,
  isSpiralZLevelGateMet,
  recomputeSpiralNodeStoredStatus,
} from '../../utils/spiralLmsRecomputeStatus';

const fixedNow = new Date('2026-10-12T12:00:00.000Z');

function makeNode(overrides: Partial<SpiralLmsNode> & Pick<SpiralLmsNode, 'id'>): SpiralLmsNode {
  return {
    title: overrides.title ?? overrides.id,
    quadrant: overrides.quadrant ?? 1,
    z_level: overrides.z_level ?? 1,
    sort_order: overrides.sort_order ?? 1,
    passing_score: null,
    unlock_config: overrides.unlock_config ?? {},
    is_published: overrides.is_published ?? true,
    opens_at: overrides.opens_at ?? null,
    created_at: '2026-10-01T00:00:00.000Z',
    updated_at: '2026-10-01T00:00:00.000Z',
    opensAtLocked: false,
    prerequisites: overrides.prerequisites ?? [],
    contents: overrides.contents ?? [],
    ...overrides,
  };
}

function progress(
  nodeId: string,
  status: SpiralLmsUserProgress['status'],
): SpiralLmsUserProgress {
  return {
    user_id: 'u1',
    node_id: nodeId,
    status,
    attempts: 0,
    last_attempt_at: null,
    mastered_at: status === 'MASTERED' ? '2026-10-10T00:00:00.000Z' : null,
    updated_at: '2026-10-01T00:00:00.000Z',
    opensAtLocked: false,
    effectiveStatus: status,
  };
}

/**
 * Reference port of `private.spiral_lms_recompute_node_progress` status assignment
 * (without MAINTENANCE short-circuit) for equivalence checks in this file only.
 */
function sqlRecomputeStatusReference(
  node: SpiralLmsNode,
  prevStatus: SpiralLmsUserProgress['status'] | undefined,
  prevAttempts: number,
  publishedNodes: SpiralLmsNode[],
  progressByNodeId: Record<string, SpiralLmsUserProgress | undefined>,
  now: Date,
): SpiralLmsUserProgress['status'] {
  const publishedIds = new Set(publishedNodes.filter((n) => n.is_published).map((n) => n.id));
  const skipZ = node.unlock_config?.z_level_gate === 'off';
  const opensLocked = node.opens_at != null && new Date(node.opens_at) > now;
  const prereqMet = isSpiralPublishedPrerequisitesMet(node, publishedIds, progressByNodeId);
  const zMet = isSpiralZLevelGateMet(node.z_level, publishedNodes, progressByNodeId);
  const locked = opensLocked || !prereqMet || (!skipZ && !zMet);

  const storedMastered = prevStatus === 'MASTERED';
  const storedInProgress = prevStatus === 'IN_PROGRESS';

  if (locked) return 'LOCKED';
  if (storedMastered) return 'MASTERED';
  if (storedInProgress) return 'IN_PROGRESS';
  if (prereqMet && (skipZ || zMet)) return 'AVAILABLE';
  return 'LOCKED';
}

describe('spiralLmsRecomputeStatus (SQL parity)', () => {
  const l1a = makeNode({ id: 'L1-Q1-1', z_level: 1, quadrant: 1, sort_order: 1 });
  const l1b = makeNode({
    id: 'L1-Q1-2',
    z_level: 1,
    quadrant: 1,
    sort_order: 2,
    prerequisites: ['L1-Q1-1'],
  });
  const l2a = makeNode({
    id: 'L2-Q1-1',
    z_level: 2,
    quadrant: 1,
    sort_order: 1,
    prerequisites: ['L1-Q1-2'],
  });
  const published = [l1a, l1b, l2a];

  it('matches SQL reference for z_level gate (L2 locked until all L1 mastered)', () => {
    const progressByNodeId = {
      'L1-Q1-1': progress('L1-Q1-1', 'AVAILABLE'),
    };
    const ctx = buildSpiralLmsRecomputeContext(published, progressByNodeId, fixedNow);

    expect(isSpiralNodeRecomputeLocked(l2a, ctx)).toBe(true);
    expect(recomputeSpiralNodeStoredStatus(l2a, undefined, ctx)).toBe('LOCKED');

    const ref = sqlRecomputeStatusReference(l2a, undefined, 0, published, progressByNodeId, fixedNow);
    expect(recomputeSpiralNodeStoredStatus(l2a, undefined, ctx)).toBe(ref);
  });

  it('matches SQL reference when prerequisites and z gate are satisfied', () => {
    const progressByNodeId = {
      'L1-Q1-1': progress('L1-Q1-1', 'MASTERED'),
      'L1-Q1-2': progress('L1-Q1-2', 'MASTERED'),
      'L2-Q1-1': progress('L2-Q1-1', 'AVAILABLE'),
    };
    const ctx = buildSpiralLmsRecomputeContext(published, progressByNodeId, fixedNow);

    const ref = sqlRecomputeStatusReference(
      l2a,
      progressByNodeId['L2-Q1-1']?.status,
      0,
      published,
      progressByNodeId,
      fixedNow,
    );
    expect(recomputeSpiralNodeStoredStatus(l2a, progressByNodeId['L2-Q1-1'], ctx)).toBe(ref);
    expect(ref).toBe('AVAILABLE');
  });

  it('keeps server LOCKED even when prerequisite row alone would unlock (z gate)', () => {
    const progressByNodeId = {
      'L1-Q1-1': progress('L1-Q1-1', 'MASTERED'),
      'L2-Q1-1': progress('L2-Q1-1', 'LOCKED'),
    };
    const ctx = buildSpiralLmsRecomputeContext(published, progressByNodeId, fixedNow);
    expect(recomputeSpiralNodeStoredStatus(l2a, progressByNodeId['L2-Q1-1'], ctx)).toBe('LOCKED');
  });

  it('honours unlock_config z_level_gate off', () => {
    const l2Off = makeNode({
      id: 'L2-Q9-1',
      z_level: 2,
      unlock_config: { z_level_gate: 'off' },
    });
    const ctx = buildSpiralLmsRecomputeContext([l1a, l2Off], {}, fixedNow);
    expect(isSpiralNodeRecomputeLocked(l2Off, ctx)).toBe(false);
    expect(recomputeSpiralNodeStoredStatus(l2Off, undefined, ctx)).toBe('AVAILABLE');
  });

  it('preserves MAINTENANCE without recomputing', () => {
    const ctx = buildSpiralLmsRecomputeContext([l1a], {}, fixedNow);
    const row = progress('L1-Q1-1', 'MAINTENANCE');
    expect(recomputeSpiralNodeStoredStatus(l1a, row, ctx)).toBe('MAINTENANCE');
  });
});
