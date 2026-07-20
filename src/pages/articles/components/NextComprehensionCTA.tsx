import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import { PPL_CATEGORY } from '../../../constants/articleHubCategories';
import { trackArticleToQuizClick } from '../../../lib/quizAnalytics';
import type { LearningContent } from '../../../types';
import { buildContentTestHref } from '../../test/testHubFilters';

interface NextComprehensionCTAProps {
  article: LearningContent;
}

/**
 * Surfaces one read-but-not-comprehended article so the hub connects reading → quiz.
 */
export const NextComprehensionCTA: React.FC<NextComprehensionCTAProps> = ({
  article,
}) => {
  const quizHref = useMemo(() => {
    const subject = article.sub_category?.trim() || article.category || '';
    return buildContentTestHref({
      contentId: article.id,
      subject,
      exam: article.category === PPL_CATEGORY ? 'ppl' : 'all',
    });
  }, [article]);

  const articleHref = `/articles/${article.id}`;

  return (
    <section
      className="mb-6 rounded-xl border-2 border-hud-green/30 bg-brand-secondary-dark p-4 shadow-lg shadow-hud-green/10 sm:p-5"
      aria-labelledby="next-comprehension-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <ClipboardCheck
            className="mt-0.5 h-7 w-7 shrink-0 text-hud-green"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-hud-green">
              次の理解チェック
            </p>
            <h2
              id="next-comprehension-heading"
              className="truncate text-base font-bold text-[var(--text-primary)] sm:text-lg"
            >
              {article.title}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)] sm:text-sm">
              読了済みです。対応問題を3問以上・80%以上で理解確認 (+10 XP) になります。
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <Link
            to={quizHref}
            onClick={() => trackArticleToQuizClick(article.id, article.category)}
            className="inline-flex items-center justify-center rounded-lg bg-hud-green px-4 py-2.5 text-sm font-semibold text-brand-secondary transition hover:brightness-110"
          >
            理解チェックを始める
          </Link>
          <Link
            to={articleHref}
            className="inline-flex items-center justify-center rounded-lg border border-brand-primary/40 px-4 py-2.5 text-sm font-medium text-brand-primary transition hover:border-brand-primary/60 hover:bg-brand-primary/5"
          >
            記事を開く
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NextComprehensionCTA;
