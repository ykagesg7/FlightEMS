import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  SPIRAL_PG_TEST_USER,
  ensureSpiralLmsMigrations,
  insertMiniQuizStem,
  linkPrerequisite,
  psqlLastLine,
  readProgressStatus,
  resetSpiralCatalog,
  spiralPgUrl,
  upsertNode,
} from './helpers/spiralLmsPgHarness';

const pgUrl = spiralPgUrl();
const describePg = pgUrl ? describe : describe.skip;

const CHILD_QUESTION_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const PREREQ_QUESTION_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

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

describePg('spiral LMS MAINTENANCE prerequisites (Postgres)', () => {
  beforeAll(() => {
    ensureSpiralLmsMigrations();
  });

  beforeEach(() => {
    resetSpiralCatalog();
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
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, child)).not.toBe('MAINTENANCE');
  });

  it('does not trigger MAINTENANCE when only one failure or a pass breaks the streak', () => {
    const { child, prereq } = seedL2WithL1Prereq();

    expect(submitMiniQuiz(child, CHILD_QUESTION_ID, 'b', randomUUID()).passed).toBe(false);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MASTERED');

    expect(submitMiniQuiz(child, CHILD_QUESTION_ID, 'a', randomUUID()).passed).toBe(true);
    expect(submitMiniQuiz(child, CHILD_QUESTION_ID, 'b', randomUUID()).passed).toBe(false);
    expect(readProgressStatus(SPIRAL_PG_TEST_USER, prereq)).toBe('MASTERED');
  });

  it('ignores prerequisites not exactly one z_level below', () => {
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

    submitMiniQuiz(child, CHILD_QUESTION_ID, 'b', randomUUID());
    submitMiniQuiz(child, CHILD_QUESTION_ID, 'b', randomUUID());

    expect(readProgressStatus(SPIRAL_PG_TEST_USER, lateral)).toBe('MASTERED');
  });

  it('no-op when the failing node has no prerequisites', () => {
    const solo = 'L2-SOLO';
    upsertNode({ id: solo, z_level: 2, passing_score: 80 });
    insertMiniQuizStem(solo, CHILD_QUESTION_ID);

    submitMiniQuiz(solo, CHILD_QUESTION_ID, 'b', randomUUID());
    submitMiniQuiz(solo, CHILD_QUESTION_ID, 'b', randomUUID());

    expect(readProgressStatus(SPIRAL_PG_TEST_USER, solo)).not.toBe('MAINTENANCE');
  });
});
