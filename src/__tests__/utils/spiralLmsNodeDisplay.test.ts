import { describe, expect, it } from 'vitest';
import type { SpiralLmsNode, SpiralLmsUserProgress } from '../../types/spiralLms';
import {
  buildSpiralLmsNodeDisplayContext,
  pickTodaySpiralUnit,
  resolveSpiralNodeDisplayStatus,
  spiralLmsDisplayStatusLabel,
} from '../../utils/spiralLmsNodeDisplay';

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

function masteredProgress(nodeId: string): SpiralLmsUserProgress {
  return {
    user_id: 'u1',
    node_id: nodeId,
    status: 'MASTERED',
    attempts: 1,
    last_attempt_at: '2026-10-10T00:00:00.000Z',
    mastered_at: '2026-10-10T00:00:00.000Z',
    updated_at: '2026-10-01T00:00:00.000Z',
    opensAtLocked: false,
    effectiveStatus: 'MASTERED',
  };
}

function displayCtx(
  nodes: SpiralLmsNode[],
  progressByNodeId: Record<string, SpiralLmsUserProgress | undefined>,
  slugToArticleId: Record<string, string> = {},
  publishedAtByContentId: Record<string, string | undefined> = {},
) {
  return buildSpiralLmsNodeDisplayContext(
    nodes,
    progressByNodeId,
    slugToArticleId,
    publishedAtByContentId,
    fixedNow,
  );
}

describe('spiralLmsNodeDisplay', () => {
  it('labels opens_at future as 公開予定', () => {
    const node = makeNode({
      id: 'L2-Q1-1',
      opens_at: '2026-12-01T00:00:00.000Z',
    });
    const ctx = displayCtx([node], {});
    expect(resolveSpiralNodeDisplayStatus(node, ctx)).toBe('scheduled');
    expect(spiralLmsDisplayStatusLabel('scheduled')).toBe('公開予定');
  });

  it('labels all required articles unreleased as 公開予定', () => {
    const node = makeNode({
      id: 'L1-Q1-1',
      contents: [{ node_id: 'L1-Q1-1', content_slug: 'slug-a', content_type: 'lesson', is_required: true, sort_order: 1 }],
    });
    const ctx = displayCtx([node], {}, { 'slug-a': 'ART-A' }, { 'ART-A': '2026-12-01' });
    expect(resolveSpiralNodeDisplayStatus(node, ctx)).toBe('scheduled');
  });

  it('shows MAINTENANCE when stored on progress', () => {
    const node = makeNode({ id: 'L1-Q1-1' });
    const progress: SpiralLmsUserProgress = {
      user_id: 'u1',
      node_id: 'L1-Q1-1',
      status: 'MAINTENANCE',
      attempts: 2,
      last_attempt_at: null,
      mastered_at: '2026-10-01T00:00:00.000Z',
      updated_at: '2026-10-01T00:00:00.000Z',
      opensAtLocked: false,
      effectiveStatus: 'MAINTENANCE',
    };
    const ctx = displayCtx([node], { 'L1-Q1-1': progress });
    expect(resolveSpiralNodeDisplayStatus(node, ctx)).toBe('MAINTENANCE');
    expect(spiralLmsDisplayStatusLabel('MAINTENANCE')).toBe('整備点検');
  });

  it('does not pick LOCKED nodes for today (z gate)', () => {
    const nodes = [
      makeNode({ id: 'L2-Q2-1', z_level: 2, quadrant: 2, sort_order: 1 }),
      makeNode({ id: 'L1-Q1-1', z_level: 1, quadrant: 1, sort_order: 1 }),
    ];
    const progress = {
      'L2-Q2-1': {
        user_id: 'u1',
        node_id: 'L2-Q2-1',
        status: 'AVAILABLE',
        attempts: 0,
        last_attempt_at: null,
        mastered_at: null,
        updated_at: '2026-10-01T00:00:00.000Z',
        opensAtLocked: false,
        effectiveStatus: 'AVAILABLE',
      },
    };
    const ctx = displayCtx(nodes, progress);
    expect(pickTodaySpiralUnit(nodes, ctx)?.id).toBe('L1-Q1-1');
  });

  it('prefers IN_PROGRESS over AVAILABLE', () => {
    const nodes = [
      makeNode({ id: 'L1-Q1-1', z_level: 1, quadrant: 1, sort_order: 1 }),
      makeNode({ id: 'L1-Q1-2', z_level: 1, quadrant: 1, sort_order: 2, prerequisites: ['L1-Q1-1'] }),
    ];
    const progress = {
      'L1-Q1-1': masteredProgress('L1-Q1-1'),
      'L1-Q1-2': {
        user_id: 'u1',
        node_id: 'L1-Q1-2',
        status: 'IN_PROGRESS',
        attempts: 1,
        last_attempt_at: '2026-10-11T00:00:00.000Z',
        mastered_at: null,
        updated_at: '2026-10-01T00:00:00.000Z',
        opensAtLocked: false,
        effectiveStatus: 'IN_PROGRESS',
      },
    };
    const ctx = displayCtx(nodes, progress);
    expect(pickTodaySpiralUnit(nodes, ctx)?.id).toBe('L1-Q1-2');
  });

  it('skips unpublished nodes for today pick', () => {
    const nodes = [
      makeNode({ id: 'L1-Q9-1', is_published: false }),
      makeNode({ id: 'L1-Q1-1' }),
    ];
    const ctx = displayCtx(nodes, {});
    expect(pickTodaySpiralUnit(nodes, ctx)?.id).toBe('L1-Q1-1');
  });
});
