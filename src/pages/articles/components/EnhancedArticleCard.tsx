import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArticleProgress } from '../../../hooks/useArticleProgress';
import { useAuth } from '../../../hooks/useAuth';
import { LearningContent } from '../../../types';
import { ArticleMeta } from '../../../types/articles';
import { calculateBaseArticleXp } from '../../../utils/articleXpRewards';
import {
  ARTICLE_COMPREHENSION_STATUS_LABEL,
  type ArticleComprehensionUiStatus,
} from '../../../utils/articleComprehensionStatus';

interface EnhancedArticleCardProps {
  article: LearningContent;
  articleMeta?: ArticleMeta;
  progress?: ArticleProgress;
  isDemo: boolean;
  onRegisterPrompt?: () => void;
  stats?: {
    likes_count: number;
    comments_count: number;
    views_count: number;
    user_liked: boolean;
  };
  highlightId?: string;
  onArticleClick?: () => void;
  isNextToRead?: boolean;
  /** @deprecated Prefer comprehensionStatus */
  articleStatus?: 'completed' | 'in-progress';
  comprehensionStatus?: ArticleComprehensionUiStatus;
}

const STATUS_CHIP_CLASS: Record<ArticleComprehensionUiStatus, string> = {
  unread: 'bg-brand-surface text-[var(--text-muted)] border-brand-primary/20',
  read: 'bg-brand-primary/20 text-brand-primary border-brand-primary/30',
  comprehended: 'bg-hud-green/20 text-hud-green border-hud-green/30',
};

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export const EnhancedArticleCard: React.FC<EnhancedArticleCardProps> = ({
  article,
  articleMeta,
  progress,
  isDemo,
  onRegisterPrompt,
  stats,
  highlightId,
  onArticleClick,
  isNextToRead = false,
  articleStatus = 'in-progress',
  comprehensionStatus = 'unread',
}) => {
  const { user } = useAuth();
  const [isHighlighted, setIsHighlighted] = useState(false);

  const isLoggedIn = !!user;

  useEffect(() => {
    if (highlightId === article.id) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightId, article.id]);

  const progressPercentage = progress?.scrollProgress || 0;
  const isCompleted = progress?.completed || false;
  const readingTime = articleMeta?.readingTime || 10;
  const statusLabel = ARTICLE_COMPREHENSION_STATUS_LABEL[comprehensionStatus];

  const articleXp = useMemo(() => {
    if (!articleMeta) return 0;
    return calculateBaseArticleXp(article.id, articleMeta);
  }, [article.id, articleMeta]);

  const shouldBlur = isDemo && hashId(article.id) % 10 >= 6;

  const highlightInProgress =
    isNextToRead &&
    (comprehensionStatus === 'unread' || articleStatus === 'in-progress');

  return (
    <div
      className={`
      group relative motion-safe:transition-all motion-safe:duration-300
      ${isHighlighted ? 'highlight-article' : ''}
      ${highlightInProgress ? 'ring-2 ring-brand-primary ring-offset-2 ring-offset-[var(--bg)]' : ''}
    `}
    >
      <div
        className={`absolute right-3 top-3 z-10 rounded-full border px-3 py-1 text-xs font-bold ${STATUS_CHIP_CLASS[comprehensionStatus]}`}
      >
        {statusLabel}
      </div>

      {shouldBlur && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-brand-secondary/70 backdrop-blur-sm">
          <div className="p-4 text-center">
            <div className="mb-2 text-sm font-medium text-[var(--text-primary)]">
              詳細な進捗データ
            </div>
            <button
              type="button"
              onClick={onRegisterPrompt}
              className="rounded-lg bg-brand-primary px-4 py-2 text-xs font-medium text-[var(--bg)] hover:bg-brand-primary-dark"
            >
              登録して見る
            </button>
          </div>
        </div>
      )}

      <Link
        to={`/articles/${article.id}`}
        onClick={onArticleClick}
        className={`relative block overflow-hidden rounded-xl border-2 border-brand-primary/20 bg-brand-secondary-dark p-5 shadow-lg motion-safe:transition-shadow hover:border-brand-primary/40 hover:shadow-xl ${shouldBlur ? 'blur-[1px]' : ''}`}
      >
        {progress && progressPercentage > 0 && (
          <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-brand-surface">
            <div
              className={`h-full ${isCompleted || comprehensionStatus !== 'unread' ? 'bg-hud-green' : 'bg-brand-primary'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        <div className="pr-16">
          <span className="mb-2 inline-block rounded-full border border-brand-primary/30 bg-brand-primary/10 px-2 py-1 text-xs font-medium text-brand-primary">
            {article.category}
          </span>

          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-[var(--text-primary)] group-hover:text-brand-primary">
            {articleMeta?.title || article.title}
          </h3>

          {(articleMeta?.excerpt || article.description) && (
            <p className="mb-3 line-clamp-2 text-sm text-[var(--text-muted)]">
              {articleMeta?.excerpt || article.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-brand-primary/10 pt-3 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span>{readingTime}分</span>
            {articleXp > 0 && (
              <span className="font-semibold text-hud-warning">+{articleXp} XP</span>
            )}
          </div>
          {stats && (
            <div className="flex items-center gap-3">
              {isLoggedIn && (
                <span aria-label={stats.user_liked ? 'いいね済み' : 'いいね'}>
                  {stats.user_liked ? '♥' : '♡'} {stats.likes_count}
                </span>
              )}
              <span>{stats.views_count} 閲覧</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};
