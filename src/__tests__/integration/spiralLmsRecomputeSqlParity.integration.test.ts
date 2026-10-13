import { randomUUID } from 'node:crypto';
import { describe, expect, it, afterAll, beforeAll, beforeEach } from 'vitest';
import {
  buildSpiralLmsRecomputeContext,
  recomputeSpiralNodeStoredStatus,
} from '../../utils/spiralLmsRecomputeStatus';
import {
  computeSpiralMiniQuizVersionFingerprint,
  isSpiralMiniQuizEverPassedForCurrentVersion,
  isSpiralMiniQuizPassCountedForVersion,
} from '../../utils/spiralLmsMiniQuizVersion';
import {
  SPIRAL_PG_TEST_USER,
  ensureSpiralLmsMigrations,
  fetchSpiralNodesFromDb,
  fetchSpiralProgressFromDb,
  insertMiniQuizStem,
  psql,
  psqlLastLine,
  resetSpiralCatalog,
  spiralPgUrl,
  sqlMiniQuizMet,
  sqlMiniQuizVersion,
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

  afterAll(() => {
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
INSERT INTO public.user_attempts (
  user_id, node_id, attempt_kind, passed, score, client_attempt_id, mini_quiz_version
)
VALUES (
  '${SPIRAL_PG_TEST_USER}'::uuid,
  'MQ-ONLY',
  'mini_quiz',
  true,
  90,
  gen_random_uuid(),
  private.spiral_lms_node_mini_quiz_version('MQ-ONLY')
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

const VERSION_QUESTION_A = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

function fetchVersionRows(nodeId: string) {
  const raw = psql(`
SELECT coalesce(json_agg(row_to_json(t) ORDER BY t.sort_order), '[]'::json)
FROM (
  SELECT
    q.sort_order,
    q.id::text AS id,
    q.prompt,
    q.question_type,
    q.options::text AS options_text,
    k.correct_option_ids
  FROM public.node_mini_quiz_questions q
  INNER JOIN private.node_mini_quiz_answer_keys k ON k.question_id = q.id
  WHERE q.node_id = '${nodeId}'
) t;
`);
  return JSON.parse(raw || '[]') as Array<{
    sort_order: number;
    id: string;
    prompt: string;
    question_type: string;
    options_text: string;
    correct_option_ids: string[];
  }>;
}

function submitMiniQuiz(nodeId: string, questionId: string, optionId: string, clientId: string) {
  const json = psqlLastLine(`
SET request.jwt.claim.sub = '${SPIRAL_PG_TEST_USER}';
SELECT public.submit_mini_quiz(
  '${nodeId}',
  '${clientId}'::uuid,
  jsonb_build_array(
    jsonb_build_object(
      'question_id', '${questionId}',
      'selected_option_ids', jsonb_build_array('${optionId}')
    )
  )
)::text;
`);
  return JSON.parse(json) as {
    passed: boolean;
    score?: number;
    results: unknown;
    node_status?: string;
  };
}

describePg('spiral LMS mini-quiz version parity (Postgres)', () => {
  beforeAll(() => {
    ensureSpiralLmsMigrations();
  });

  beforeEach(() => {
    resetSpiralCatalog();
  });

  afterAll(() => {
    resetSpiralCatalog();
  });

  it('TS fingerprint matches SQL spiral_lms_node_mini_quiz_version', () => {
    upsertNode({ id: 'MQ-V', z_level: 1, passing_score: 80 });
    insertMiniQuizStem('MQ-V', VERSION_QUESTION_A);

    const sqlVersion = sqlMiniQuizVersion('MQ-V');
    const tsVersion = computeSpiralMiniQuizVersionFingerprint(fetchVersionRows('MQ-V'));
    expect(tsVersion).toBe(sqlVersion);
  });

  it('submit_mini_quiz stores version; old pass does not count after stem revision', () => {
    upsertNode({ id: 'MQ-REV', z_level: 1, passing_score: 80 });
    insertMiniQuizStem('MQ-REV', VERSION_QUESTION_A);

    const passClient = randomUUID();
    const passResp = submitMiniQuiz('MQ-REV', VERSION_QUESTION_A, 'a', passClient);
    expect(passResp.passed).toBe(true);
    expect(sqlRecomputeAndReadStatus(SPIRAL_PG_TEST_USER, 'MQ-REV')).toBe('MASTERED');

    const storedVersion = psql(`
SELECT mini_quiz_version FROM public.user_attempts
WHERE user_id = '${SPIRAL_PG_TEST_USER}'::uuid AND client_attempt_id = '${passClient}'::uuid;
`);
    expect(storedVersion).toBe(sqlMiniQuizVersion('MQ-REV'));

    psql(
      `UPDATE public.node_mini_quiz_questions SET prompt = 'revised stem' WHERE id = '${VERSION_QUESTION_A}'::uuid;`,
    );

    const newVersion = sqlMiniQuizVersion('MQ-REV');
    expect(newVersion).not.toBe(storedVersion);
    expect(sqlMiniQuizMet(SPIRAL_PG_TEST_USER, 'MQ-REV')).toBe('f');
    expect(sqlRecomputeAndReadStatus(SPIRAL_PG_TEST_USER, 'MQ-REV')).toBe('IN_PROGRESS');

    const attempts = JSON.parse(
      psql(`
SELECT coalesce(json_agg(row_to_json(ua)), '[]'::json)
FROM (
  SELECT passed, score, mini_quiz_version
  FROM public.user_attempts
  WHERE user_id = '${SPIRAL_PG_TEST_USER}'::uuid AND node_id = 'MQ-REV'
) ua;
`),
    ) as Array<{ passed: boolean; score: number; mini_quiz_version: string }>;

    expect(isSpiralMiniQuizEverPassedForCurrentVersion(attempts, 80, newVersion)).toBe(false);
    expect(isSpiralMiniQuizPassCountedForVersion(attempts[0], 80, newVersion)).toBe(false);
  });

  it('ever_passed hides results until pass on current version', () => {
    upsertNode({ id: 'MQ-HIDE', z_level: 1, passing_score: 80 });
    insertMiniQuizStem('MQ-HIDE', VERSION_QUESTION_A);

    const passClient = randomUUID();
    submitMiniQuiz('MQ-HIDE', VERSION_QUESTION_A, 'a', passClient);

    psql(
      `UPDATE public.node_mini_quiz_questions SET prompt = 'rev2' WHERE id = '${VERSION_QUESTION_A}'::uuid;`,
    );

    const wrongClient = randomUUID();
    const wrongJson = submitMiniQuiz('MQ-HIDE', VERSION_QUESTION_A, 'b', wrongClient);
    expect(wrongJson.passed).toBe(false);
    expect(wrongJson.results).toBeNull();
    expect(wrongJson.score).toBeUndefined();
  });
});
