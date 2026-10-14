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

describe('spiralLmsRecomputeStatus (client locking)', () => {
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

  it('locks L2 until all non-excluded L1 nodes are mastered (z gate)', () => {
    const l1Excluded = makeNode({
      id: 'L1-EX',
      z_level: 1,
      sort_order: 3,
      unlock_config: { exclude_from_z_gate: true },
    });
    const progressByNodeId = {
      'L1-Q1-1': progress('L1-Q1-1', 'AVAILABLE'),
    };
    const ctx = buildSpiralLmsRecomputeContext([...published, l1Excluded], progressByNodeId, fixedNow);

    expect(isSpiralZLevelGateMet(2, ctx.publishedNodes, progressByNodeId)).toBe(false);
    expect(isSpiralNodeRecomputeLocked(l2a, ctx)).toBe(true);
    expect(recomputeSpiralNodeStoredStatus(l2a, undefined, ctx)).toBe('LOCKED');
  });

  it('z gate passes when only exclude_from_z_gate L1 nodes are not mastered', () => {
    const l1Regular = makeNode({ id: 'L1-REG', z_level: 1, sort_order: 1 });
    const l1Excluded = makeNode({
      id: 'L1-EX',
      z_level: 1,
      sort_order: 2,
      unlock_config: { exclude_from_z_gate: true },
    });
    const l2 = makeNode({ id: 'L2-TGT', z_level: 2, sort_order: 1 });
    const progressByNodeId = {
      'L1-REG': progress('L1-REG', 'MASTERED'),
    };
    const ctx = buildSpiralLmsRecomputeContext([l1Regular, l1Excluded, l2], progressByNodeId, fixedNow);
    expect(isSpiralZLevelGateMet(2, ctx.publishedNodes, progressByNodeId)).toBe(true);
  });

  it('keeps server LOCKED when z gate blocks despite stored AVAILABLE', () => {
    const progressByNodeId = {
      'L1-Q1-1': progress('L1-Q1-1', 'MASTERED'),
      'L2-Q1-1': progress('L2-Q1-1', 'AVAILABLE'),
    };
    const ctx = buildSpiralLmsRecomputeContext(published, progressByNodeId, fixedNow);
    expect(recomputeSpiralNodeStoredStatus(l2a, progressByNodeId['L2-Q1-1'], ctx)).toBe('LOCKED');
  });

  it('honours unlock_config z_level_gate off on the target node', () => {
    const l2Off = makeNode({
      id: 'L2-Q9-1',
      z_level: 2,
      unlock_config: { z_level_gate: 'off' },
    });
    const ctx = buildSpiralLmsRecomputeContext([l1a, l2Off], {}, fixedNow);
    expect(isSpiralNodeRecomputeLocked(l2Off, ctx)).toBe(false);
    expect(recomputeSpiralNodeStoredStatus(l2Off, undefined, ctx)).toBe('AVAILABLE');
  });

  it('treats MAINTENANCE at previous z_level as satisfying the z gate', () => {
    const l1Regular = makeNode({ id: 'L1-REG', z_level: 1, sort_order: 1 });
    const l1Maint = makeNode({ id: 'L1-MNT', z_level: 1, sort_order: 2 });
    const progressByNodeId = {
      'L1-REG': progress('L1-REG', 'MASTERED'),
      'L1-MNT': progress('L1-MNT', 'MAINTENANCE'),
    };
    expect(
      isSpiralZLevelGateMet(2, [l1Regular, l1Maint], progressByNodeId),
    ).toBe(true);
  });

  it('treats MAINTENANCE prerequisites as satisfied for unlock', () => {
    const publishedIds = new Set(published.map((node) => node.id));
    const progressByNodeId = {
      'L1-Q1-1': progress('L1-Q1-1', 'MAINTENANCE'),
    };
    expect(isSpiralPublishedPrerequisitesMet(l1b, publishedIds, progressByNodeId)).toBe(true);
  });

  it('preserves MAINTENANCE without recomputing', () => {
    const ctx = buildSpiralLmsRecomputeContext([l1a], {}, fixedNow);
    const row = progress('L1-Q1-1', 'MAINTENANCE');
    expect(recomputeSpiralNodeStoredStatus(l1a, row, ctx)).toBe('MAINTENANCE');
  });
});
