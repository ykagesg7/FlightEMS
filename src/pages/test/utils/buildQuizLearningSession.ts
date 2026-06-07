import type { UserQuizAnswer } from '../../../types/quiz';

export type QuizLearningSessionMode = 'practice' | 'exam' | 'review';

export type BuildQuizLearningSessionParams = {
  userId: string;
  answers: UserQuizAnswer[];
  mode: QuizLearningSessionMode;
  tab: string;
  contentId?: string | null;
  quizSessionId?: string | null;
  endedAtIso: string;
};

export type QuizLearningSessionInsert = {
  user_id: string;
  content_id: string;
  content_type: 'quiz';
  session_type: QuizLearningSessionMode;
  session_duration: number;
  ended_at: string;
  session_metadata: {
    quiz_session_id: string | null;
    questions_attempted: number;
    correct_count: number;
    mode: QuizLearningSessionMode;
    tab: string;
    wall_clock_seconds: number;
  };
};

/** 回答時間合計（秒）。仕様上 minimum 60 秒。 */
export function computeQuizWallClockSeconds(answers: UserQuizAnswer[]): number {
  const raw = Math.round(
    answers.reduce(
      (sum, a) => sum + (typeof a.responseTimeMs === 'number' ? a.responseTimeMs / 1000 : 0),
      0,
    ),
  );
  return Math.max(60, raw);
}

export function buildQuizLearningSessionContentId(
  contentId: string | null | undefined,
  tab: string,
): string {
  if (contentId && contentId.trim()) return contentId.trim();
  return `test-hub:${tab}`;
}

export function buildQuizLearningSessionInsert(
  params: BuildQuizLearningSessionParams,
): QuizLearningSessionInsert {
  const wallClockSec = computeQuizWallClockSeconds(params.answers);
  const correctCount = params.answers.filter((a) => a.isCorrect).length;

  return {
    user_id: params.userId,
    content_id: buildQuizLearningSessionContentId(params.contentId, params.tab),
    content_type: 'quiz',
    session_type: params.mode,
    session_duration: wallClockSec,
    ended_at: params.endedAtIso,
    session_metadata: {
      quiz_session_id: params.quizSessionId ?? null,
      questions_attempted: params.answers.length,
      correct_count: correctCount,
      mode: params.mode,
      tab: params.tab,
      wall_clock_seconds: wallClockSec,
    },
  };
}
