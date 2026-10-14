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
  readProgressStatus,
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

  it('no-op when the failing node has no prerequisites', () => {
    const solo = 'L2-SOLO';
    upsertNode({ id: solo, z_level: 2, passing_score: 80 });
    insertMiniQuizStem(solo, CHILD_QUESTION_ID);

    doubleQuizFailOnChild(solo, CHILD_QUESTION_ID);

    expect(readProgressStatus(SPIRAL_PG_TEST_USER, solo)).not.toBe('MAINTENANCE');
  });
});
