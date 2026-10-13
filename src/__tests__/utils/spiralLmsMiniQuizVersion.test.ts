import { describe, expect, it } from 'vitest';
import {
  computeSpiralMiniQuizVersionFingerprint,
  isSpiralMiniQuizEverPassedForCurrentVersion,
  isSpiralMiniQuizPassCountedForVersion,
} from '../../utils/spiralLmsMiniQuizVersion';

describe('spiralLmsMiniQuizVersion', () => {
  const row = {
    sort_order: 1,
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    prompt: 'test?',
    question_type: 'single',
    options_text: '[{"id": "a", "text": "A"}]',
    correct_option_ids: ['a'],
  };

  it('orders rows by sort_order for fingerprint', () => {
    const v1 = computeSpiralMiniQuizVersionFingerprint([row]);
    const v2 = computeSpiralMiniQuizVersionFingerprint([
      { ...row, sort_order: 2 },
      { ...row, sort_order: 1, prompt: 'first' },
    ]);
    expect(v1).not.toBe(v2);
  });

  it('counts pass only for matching version', () => {
    const attempt = { passed: true, score: 90, mini_quiz_version: 'abc' };
    expect(isSpiralMiniQuizPassCountedForVersion(attempt, 80, 'abc')).toBe(true);
    expect(isSpiralMiniQuizPassCountedForVersion(attempt, 80, 'def')).toBe(false);
    expect(isSpiralMiniQuizEverPassedForCurrentVersion([attempt], 80, 'def')).toBe(false);
  });
});
