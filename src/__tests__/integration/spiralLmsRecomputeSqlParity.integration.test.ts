import { describe, expect, it, beforeAll, beforeEach } from 'vitest';
import {
  buildSpiralLmsRecomputeContext,
  recomputeSpiralNodeStoredStatus,
} from '../../utils/spiralLmsRecomputeStatus';
import {
  SPIRAL_PG_TEST_USER,
  ensureSpiralLmsMigrations,
  fetchSpiralNodesFromDb,
  fetchSpiralProgressFromDb,
  insertMiniQuizStem,
  psql,
  resetSpiralCatalog,
  spiralPgUrl,
  sqlRecomputeAndReadStatus,
  upsertNode,
  upsertProgress,
} from './helpers/spiralLmsPgHarness';

const pgUrl = spiralPgUrl();
const describePg = pgUrl ? describe : describe.skip;

function expectTsMatchesSqlAfterRecompute(nodeId: string, now: Date): void {
  const sqlStatus = sqlRecomputeAndReadStatus(SPIRAL_PG_TEST_USER, nodeId);
  const nodes = fetchSpiralNodesFromDb(now);
  const progressByNodeId = fetchSpiralProgressFromDb(SPIRAL_PG_TEST_USER, nodes, now);
  const node = nodes.find((n) => n.id === nodeId);
  expect(node).toBeDefined();
  const ctx = buildSpiralLmsRecomputeContext(nodes, progressByNodeId, now);
  const tsStatus = recomputeSpiralNodeStoredStatus(node!, progressByNodeId[nodeId], ctx);
  expect(tsStatus).toBe(sqlStatus);
}

describePg('spiral LMS recompute SQL parity (Postgres)', () => {
  beforeAll(() => {
    ensureSpiralLmsMigrations();
  });

  beforeEach(() => {
    resetSpiralCatalog();
  });

  it('exclude_from_z_gate: prior-level gate ignores flagged nodes', () => {
    upsertNode({ id: 'L1-REG', z_level: 1, sort_order: 1 });
    upsertNode({
      id: 'L1-EX',
      z_level: 1,
      sort_order: 2,
      unlock_config: { exclude_from_z_gate: true },
    });
    upsertNode({ id: 'L2-TGT', z_level: 2, sort_order: 1 });

    upsertProgress(SPIRAL_PG_TEST_USER, 'L1-REG', 'MASTERED');
    const now = new Date();
    expectTsMatchesSqlAfterRecompute('L2-TGT', now);
    expect(sqlRecomputeAndReadStatus(SPIRAL_PG_TEST_USER, 'L2-TGT')).toBe('AVAILABLE');
  });

  it('opens_at: future locks, past allows AVAILABLE', () => {
    upsertNode({ id: 'L1-FUT', z_level: 1 });
    psql(`UPDATE public.nodes SET opens_at = now() + interval '1 day' WHERE id = 'L1-FUT';`);
    const now = new Date();
    expectTsMatchesSqlAfterRecompute('L1-FUT', now);
    expect(sqlRecomputeAndReadStatus(SPIRAL_PG_TEST_USER, 'L1-FUT')).toBe('LOCKED');

    psql(`UPDATE public.nodes SET opens_at = now() - interval '1 day' WHERE id = 'L1-FUT';`);
    expectTsMatchesSqlAfterRecompute('L1-FUT', now);
    expect(sqlRecomputeAndReadStatus(SPIRAL_PG_TEST_USER, 'L1-FUT')).toBe('AVAILABLE');
  });

  it('stale stored LOCKED is cleared by SQL recompute when gates are open', () => {
    upsertNode({ id: 'L1-STALE', z_level: 1 });
    upsertProgress(SPIRAL_PG_TEST_USER, 'L1-STALE', 'LOCKED');
    const now = new Date();
    expectTsMatchesSqlAfterRecompute('L1-STALE', now);
    expect(sqlRecomputeAndReadStatus(SPIRAL_PG_TEST_USER, 'L1-STALE')).toBe('AVAILABLE');
  });

  it('mini-quiz-only node: zero required contents uses quiz readiness', () => {
    const questionId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    upsertNode({ id: 'MQ-ONLY', z_level: 1, passing_score: 80 });
    insertMiniQuizStem('MQ-ONLY', questionId);

    const now = new Date();
    expectTsMatchesSqlAfterRecompute('MQ-ONLY', now);
    expect(sqlRecomputeAndReadStatus(SPIRAL_PG_TEST_USER, 'MQ-ONLY')).toBe('AVAILABLE');

    psql(`
INSERT INTO public.user_attempts (user_id, node_id, attempt_kind, passed, score, client_attempt_id)
VALUES (
  '${SPIRAL_PG_TEST_USER}'::uuid,
  'MQ-ONLY',
  'mini_quiz',
  true,
  90,
  gen_random_uuid()
);
`);
    expectTsMatchesSqlAfterRecompute('MQ-ONLY', now);
    expect(sqlRecomputeAndReadStatus(SPIRAL_PG_TEST_USER, 'MQ-ONLY')).toBe('MASTERED');
  });

  it('MAINTENANCE is not overwritten by recompute', () => {
    upsertNode({ id: 'L1-MNT', z_level: 1 });
    upsertProgress(SPIRAL_PG_TEST_USER, 'L1-MNT', 'MAINTENANCE');
    const now = new Date();
    expectTsMatchesSqlAfterRecompute('L1-MNT', now);
    expect(sqlRecomputeAndReadStatus(SPIRAL_PG_TEST_USER, 'L1-MNT')).toBe('MAINTENANCE');
  });

  it('unlock_config z_level_gate off bypasses prior-level gate', () => {
    upsertNode({ id: 'L1-A', z_level: 1 });
    upsertNode({
      id: 'L2-OFF',
      z_level: 2,
      unlock_config: { z_level_gate: 'off' },
    });
    const now = new Date();
    expectTsMatchesSqlAfterRecompute('L2-OFF', now);
    expect(sqlRecomputeAndReadStatus(SPIRAL_PG_TEST_USER, 'L2-OFF')).toBe('AVAILABLE');
  });
});
