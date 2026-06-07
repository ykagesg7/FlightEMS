import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../../../utils/supabase';
import { buildReviewHref, buildWeakSubjectHref } from '../testHubFilters';

export interface WeakAreaSummary {
  subjectCategory: string;
  mainSubject: string;
  accuracyRate: number;
}

function parseMainSubject(subjectCategory: string): string {
  const idx = subjectCategory.indexOf(' - ');
  return idx >= 0 ? subjectCategory.slice(0, idx) : subjectCategory;
}

interface WeakAreasHeroProps {
  userId: string | undefined;
  onStartReview?: () => void;
}

export const WeakAreasHero: React.FC<WeakAreasHeroProps> = ({ userId, onStartReview }) => {
  const [areas, setAreas] = useState<WeakAreaSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setAreas([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_weak_areas')
          .select('subject_category, accuracy_rate')
          .eq('user_id', userId)
          .order('accuracy_rate', { ascending: true })
          .limit(5);
        if (error) throw error;
        if (cancelled) return;
        setAreas(
          (data ?? []).map((row) => ({
            subjectCategory: row.subject_category,
            mainSubject: parseMainSubject(row.subject_category),
            accuracyRate: row.accuracy_rate,
          }))
        );
      } catch {
        if (!cancelled) setAreas([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!userId || loading || areas.length === 0) return null;

  const top = areas[0];

  return (
    <div className="mb-6 rounded-xl border-2 border-hud-red/30 bg-hud-red/5 p-5 shadow-lg">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-hud-red">今日の復習</p>
      <h2 className="mb-2 text-lg font-bold text-[var(--text-primary)]">
        弱点 {areas.length} 件 — 最優先: {top.mainSubject}
      </h2>
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        正答率 {Math.round(top.accuracyRate)}% の「{top.subjectCategory}」から復習を始めましょう。
      </p>
      <div className="flex flex-wrap gap-2">
        {onStartReview ? (
          <button
            type="button"
            onClick={onStartReview}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[var(--bg)] hover:bg-brand-primary-dark"
          >
            弱点復習を開始
          </button>
        ) : (
          <Link
            to={buildReviewHref()}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[var(--bg)] hover:bg-brand-primary-dark"
          >
            弱点復習を開始
          </Link>
        )}
        <Link
          to={buildWeakSubjectHref(top.mainSubject)}
          className="rounded-lg border border-brand-primary/40 px-4 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10"
        >
          {top.mainSubject} を練習
        </Link>
      </div>
    </div>
  );
};
