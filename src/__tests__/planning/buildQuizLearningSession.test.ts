import { describe, expect, it } from 'vitest';
import {
  buildQuizLearningSessionContentId,
  buildQuizLearningSessionInsert,
  computeQuizWallClockSeconds,
} from '../../pages/test/utils/buildQuizLearningSession';
import type { UserQuizAnswer } from '../../types/quiz';

const sampleAnswers: UserQuizAnswer[] = [
  { questionId: 'q1', answer: 1, isCorrect: true, responseTimeMs: 5000 },
  { questionId: 'q2', answer: 2, isCorrect: false, responseTimeMs: 10000 },
];

describe('computeQuizWallClockSeconds', () => {
  it('sums responseTimeMs and enforces minimum 60 seconds', () => {
    expect(computeQuizWallClockSeconds(sampleAnswers)).toBe(60);
  });

  it('uses summed seconds when above minimum', () => {
    const answers: UserQuizAnswer[] = [
      { questionId: 'q1', answer: 1, isCorrect: true, responseTimeMs: 90000 },
    ];
    expect(computeQuizWallClockSeconds(answers)).toBe(90);
  });
});

describe('buildQuizLearningSessionContentId', () => {
  it('uses contentId when provided', () => {
    expect(buildQuizLearningSessionContentId('3.2.7', 'subject')).toBe('3.2.7');
  });

  it('falls back to test-hub tab slug', () => {
    expect(buildQuizLearningSessionContentId(null, 'diagnostic')).toBe('test-hub:diagnostic');
  });
});

describe('buildQuizLearningSessionInsert', () => {
  it('builds schema-aligned learning_sessions payload', () => {
    const payload = buildQuizLearningSessionInsert({
      userId: 'user-1',
      answers: sampleAnswers,
      mode: 'practice',
      tab: 'diagnostic',
      contentId: null,
      quizSessionId: 'session-abc',
      endedAtIso: '2026-06-07T00:00:00.000Z',
    });

    expect(payload.content_id).toBe('test-hub:diagnostic');
    expect(payload.content_type).toBe('quiz');
    expect(payload.session_type).toBe('practice');
    expect(payload.session_duration).toBe(60);
    expect(payload.session_metadata.quiz_session_id).toBe('session-abc');
    expect(payload.session_metadata.questions_attempted).toBe(2);
    expect(payload.session_metadata.correct_count).toBe(1);
    expect(payload.session_metadata.tab).toBe('diagnostic');
  });
});
