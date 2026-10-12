import { describe, expect, it } from 'vitest';
import type { SpiralLmsNode, SpiralLmsUserProgress } from '../../types/spiralLms';
import {
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
    unlock_config: {},
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
    updated_at: '2026-10-10T00:00:00.000Z',
    opensAtLocked: false,
    effectiveStatus: 'MASTERED',
  };
}

describe('spiralLmsNodeDisplay', () => {
  it('labels scheduled nodes as 公開予定', () => {
    const node = makeNode({
      id: 'L2-Q1-1',
      opens_at: '2026-12-01T00:00:00.000Z',
    });
    expect(resolveSpiralNodeDisplayStatus(node, {}, fixedNow)).toBe('scheduled');
    expect(spiralLmsDisplayStatusLabel('scheduled')).toBe('公開予定');
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
    expect(resolveSpiralNodeDisplayStatus(node, { 'L1-Q1-1': progress }, fixedNow)).toBe(
      'MAINTENANCE',
    );
    expect(spiralLmsDisplayStatusLabel('MAINTENANCE')).toBe('整備点検');
  });

  it('picks the lowest AVAILABLE node deterministically', () => {
    const nodes = [
      makeNode({ id: 'L2-Q2-1', z_level: 2, quadrant: 2, sort_order: 1 }),
      makeNode({ id: 'L1-Q2-1', z_level: 1, quadrant: 2, sort_order: 1 }),
      makeNode({ id: 'L1-Q1-1', z_level: 1, quadrant: 1, sort_order: 1 }),
      makeNode({ id: 'L1-Q1-2', z_level: 1, quadrant: 1, sort_order: 2, prerequisites: ['L1-Q1-1'] }),
    ];
    const progress = {
      'L1-Q1-1': {
        ...masteredProgress('L1-Q1-1'),
        status: 'MASTERED',
      },
      'L1-Q1-2': {
        user_id: 'u1',
        node_id: 'L1-Q1-2',
        status: 'LOCKED',
        attempts: 0,
        last_attempt_at: null,
        mastered_at: null,
        updated_at: '2026-10-01T00:00:00.000Z',
        opensAtLocked: false,
        effectiveStatus: 'AVAILABLE',
      },
      'L1-Q2-1': {
        user_id: 'u1',
        node_id: 'L1-Q2-1',
        status: 'LOCKED',
        attempts: 0,
        last_attempt_at: null,
        mastered_at: null,
        updated_at: '2026-10-01T00:00:00.000Z',
        opensAtLocked: false,
        effectiveStatus: 'AVAILABLE',
      },
    };

    expect(pickTodaySpiralUnit(nodes, progress, fixedNow)?.id).toBe('L1-Q1-2');
  });

  it('skips unpublished nodes for today pick', () => {
    const nodes = [
      makeNode({ id: 'L1-Q9-1', is_published: false }),
      makeNode({ id: 'L1-Q1-1' }),
    ];
    expect(pickTodaySpiralUnit(nodes, {}, fixedNow)?.id).toBe('L1-Q1-1');
  });
});
