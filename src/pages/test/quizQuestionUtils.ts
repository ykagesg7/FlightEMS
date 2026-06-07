import { QuestionType, type QuizQuestion } from '../../types/quiz';

/** Map a unified_cpl_questions row to QuizQuestion. */
export function parseUnifiedCplQuestion(q: Record<string, unknown>): QuizQuestion {
  const options =
    Array.isArray(q.options) && q.options.length === 4
      ? q.options.map((opt: unknown) => (typeof opt === 'string' ? opt : (opt as { text?: string })?.text || ''))
      : ['選択肢1', '選択肢2', '選択肢3', '選択肢4'];
  const correctIdx =
    typeof q.correct_answer === 'number' ? q.correct_answer - 1 : 0;

  return {
    id: String(q.id),
    deck_id: (q.deck_id as string) || '',
    question_text: (q.question_text as string) || (q.question as string) || '問題文データ不備',
    text: (q.question_text as string) || (q.question as string) || '問題文データ不備',
    options,
    correct_option_index: correctIdx,
    explanation: (q.explanation as string) || '',
    explanation_image_url: (q.explanation_image_url as string) || null,
    difficulty_level: (q.difficulty_level as string) || 'medium',
    created_at: q.created_at as string,
    updated_at: q.updated_at as string,
    type: QuestionType.MULTIPLE_CHOICE,
    correctAnswer: correctIdx,
    main_subject: (q.main_subject as string) || undefined,
    sub_subject: (q.sub_subject as string) || undefined,
  };
}

export function shuffleAndSlice<T>(items: T[], count: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}
