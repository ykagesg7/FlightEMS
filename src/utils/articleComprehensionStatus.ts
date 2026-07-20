import type { ArticleProgress } from '../hooks/useArticleProgress';
import type { LearningContent } from '../types';

/** UI chip / CTA status for an article in the hub. */
export type ArticleComprehensionUiStatus = 'unread' | 'read' | 'comprehended';

export const ARTICLE_COMPREHENSION_STATUS_LABEL: Record<
  ArticleComprehensionUiStatus,
  string
> = {
  unread: '未読',
  read: '読了',
  comprehended: '理解確認済',
};

/** Same threshold as learning_progress / award_article_comprehension_xp. */
export function isArticleReadProgress(
  progress: Pick<ArticleProgress, 'completed' | 'scrollProgress'> | null | undefined,
): boolean {
  if (!progress) return false;
  return progress.completed === true || (progress.scrollProgress ?? 0) >= 95;
}

export function resolveArticleComprehensionStatus(
  progress: Pick<ArticleProgress, 'completed' | 'scrollProgress'> | null | undefined,
  hasComprehensionMilestone: boolean,
): ArticleComprehensionUiStatus {
  if (hasComprehensionMilestone) return 'comprehended';
  if (isArticleReadProgress(progress)) return 'read';
  return 'unread';
}

/**
 * Pick one read-but-not-comprehended article (most recently read first).
 * Returns null when none match.
 */
export function pickNextComprehensionArticle(
  contents: LearningContent[],
  getProgress: (contentId: string) => ArticleProgress | null,
  comprehensionContentIds: ReadonlySet<string>,
): LearningContent | null {
  const candidates = contents
    .filter((article) => {
      if (comprehensionContentIds.has(article.id)) return false;
      return isArticleReadProgress(getProgress(article.id));
    })
    .sort((a, b) => {
      const aAt = getProgress(a.id)?.readAt?.getTime() ?? 0;
      const bAt = getProgress(b.id)?.readAt?.getTime() ?? 0;
      return bAt - aAt;
    });

  return candidates[0] ?? null;
}

/** Build milestone_key set from learning_milestones rows (key === content_id). */
export function comprehensionIdsFromMilestoneKeys(
  rows: Array<{ milestone_key: string } | null | undefined> | null | undefined,
): Set<string> {
  const ids = new Set<string>();
  for (const row of rows ?? []) {
    const key = row?.milestone_key?.trim();
    if (key) ids.add(key);
  }
  return ids;
}
