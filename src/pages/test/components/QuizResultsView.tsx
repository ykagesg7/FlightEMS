import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { UserQuizAnswer } from '../../../types/quiz';
import { QuizQuestion } from '../../../types/quiz';
import { normalizeSubSubjectLabel } from '../utils/normalizeSubSubject';
import { LEARNING_ARTICLE_CTA_LABEL, LEARNING_ARTICLES_HUB_LABEL } from '../../../constants/learningArticleNav';
import ReviewContentLink from '../../articles/components/learning/ReviewContentLink';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'] as const;

interface QuizResultsViewProps {
  userAnswers: UserQuizAnswer[];
  questions: QuizQuestion[];
  saveError: string | null;
  saving: boolean;
  onRetryAll: () => void;
  onRetryIncorrect: () => void;
  onRetryFlagged?: () => void;
  onRetryFlaggedAndIncorrect?: () => void;
  incorrectCount: number;
  flaggedCount?: number;
  flaggedAndIncorrectCount?: number;
  contentId?: string | null;
  /** 全問正解時のフォールバック（main_subject）。未選択科目のときは null */
  selectedSubjectForFallback?: string | null;
}

export const QuizResultsView: React.FC<QuizResultsViewProps> = ({
  userAnswers,
  questions,
  saveError,
  saving,
  onRetryAll,
  onRetryIncorrect,
  onRetryFlagged,
  onRetryFlaggedAndIncorrect,
  incorrectCount,
  flaggedCount = 0,
  flaggedAndIncorrectCount = 0,
  contentId,
  selectedSubjectForFallback = null,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const correctCount = userAnswers.filter(a => a.isCorrect).length;
  const totalCount = userAnswers.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const questionMap = new Map(questions.map(q => [String(q.id), q]));
  const answerMap = new Map(userAnswers.map(a => [String(a.questionId), a]));

  const weakSubjects = (() => {
    const countBySubject: Record<string, number> = {};
    userAnswers.forEach(a => {
      if (!a.isCorrect) {
        const q = questionMap.get(String(a.questionId));
        const subj = (q as QuizQuestion & { main_subject?: string })?.main_subject || 'その他';
        countBySubject[subj] = (countBySubject[subj] || 0) + 1;
      }
    });
    return Object.entries(countBySubject).sort((a, b) => b[1] - a[1]);
  })();

  const weakSubSubjects = (() => {
    const countBySubSubject: Record<string, number> = {};
    userAnswers.forEach(a => {
      if (!a.isCorrect) {
        const q = questionMap.get(String(a.questionId));
        const raw = (q as QuizQuestion & { sub_subject?: string })?.sub_subject;
        const label = normalizeSubSubjectLabel(raw);
        if (!label) return;
        countBySubSubject[label] = (countBySubSubject[label] || 0) + 1;
      }
    });
    return Object.entries(countBySubSubject)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  })();

  const subjectArticleBlocks = useMemo(() => {
    const qMap = new Map(questions.map((q) => [String(q.id), q]));
    type Row = {
      mainSubject: string;
      total: number;
      correct: number;
      incorrectQuestionIds: string[];
      allQuestionIds: string[];
      percentage: number;
    };
    const bySubject = new Map<
      string,
      { total: number; correct: number; incorrectQuestionIds: string[]; allQuestionIds: string[] }
    >();

    for (const a of userAnswers) {
      const qid = String(a.questionId);
      const q = qMap.get(qid);
      const raw = (q as QuizQuestion & { main_subject?: string })?.main_subject;
      const mainSubject = typeof raw === 'string' && raw.trim() ? raw.trim() : 'その他';
      let row = bySubject.get(mainSubject);
      if (!row) {
        row = { total: 0, correct: 0, incorrectQuestionIds: [], allQuestionIds: [] };
        bySubject.set(mainSubject, row);
      }
      row.total += 1;
      row.allQuestionIds.push(qid);
      if (a.isCorrect) row.correct += 1;
      else row.incorrectQuestionIds.push(qid);
    }

    const list: Row[] = [...bySubject.entries()].map(([mainSubject, r]) => ({
      mainSubject,
      total: r.total,
      correct: r.correct,
      incorrectQuestionIds: r.incorrectQuestionIds,
      allQuestionIds: r.allQuestionIds,
      percentage: r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0,
    }));

    const withIncorrect = list
      .filter((s) => s.incorrectQuestionIds.length > 0)
      .sort((a, b) => b.incorrectQuestionIds.length - a.incorrectQuestionIds.length);

    const allSessionIds = userAnswers.map((a) => String(a.questionId));
    const allCorrect = withIncorrect.length === 0 && allSessionIds.length > 0;
    const firstSubject = list[0]?.mainSubject ?? 'その他';

    return { withIncorrect, allCorrect, allSessionIds, firstSubject };
  }, [userAnswers, questions]);

  return (
    <div className="max-w-2xl mx-auto p-8 bg-[var(--panel)] border border-brand-primary/20 rounded-2xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 text-brand-primary drop-shadow text-center">テスト結果</h2>
      <div className="text-center mb-6">
        <p className="mb-2 text-lg text-[var(--text-primary)] font-semibold tracking-wide">
          正解数: <span className="text-2xl text-hud-green font-bold">{correctCount}</span>
          <span className="mx-2 text-[var(--text-muted)]">/</span>
          <span className="text-2xl font-bold">{totalCount}</span>
        </p>
        <p className="text-sm text-[var(--text-muted)]">正答率: {accuracy}%</p>
      </div>

      {weakSubjects.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-hud-red/10 border border-hud-red/30">
          <h3 className="text-sm font-semibold text-hud-red mb-2">弱点科目（不正解）</h3>
          <ul className="flex flex-wrap gap-2">
            {weakSubjects.map(([subj, n]) => (
              <li key={subj} className="text-sm text-[var(--text-primary)]">
                <span className="font-medium">{subj}</span>
                <span className="text-[var(--text-muted)] ml-1">({n}問)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {weakSubSubjects.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">弱点サブ科目（不正解）</h3>
          <ul className="flex flex-wrap gap-2">
            {weakSubSubjects.map(([subj, n]) => (
              <li key={subj} className="text-sm text-[var(--text-primary)]">
                <span className="font-medium">{subj}</span>
                <span className="text-[var(--text-muted)] ml-1">({n}問)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(subjectArticleBlocks.withIncorrect.length > 0 || subjectArticleBlocks.allCorrect) && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-brand-primary mb-3">関連する学習記事</h3>
          {subjectArticleBlocks.withIncorrect.length > 0
            ? subjectArticleBlocks.withIncorrect.map((s) => (
                <ReviewContentLink
                  key={s.mainSubject}
                  subjectCategory={s.mainSubject}
                  accuracy={s.percentage}
                  questionIds={s.incorrectQuestionIds}
                  excludeContentId={contentId}
                  variant="panel"
                />
              ))
            : (
                <ReviewContentLink
                  subjectCategory={selectedSubjectForFallback ?? subjectArticleBlocks.firstSubject}
                  accuracy={100}
                  questionIds={subjectArticleBlocks.allSessionIds}
                  excludeContentId={contentId}
                  variant="panel"
                />
              )}
        </div>
      )}

      {saveError && (
        <div className="text-hud-red text-base mb-4 font-semibold text-center">
          {saveError.includes('ログインが必須') ? (
            <>
              {saveError}
              <div className="mt-2">
                <a href="/auth" className="inline-block px-6 py-2 rounded-lg border border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10 font-bold transition">ログイン/新規登録</a>
              </div>
            </>
          ) : (
            saveError
          )}
        </div>
      )}
      {saving && <p className="text-brand-primary text-base mb-2 animate-pulse text-center">結果を保存中...</p>}

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-3">問題別レビュー</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {questions.map((q, idx) => {
            const ans = answerMap.get(String(q.id));
            const isCorrect = ans?.isCorrect ?? false;
            const userIdx = typeof ans?.answer === 'number' ? ans.answer : -1;
            const correctIdx = typeof q.correctAnswer === 'number' ? q.correctAnswer : q.correct_option_index ?? 0;
            const isExpanded = expandedId === q.id;
            const opts = q.options ?? [];
            return (
              <div
                key={q.id}
                className={`rounded-lg border overflow-hidden ${isCorrect ? 'border-hud-green/40 bg-hud-green/5' : 'border-hud-red/40 bg-hud-red/5'}`}
              >
                <button
                  type="button"
                  className="w-full flex items-center gap-2 p-3 text-left hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                  <span className="text-sm font-medium">{idx + 1}. {(q.text ?? q.question_text ?? '').slice(0, 60)}...</span>
                  <span className={`ml-auto text-xs font-semibold ${isCorrect ? 'text-hud-green' : 'text-hud-red'}`}>
                    {isCorrect ? '正解' : '不正解'}
                  </span>
                </button>
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-[var(--semantic-border)]/50 space-y-2">
                    <p className="text-sm text-[var(--text-primary)] whitespace-pre-line">{q.text ?? q.question_text}</p>
                    <div className="text-sm">
                      <p className="text-[var(--text-muted)] mb-1">正解: {CHOICE_LABELS[correctIdx] ?? '-'} - {opts[correctIdx] ?? ''}</p>
                      {!isCorrect && userIdx >= 0 && (
                        <p className="text-hud-red">あなたの回答: {CHOICE_LABELS[userIdx] ?? '-'} - {opts[userIdx] ?? ''}</p>
                      )}
                    </div>
                    {q.explanation && (
                      <p className="text-sm text-[var(--text-muted)] whitespace-pre-line mt-2">{q.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold text-[var(--text-muted)] mb-3 text-center">
          このテストの結果から、すぐに復習できます
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
        <button
          className="px-6 py-3 rounded-xl border border-brand-primary/40 text-brand-primary shadow-lg transition-all duration-200 ease-in-out hover:bg-brand-primary/10 focus-visible:focus:ring-2 focus-visible:focus:ring-brand-primary"
          onClick={onRetryAll}
        >
          もう一度挑戦
        </button>
        {incorrectCount > 0 && (
          <button
            className="px-6 py-3 rounded-xl bg-hud-red/20 border border-hud-red text-hud-red shadow-lg transition-all duration-200 ease-in-out hover:bg-hud-red/30 focus-visible:focus:ring-2 focus-visible:focus:ring-hud-red"
            onClick={onRetryIncorrect}
          >
            不正解だけ復習 ({incorrectCount}問)
          </button>
        )}
        {flaggedCount > 0 && onRetryFlagged && (
          <button
            className="px-6 py-3 rounded-xl border border-amber-500/60 text-amber-600 dark:text-amber-400 shadow-lg transition-all duration-200 ease-in-out hover:bg-amber-500/10 focus-visible:focus:ring-2 focus-visible:focus:ring-amber-500"
            onClick={onRetryFlagged}
          >
            フラグだけ復習 ({flaggedCount}問)
          </button>
        )}
        {flaggedAndIncorrectCount > 0 && onRetryFlaggedAndIncorrect && (
          <button
            className="px-6 py-3 rounded-xl border border-amber-600/60 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-lg transition-all duration-200 ease-in-out hover:bg-amber-500/20 focus-visible:focus:ring-2 focus-visible:focus:ring-amber-500"
            onClick={onRetryFlaggedAndIncorrect}
          >
            フラグ＋不正解を復習 ({flaggedAndIncorrectCount}問)
          </button>
        )}
        {contentId && (
          <Link
            to={`/articles/${contentId}`}
            className="px-6 py-3 rounded-xl border border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10 transition-all duration-200"
          >
            {LEARNING_ARTICLE_CTA_LABEL}
          </Link>
        )}
        <Link
          to="/articles"
          className="px-6 py-3 rounded-xl border border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10 transition-all duration-200"
        >
          {LEARNING_ARTICLES_HUB_LABEL}
        </Link>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl border border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10 transition-all duration-200"
        >
          ダッシュボードへ戻る
        </Link>
        </div>
      </div>
    </div>
  );
};
