import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  SPIRAL_PG_TEST_USER,
  ensureSpiralLmsMigrations,
  insertMiniQuizStem,
  linkNodeContent,
  linkPrerequisite,
  psql,
  psqlLastLine,
  readMaintenanceSince,
  readMaintenanceClearedAt,
  readMasteredAt,
  readProgressStatus,
  sqlRecomputeAndReadStatus,
  recordContentView,
  resetSpiralCatalog,
  seedPublishedContentSlug,
  spiralPgUrl,
  upsertNode,
} from './helpers/spiralLmsPgHarness';

const pgUrl = spiralPgUrl();
const describePg = pgUrl ? describe : describe.skip;

const CHILD_QUESTION_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const PREREQ_QUESTION_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const CONTENT_SLUG = 'spiral-test-maint-lesson';

function submitMiniQuiz(
  nodeId: string,
  questionId: string,
  optionId: 'a' | 'b',
  clientId: string,
): { passed: boolean } {
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
  return JSON.parse(json) as { passed: boolean };
}

function masterNodeViaMiniQuiz(nodeId: string, questionId: string): void {
  const result = submitMiniQuiz(nodeId, questionId, 'a', randomUUID());
  expect(result.passed).toBe(true);
  expect(readProgressStatus(SPIRAL_PG_TEST_USER, nodeId)).toBe('MASTERED');
}

function doubleQuizFailOnChild(childId: string, questionId: string): void {
  expect(submitMiniQuiz(childId, questionId, 'b', randomUUID()).passed).toBe(false);
  expect(submitMiniQuiz(childId, questionId, 'b', randomUUID()).passed).toBe(false);
}

describePg('spiral LMS MAINTENANCE prerequisites (Postgres)', () => {
  beforeAll(() => {
    ensureSpiralLmsMigrations();
  });

  beforeEach(() => {
    resetSpiralCatalog();
    seedPublishedContentSlug(CONTENT_SLUG);
  });

  afterAll(() => {
    resetSpiralCatalog();
  });

  function seedL2WithL1Prereq(): { child: string; prereq: string } {
    const prereq = 'L1-PRQ';
    const child = 'L2-CHD';
    upsertNode({ id: prereq, z_level: 1, passing_score: 80 });
    upsertNode({ id: child, z_level: 2, passing_score: 80 });
    insertMiniQuizStem(child, CHILD_QUESTION_ID);
    insertMiniQuizStem(prereq, PREREQ_QUESTION_ID);
    linkPrerequisite(child, prereq);
    masterNodeViaMiniQuiz(prereq, PREREQ_QUESTION_ID);
    return { child, prereq };
  }

  it('sets L1 prerequisite to MAINTENANCE after two consecutive mini_quiz failures on L2', () => {
    const { child, prereq } = seedL2WithL1Prereq();

    expect(submitMiniQuiz(child, CHILD_QUESTION_ID, 'b', randomUUID()).passed).toBe(false);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MASTERED');

    expect(submitMiniQuiz(child, CHILD_QUESTION_ID, 'b', randomUUID()).passed).toBe(false);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MAINTENANCE');
    expect(readMaintenanceSince(SPIRAL_PG_TEST_USER, prereq)).not.toBeNull();
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, child)).not.toBe('MAINTENANCE');
  });

  it('does not trigger when only one mini_quiz failure or pass breaks the streak', () => {
    const { child, prereq } = seedL2WithL1Prereq();

    expect(submitMiniQuiz(child, CHILD_QUESTION_ID, 'b', randomUUID()).passed).toBe(false);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MASTERED');

    expect(submitMiniQuiz(child, CHILD_QUESTION_ID, 'a', randomUUID()).passed).toBe(true);
    expect(submitMiniQuiz(child, CHILD_QUESTION_ID, 'b', randomUUID()).passed).toBe(false);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MASTERED');
  });

  it('includes same-z_level published prerequisites (not only z_level - 1)', () => {
    const lateral = 'L2-LAT';
    const child = 'L2-CHD2';
    upsertNode({ id: lateral, z_level: 2, passing_score: 80 });
    upsertNode({
      id: child,
      z_level: 2,
      passing_score: 80,
      unlock_config: { z_level_gate: 'off' },
    });
    insertMiniQuizStem(lateral, PREREQ_QUESTION_ID);
    insertMiniQuizStem(child, CHILD_QUESTION_ID);
    linkPrerequisite(child, lateral);
    masterNodeViaMiniQuiz(lateral, PREREQ_QUESTION_ID);

    doubleQuizFailOnChild(child, CHILD_QUESTION_ID);

    expect(readProgressStatus(SPIRAL_PG_TEST_USER, lateral)).toBe('MAINTENANCE');
  });

  it('applies MAINTENANCE for L1 child with L1 prerequisites', () => {
    const prereq = 'L1-PRQ-A';
    const child = 'L1-CHD';
    upsertNode({ id: prereq, z_level: 1, passing_score: 80 });
    upsertNode({
      id: child,
      z_level: 1,
      passing_score: 80,
      unlock_config: { z_level_gate: 'off' },
    });
    insertMiniQuizStem(prereq, PREREQ_QUESTION_ID);
    insertMiniQuizStem(child, CHILD_QUESTION_ID);
    linkPrerequisite(child, prereq);
    masterNodeViaMiniQuiz(prereq, PREREQ_QUESTION_ID);

    doubleQuizFailOnChild(child, CHILD_QUESTION_ID);

    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MAINTENANCE');
  });

  it('ignores unpublished prerequisite nodes', () => {
    const published = 'L1-PUB';
    const hidden = 'L1-HID';
    const child = 'L2-CHD3';
    upsertNode({ id: published, z_level: 1, passing_score: 80 });
    upsertNode({ id: hidden, z_level: 1, passing_score: 80, is_published: false });
    upsertNode({ id: child, z_level: 2, passing_score: 80 });
    insertMiniQuizStem(published, PREREQ_QUESTION_ID);
    insertMiniQuizStem(child, CHILD_QUESTION_ID);
    linkPrerequisite(child, published);
    linkPrerequisite(child, hidden);
    masterNodeViaMiniQuiz(published, PREREQ_QUESTION_ID);

    doubleQuizFailOnChild(child, CHILD_QUESTION_ID);

    expect(readProgressStatus(SPIRAL_PG_TEST_USER, published)).toBe('MAINTENANCE');
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, hidden)).toBeNull();
  });

  it('does not trigger on content_view failures (only mini_quiz counts)', () => {
    const { child, prereq } = seedL2WithL1Prereq();
    linkNodeContent(child, CONTENT_SLUG, true);

    expect(recordContentView(child, CONTENT_SLUG, 0, randomUUID()).passed).toBe(false);
    expect(recordContentView(child, CONTENT_SLUG, 0, randomUUID()).passed).toBe(false);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MASTERED');
  });

  it('content_view failures between mini_quiz fails do not break the mini_quiz streak', () => {
    const { child, prereq } = seedL2WithL1Prereq();
    linkNodeContent(child, CONTENT_SLUG, true);

    expect(submitMiniQuiz(child, CHILD_QUESTION_ID, 'b', randomUUID()).passed).toBe(false);
    expect(recordContentView(child, CONTENT_SLUG, 0, randomUUID()).passed).toBe(false);
    expect(submitMiniQuiz(child, CHILD_QUESTION_ID, 'b', randomUUID()).passed).toBe(false);

    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MAINTENANCE');
  });

  it('pre-maintenance mini_quiz pass does not clear MAINTENANCE; post-maintenance pass does', () => {
    const { child, prereq } = seedL2WithL1Prereq();
    doubleQuizFailOnChild(child, CHILD_QUESTION_ID);
    const since = readMaintenanceSince(SPIRAL_PG_TEST_USER, prereq);
    expect(since).not.toBeNull();
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MAINTENANCE');

    const passResult = submitMiniQuiz(prereq, PREREQ_QUESTION_ID, 'a', randomUUID());
    expect(passResult.passed).toBe(true);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MASTERED');
    expect(readMaintenanceSince(SPIRAL_PG_TEST_USER, prereq)).toBeNull();
  });

  it('clears MAINTENANCE on required content read when node has no mini quiz', () => {
    const prereq = 'L1-READ';
    const child = 'L2-READ-CHD';
    upsertNode({ id: prereq, z_level: 1, passing_score: null });
    upsertNode({ id: child, z_level: 2, passing_score: 80 });
    linkNodeContent(prereq, CONTENT_SLUG, true);
    insertMiniQuizStem(child, CHILD_QUESTION_ID);
    linkPrerequisite(child, prereq);

    expect(recordContentView(prereq, CONTENT_SLUG, 100, randomUUID()).passed).toBe(true);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MASTERED');

    doubleQuizFailOnChild(child, CHILD_QUESTION_ID);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MAINTENANCE');

    expect(recordContentView(prereq, CONTENT_SLUG, 100, randomUUID()).passed).toBe(true);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MASTERED');
  });

  it('re-applying maintenance prerequisites does not reset maintenance_since', () => {
    const { child, prereq } = seedL2WithL1Prereq();
    doubleQuizFailOnChild(child, CHILD_QUESTION_ID);
    const sinceAfterTwo = readMaintenanceSince(SPIRAL_PG_TEST_USER, prereq);
    expect(sinceAfterTwo).not.toBeNull();

    psql(
      `SELECT private.spiral_lms_apply_maintenance_prerequisites('${SPIRAL_PG_TEST_USER}'::uuid, '${child}');`,
    );
    expect(readMaintenanceSince(SPIRAL_PG_TEST_USER, prereq)).toBe(sinceAfterTwo);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MAINTENANCE');
  });

  it('does not demote L2 MASTERED when L1 enters MAINTENANCE with z-level gate enabled', () => {
    const l1Maint = 'L1-ZG-MAINT';
    const l1Sibling = 'L1-ZG-SIB';
    const l2Mastered = 'L2-ZG-OK';
    const l2Failer = 'L2-ZG-FAIL';
    const qSib = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
    const qOk = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
    upsertNode({ id: l1Maint, z_level: 1, passing_score: 80 });
    upsertNode({ id: l1Sibling, z_level: 1, passing_score: 80, sort_order: 2 });
    upsertNode({ id: l2Mastered, z_level: 2, passing_score: 80, sort_order: 1 });
    upsertNode({ id: l2Failer, z_level: 2, passing_score: 80, sort_order: 2 });
    insertMiniQuizStem(l1Maint, PREREQ_QUESTION_ID);
    insertMiniQuizStem(l1Sibling, qSib);
    insertMiniQuizStem(l2Mastered, qOk);
    insertMiniQuizStem(l2Failer, CHILD_QUESTION_ID);
    linkPrerequisite(l2Failer, l1Maint);

    masterNodeViaMiniQuiz(l1Maint, PREREQ_QUESTION_ID);
    masterNodeViaMiniQuiz(l1Sibling, qSib);
    masterNodeViaMiniQuiz(l2Mastered, qOk);
    const masteredAt = readMasteredAt(SPIRAL_PG_TEST_USER, l2Mastered);
    expect(masteredAt).not.toBeNull();

    doubleQuizFailOnChild(l2Failer, CHILD_QUESTION_ID);

    expect(readProgressStatus(SPIRAL_PG_TEST_USER, l1Maint)).toBe('MAINTENANCE');
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, l2Mastered)).toBe('MASTERED');
    expect(readMasteredAt(SPIRAL_PG_TEST_USER, l2Mastered)).toBe(masteredAt);
  });

  it('does not demote downstream MASTERED nodes when a prerequisite enters MAINTENANCE', () => {
    const prereq = 'L1-PRQ-DOWN';
    const failer = 'L2-FAIL';
    const downstream = 'L3-DOWN';
    upsertNode({ id: prereq, z_level: 1, passing_score: 80 });
    upsertNode({ id: failer, z_level: 2, passing_score: 80 });
    upsertNode({
      id: downstream,
      z_level: 3,
      passing_score: 80,
      unlock_config: { z_level_gate: 'off' },
    });
    insertMiniQuizStem(prereq, PREREQ_QUESTION_ID);
    insertMiniQuizStem(failer, CHILD_QUESTION_ID);
    insertMiniQuizStem(downstream, 'cccccccc-cccc-cccc-cccc-cccccccccccc');
    linkPrerequisite(failer, prereq);
    linkPrerequisite(downstream, prereq);

    masterNodeViaMiniQuiz(prereq, PREREQ_QUESTION_ID);
    masterNodeViaMiniQuiz(failer, CHILD_QUESTION_ID);
    masterNodeViaMiniQuiz(
      downstream,
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
    );
    const masteredAt = readMasteredAt(SPIRAL_PG_TEST_USER, downstream);
    expect(masteredAt).not.toBeNull();

    doubleQuizFailOnChild(failer, CHILD_QUESTION_ID);

    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MAINTENANCE');
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, downstream)).toBe('MASTERED');
    expect(readMasteredAt(SPIRAL_PG_TEST_USER, downstream)).toBe(masteredAt);
  });

  it('recovers immediately when MAINTENANCE node has no mini quiz and no required content', () => {
    const empty = 'L1-EMPTY';
    upsertNode({ id: empty, z_level: 1, passing_score: null });
    psql(`
INSERT INTO public.user_progress (user_id, node_id, status, attempts, maintenance_since)
VALUES (
  '${SPIRAL_PG_TEST_USER}'::uuid,
  '${empty}',
  'MAINTENANCE',
  0,
  now() - interval '1 hour'
);
`);
    expect(sqlRecomputeAndReadStatus(SPIRAL_PG_TEST_USER, empty)).toBe('MASTERED');
    expect(readMaintenanceSince(SPIRAL_PG_TEST_USER, empty)).toBeNull();
    expect(readMaintenanceClearedAt(SPIRAL_PG_TEST_USER, empty)).not.toBeNull();
  });

  it('preserves maintenance_cleared_at when prerequisite re-enters MAINTENANCE', () => {
    const prereq = 'L1-CLR';
    const childA = 'L2-CLRA';
    const childB = 'L2-CLRB';
    const qB = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    upsertNode({ id: prereq, z_level: 1, passing_score: 80 });
    upsertNode({ id: childA, z_level: 2, passing_score: 80 });
    upsertNode({ id: childB, z_level: 2, passing_score: 80, sort_order: 2 });
    insertMiniQuizStem(prereq, PREREQ_QUESTION_ID);
    insertMiniQuizStem(childA, CHILD_QUESTION_ID);
    insertMiniQuizStem(childB, qB);
    linkPrerequisite(childA, prereq);
    linkPrerequisite(childB, prereq);
    masterNodeViaMiniQuiz(prereq, PREREQ_QUESTION_ID);

    doubleQuizFailOnChild(childA, CHILD_QUESTION_ID);
    masterNodeViaMiniQuiz(prereq, PREREQ_QUESTION_ID);
    const clearedAt = readMaintenanceClearedAt(SPIRAL_PG_TEST_USER, prereq);
    expect(clearedAt).not.toBeNull();

    expect(submitMiniQuiz(childA, CHILD_QUESTION_ID, 'b', randomUUID()).passed).toBe(false);
    doubleQuizFailOnChild(childB, qB);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MAINTENANCE');
    expect(readMaintenanceClearedAt(SPIRAL_PG_TEST_USER, prereq)).toBe(clearedAt);

    expect(submitMiniQuiz(childA, CHILD_QUESTION_ID, 'b', randomUUID()).passed).toBe(false);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MAINTENANCE');
  });

  it('backfills maintenance_since for legacy MAINTENANCE rows', () => {
    const legacy = 'L1-LEGACY';
    upsertNode({ id: legacy, z_level: 1, passing_score: null });
    psql(`
INSERT INTO public.user_progress (user_id, node_id, status, attempts, maintenance_since)
VALUES (
  '${SPIRAL_PG_TEST_USER}'::uuid,
  '${legacy}',
  'MAINTENANCE',
  0,
  NULL
);
`);
    psql(`
UPDATE public.user_progress
SET maintenance_since = now()
WHERE status = 'MAINTENANCE'
  AND maintenance_since IS NULL;
`);
    expect(readMaintenanceSince(SPIRAL_PG_TEST_USER, legacy)).not.toBeNull();
  });

  it('requires two new consecutive mini_quiz failures after prerequisite recovery', () => {
    const { child, prereq } = seedL2WithL1Prereq();
    doubleQuizFailOnChild(child, CHILD_QUESTION_ID);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MAINTENANCE');

    masterNodeViaMiniQuiz(prereq, PREREQ_QUESTION_ID);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MASTERED');
    expect(readMaintenanceClearedAt(SPIRAL_PG_TEST_USER, prereq)).not.toBeNull();

    expect(submitMiniQuiz(child, CHILD_QUESTION_ID, 'b', randomUUID()).passed).toBe(false);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MASTERED');

    expect(submitMiniQuiz(child, CHILD_QUESTION_ID, 'b', randomUUID()).passed).toBe(false);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MAINTENANCE');
  });

  it('no-op when the failing node has no prerequisites', () => {
    const solo = 'L2-SOLO';
    upsertNode({ id: solo, z_level: 2, passing_score: 80 });
    insertMiniQuizStem(solo, CHILD_QUESTION_ID);

    doubleQuizFailOnChild(solo, CHILD_QUESTION_ID);

    expect(readProgressStatus(SPIRAL_PG_TEST_USER, solo)).not.toBe('MAINTENANCE');
  });
});
