import React, { useEffect, useState } from 'react';
import { fetchSrsDueReviewCount } from '../testQuizFetch';
import supabase from '../../../utils/supabase';

export interface QuizHubLoggedInSummaryProps {
  userId: string;
  onStartReview: () => void;
}

export const QuizHubLoggedInSummary: React.FC<QuizHubLoggedInSummaryProps> = ({
  userId,
  onStartReview,
}) => {
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [streakDays, setStreakDays] = useState<number | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadError(false);
      try {
        const [due, profileResult] = await Promise.all([
          fetchSrsDueReviewCount(),
          supabase
            .from('user_learning_profiles')
            .select('current_streak_days')
            .eq('user_id', userId)
            .maybeSingle(),
        ]);
        if (cancelled) return;
        setDueCount(due ?? 0);
        setStreakDays(profileResult.data?.current_streak_days ?? 0);
      } catch {
        if (!cancelled) setLoadError(true);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div
      className="mb-4 flex flex-col gap-2 rounded-xl border border-brand-primary/15 bg-[var(--panel)]/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      data-testid="quiz-hub-logged-in-summary"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-primary)]">
        {loadError ? (
          <span className="text-[var(--text-muted)]">復習状況を読み込めませんでした</span>
        ) : dueCount === null ? (
          <span className="text-[var(--text-muted)]">復習状況を確認中…</span>
        ) : (
          <span>
            今日の復習
            <strong className="mx-1 tabular-nums text-brand-primary">{dueCount}</strong>
            問
          </span>
        )}
        {streakDays !== null && streakDays > 0 && (
          <span className="text-[var(--text-muted)]" aria-label={`連続学習 ${streakDays} 日`}>
            連続 <span className="tabular-nums text-[var(--text-primary)]">{streakDays}</span> 日
          </span>
        )}
      </div>
      {dueCount !== null && dueCount > 0 && (
        <button
          type="button"
          onClick={onStartReview}
          className="shrink-0 rounded-lg border border-brand-primary/40 px-4 py-2 text-sm font-medium text-brand-primary transition hover:bg-brand-primary/10"
        >
          復習を始める
        </button>
      )}
    </div>
  );
};
