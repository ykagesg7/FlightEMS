import { ClipboardList } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildContentTestHref } from '../../test/testHubFilters';
import { trackArticleToQuizClick } from '../../../lib/quizAnalytics';
import supabase from '../../../utils/supabase';

type MappingRow = {
  topic_category: string | null;
  subject_area: string | null;
  content_category: string | null;
  test_question_ids: string[] | null;
  unified_cpl_question_ids: string[] | null;
};

function countQuestionIds(row: MappingRow): number {
  const a = row.unified_cpl_question_ids?.length ?? 0;
  const b = row.test_question_ids?.length ?? 0;
  return Math.max(a, b);
}

function buildTestHref(contentId: string, row: MappingRow): string {
  const subject = row.topic_category || row.subject_area || '';
  const cat = (row.content_category || '').toUpperCase();
  return buildContentTestHref({
    contentId,
    subject,
    exam: cat.includes('PPL') || cat === 'PPL' ? 'ppl' : 'all',
  });
}

interface RelatedTestsBlockProps {
  contentId: string;
}

/**
 * learning_test_mapping に紐づく主科目ごとに /test への導線を表示する。
 */
export const RelatedTestsBlock: React.FC<RelatedTestsBlockProps> = ({ contentId }) => {
  const [rows, setRows] = useState<MappingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('learning_test_mapping')
          .select(
            'topic_category, subject_area, content_category, test_question_ids, unified_cpl_question_ids',
          )
          .eq('learning_content_id', contentId);

        if (error) {
          console.error('RelatedTestsBlock: learning_test_mapping', error);
          if (!cancelled) setRows([]);
          return;
        }
        if (!cancelled) setRows((data ?? []) as MappingRow[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  const grouped = useMemo(() => {
    const map = new Map<string, MappingRow>();
    for (const row of rows) {
      const key = row.topic_category || row.subject_area || '';
      if (!key) continue;
      const prev = map.get(key);
      if (!prev || countQuestionIds(row) > countQuestionIds(prev)) {
        map.set(key, row);
      }
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'ja'));
  }, [rows]);

  if (loading) {
    return (
      <section
        className="mt-8 rounded-xl border border-[color:var(--hud-primary)]/20 bg-[var(--panel)]/40 p-6"
        aria-busy="true"
        aria-label="関連テスト読み込み中"
      >
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--hud-primary)] border-t-transparent" />
        </div>
      </section>
    );
  }

  if (grouped.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-8 rounded-xl border border-l-4 border-brand-primary/30 border-l-brand-primary bg-brand-secondary-dark/50 p-6 shadow-sm"
      aria-labelledby="related-tests-heading"
    >
      <div className="mb-4 flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-brand-primary" aria-hidden />
        <div>
          <h2 id="related-tests-heading" className="text-lg font-semibold text-[var(--text-primary)]">
            関連テスト
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            この記事に対応する問題プールで練習モードを開始します（科目・件数はテスト画面で変更できます）。
          </p>
        </div>
      </div>
      <ul className="space-y-3">
        {grouped.map(([mainLabel, row]) => {
          const n = countQuestionIds(row);
          const href = buildTestHref(contentId, row);
          return (
            <li key={mainLabel}>
              <Link
                to={href}
                onClick={() => trackArticleToQuizClick(contentId, mainLabel)}
                className="flex items-center justify-between gap-4 rounded-lg border border-brand-primary/15 bg-[var(--bg)]/80 px-4 py-3 text-sm transition hover:border-brand-primary/40 hover:bg-brand-primary/5"
              >
                <span className="font-medium text-[var(--text-primary)]">{mainLabel}</span>
                <span className="shrink-0 text-[var(--text-muted)]">
                  {n > 0 ? `対象設問 ${n} 件` : '練習を開始'}
                  <span className="ml-2 text-brand-primary">→</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default RelatedTestsBlock;
