import { describe, expect, it } from 'vitest';
import {
  computeSpiralMiniQuizVersionFromRows,
  isSpiralMiniQuizEverPassedForCurrentVersion,
  isSpiralMiniQuizPassCountedForVersion,
  tsMiniQuizMet,
} from '../integration/helpers/spiralLmsMiniQuizVersionParity';

describe('spiralLmsMiniQuizVersionParity helpers', () => {
  const row = {
    sort_order: 1,
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    prompt: 'test?',
    question_type: 'single',
    options_text: '[{"id": "a", "text": "A"}]',
    stem_revision: 1,
    key_revision: 1,
  };

  it('orders rows by sort_order then id for version string', () => {
    const v1 = computeSpiralMiniQuizVersionFromRows([row]);
    const v2 = computeSpiralMiniQuizVersionFromRows([
      { ...row, sort_order: 2, id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' },
      { ...row, sort_order: 1, prompt: 'first' },
    ]);
    expect(v1).not.toBe(v2);
    expect(v1.startsWith('v2|s|')).toBe(true);
  });

  it('counts pass only for matching version (TS mirror)', () => {
    const attempt = { passed: true, score: 90, mini_quiz_version: 'v2|s|x|k|y' };
    expect(isSpiralMiniQuizPassCountedForVersion(attempt, 80, 'v2|s|x|k|y')).toBe(true);
    expect(tsMiniQuizMet([attempt], 80, 'v2|s|other|k|y')).toBe(false);
    expect(isSpiralMiniQuizEverPassedForCurrentVersion([attempt], 80, 'v2|s|other|k|y')).toBe(
      false,
    );
  });
});
