/** Test-only mirror of `private.spiral_lms_node_mini_quiz_version` (20261013 migration). */

export type SpiralMiniQuizVersionRow = {
  readonly sort_order: number;
  readonly id: string;
  readonly prompt: string;
  readonly question_type: string;
  /** PostgreSQL `options::text` (jsonb cast). */
  readonly options_text: string;
  readonly stem_revision: number;
  readonly key_revision: number;
};

/** Matches PostgreSQL `length(text)` (Unicode code points), not JS UTF-16 units. */
function canonicalChunk(text: string): string {
  const codePointLength = [...text].length;
  return `${codePointLength}:${text}`;
}

function sortVersionRows(rows: readonly SpiralMiniQuizVersionRow[]): SpiralMiniQuizVersionRow[] {
  return [...rows].sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id));
}

export function computeSpiralMiniQuizVersionFromRows(
  rows: readonly SpiralMiniQuizVersionRow[],
): string {
  const sorted = sortVersionRows(rows);
  const stemPart = sorted
    .map(
      (row) =>
        canonicalChunk(row.id) +
        canonicalChunk(row.prompt) +
        canonicalChunk(row.question_type) +
        canonicalChunk(row.options_text) +
        canonicalChunk(String(row.stem_revision)),
    )
    .join('');
  const keyPart = sorted
    .map((row) => canonicalChunk(row.id) + canonicalChunk(String(row.key_revision)))
    .join('');
  return `v2|s|${stemPart}|k|${keyPart}`;
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

export function tsMiniQuizMet(
  attempts: readonly SpiralMiniQuizPassAttempt[],
  passingScore: number,
  currentVersion: string,
): boolean {
  return attempts.some((attempt) =>
    isSpiralMiniQuizPassCountedForVersion(attempt, passingScore, currentVersion),
  );
}
