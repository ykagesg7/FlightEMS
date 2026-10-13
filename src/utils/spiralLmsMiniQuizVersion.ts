import { createHash } from 'node:crypto';

/** Row shape used to mirror `private.spiral_lms_node_mini_quiz_version` in SQL. */
export type SpiralMiniQuizVersionRow = {
  readonly sort_order: number;
  readonly id: string;
  readonly prompt: string;
  readonly question_type: string;
  /** PostgreSQL `options::text` (jsonb cast). */
  readonly options_text: string;
  readonly correct_option_ids: readonly string[];
};

/**
 * Mirrors `private.spiral_lms_node_mini_quiz_version` (20261013 migration).
 */
export function computeSpiralMiniQuizVersionFingerprint(
  rows: readonly SpiralMiniQuizVersionRow[],
): string {
  const sorted = [...rows].sort((a, b) => a.sort_order - b.sort_order);
  const payload = sorted
    .map(
      (row) =>
        `${row.id}|${row.prompt}|${row.question_type}|${row.options_text}|${row.correct_option_ids.join(',')}`,
    )
    .join('##');
  return createHash('md5').update(payload).digest('hex');
}

export type SpiralMiniQuizPassAttempt = {
  readonly passed: boolean;
  readonly score: number | null;
  readonly mini_quiz_version: string | null;
};

/** Mirrors pass counting inside `private.spiral_lms_mini_quiz_met`. */
export function isSpiralMiniQuizPassCountedForVersion(
  attempt: SpiralMiniQuizPassAttempt,
  passingScore: number,
  currentVersion: string,
): boolean {
  return (
    attempt.passed &&
    attempt.score !== null &&
    attempt.score >= passingScore &&
    attempt.mini_quiz_version === currentVersion
  );
}

/** Mirrors `private.spiral_lms_user_node_mini_quiz_ever_passed` for the current version. */
export function isSpiralMiniQuizEverPassedForCurrentVersion(
  attempts: readonly SpiralMiniQuizPassAttempt[],
  passingScore: number,
  currentVersion: string,
): boolean {
  return attempts.some((attempt) =>
    isSpiralMiniQuizPassCountedForVersion(attempt, passingScore, currentVersion),
  );
}
