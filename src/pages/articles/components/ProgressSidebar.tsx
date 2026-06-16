import React, { useMemo } from 'react';
import {
  countMindsetArticles,
  CPL_CATEGORY,
  FLIGHT_OPS_CATEGORY,
  isMindsetCategory,
  PPL_CATEGORY,
} from '../../../constants/articleHubCategories';
import { LearningStats } from '../../../hooks/useArticleProgress';
import { LearningContent } from '../../../types';

interface ProgressSidebarProps {
  stats: LearningStats;
  articleContents: LearningContent[];
  isDemo: boolean;
  onRegisterClick?: () => void;
  getArticleProgress?: (articleSlug: string) => { completed: boolean } | null;
}

interface ProgressRow {
  key: string;
  label: string;
  read: number;
  total: number;
}

function computeReadCount(
  contents: LearningContent[],
  isDemo: boolean,
  getArticleProgress?: (id: string) => { completed: boolean } | null
): number {
  return contents.filter((content) => {
    if (isDemo) return Math.random() > 0.7;
    if (getArticleProgress) return getArticleProgress(content.id)?.completed ?? false;
    return false;
  }).length;
}

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  stats,
  articleContents,
  isDemo,
  onRegisterClick,
  getArticleProgress,
}) => {
  const progressRows = useMemo((): ProgressRow[] => {
    const rows: ProgressRow[] = [];

    const cplContents = articleContents.filter((c) => c.category === CPL_CATEGORY);
    if (cplContents.length > 0) {
      rows.push({
        key: 'cpl',
        label: 'CPL 学科',
        total: cplContents.length,
        read: computeReadCount(cplContents, isDemo, getArticleProgress),
      });
    }

    const pplContents = articleContents.filter((c) => c.category === PPL_CATEGORY);
    if (pplContents.length > 0) {
      rows.push({
        key: 'ppl',
        label: 'PPL 基礎',
        total: pplContents.length,
        read: computeReadCount(pplContents, isDemo, getArticleProgress),
      });
    }

    const usafContents = articleContents.filter((c) => c.category === FLIGHT_OPS_CATEGORY);
    if (usafContents.length > 0) {
      rows.push({
        key: 'usaf',
        label: 'USAF教程',
        total: usafContents.length,
        read: computeReadCount(usafContents, isDemo, getArticleProgress),
      });
    }

    if (countMindsetArticles(articleContents) > 0) {
      const mindsetContents = articleContents.filter((c) => isMindsetCategory(c.category));
      rows.push({
        key: 'mindset',
        label: 'メンタリティ',
        total: mindsetContents.length,
        read: computeReadCount(mindsetContents, isDemo, getArticleProgress),
      });
    }

    rows.push({
      key: 'total',
      label: 'トータル',
      total: articleContents.length,
      read: computeReadCount(articleContents, isDemo, getArticleProgress),
    });

    return rows;
  }, [articleContents, getArticleProgress, isDemo]);

  const categoryRows = useMemo(() => {
    const categories = [...new Set(articleContents.map((c) => c.category))].sort((a, b) =>
      a.localeCompare(b, 'ja')
    );
    return categories.map((category) => {
      const categoryContents = articleContents.filter((c) => c.category === category);
      const total = categoryContents.length;
      const read = computeReadCount(categoryContents, isDemo, getArticleProgress);
      return { category, total, read, percentage: total > 0 ? Math.round((read / total) * 100) : 0 };
    });
  }, [articleContents, getArticleProgress, isDemo]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 border-brand-primary/20 bg-brand-secondary-dark p-5 shadow-lg backdrop-blur-sm">
        <h3 className="mb-4 flex items-center bg-gradient-to-r from-brand-primary to-brand-primary/80 bg-clip-text text-lg font-bold text-transparent">
          学習トラック別進捗
        </h3>
        <div className="space-y-4">
          {progressRows.map((row) => {
            const percentage = row.total > 0 ? Math.round((row.read / row.total) * 100) : 0;
            return (
              <div key={row.key}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-primary/90">{row.label}</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {row.read}/{row.total}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full border border-brand-primary/30 bg-[var(--bg)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-primary/80 shadow-lg shadow-brand-primary/30 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-1 text-right text-xs text-[var(--text-muted)]">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {categoryRows.length > 0 && (
        <div className="rounded-xl border-2 border-hud-green/20 bg-brand-secondary-dark p-5 shadow-lg backdrop-blur-sm">
          <h3 className="mb-4 flex items-center bg-gradient-to-r from-hud-green to-hud-green/80 bg-clip-text text-lg font-bold text-transparent">
            カテゴリー別進捗
          </h3>
          <div className="space-y-4">
            {categoryRows.map(({ category, read, total, percentage }) => (
              <div key={category}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-hud-green/90">{category}</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {read}/{total}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full border border-hud-green/30 bg-[var(--bg)]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r shadow-lg ${
                      percentage === 100
                        ? 'from-hud-green to-hud-green/80 shadow-hud-green/50'
                        : 'from-hud-green/80 to-hud-green/60 shadow-hud-green/30'
                    } transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-xs text-[var(--text-muted)]">{percentage}%</div>
                  {percentage === 100 && <div className="text-xs text-hud-green">完了</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border-2 border-brand-primary/20 bg-brand-secondary-dark p-5 shadow-lg backdrop-blur-sm">
        <h3 className="mb-4 flex items-center bg-gradient-to-r from-brand-primary to-brand-primary/80 bg-clip-text text-lg font-bold text-transparent">
          最近の活動
        </h3>
        <div className="space-y-3">
          {stats.recentActivity.slice(0, 5).map((activity, index) => (
            <div
              key={`${activity.articleSlug}-${index}`}
              className="rounded-lg border border-brand-primary/20 bg-[var(--bg)] p-3 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-brand-primary/40"
            >
              <div className="mb-2 flex items-center justify-between">
                <div
                  className={`rounded-full px-2 py-1 text-xs ${
                    activity.completed
                      ? 'border border-hud-green/30 bg-hud-green/20 text-hud-green'
                      : 'border border-brand-primary/30 bg-brand-primary/20 text-brand-primary'
                  }`}
                >
                  {activity.completed ? '完了' : '進行中'}
                </div>
                {activity.bookmarked && (
                  <div className="text-xs text-brand-primary">🔖</div>
                )}
              </div>
              <div className="mb-1 truncate text-sm font-medium text-[var(--text-primary)]">
                記事: {activity.articleSlug.split('/').pop()?.replace(/[-_]/g, ' ')}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {new Date(activity.readAt).toLocaleDateString('ja-JP', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isDemo && onRegisterClick && (
        <div className="rounded-xl border-2 border-dashed border-brand-primary/60 bg-brand-secondary-dark p-5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:bg-brand-primary/5 hover:shadow-lg">
          <div className="text-center">
            <div className="mb-2 text-2xl">🚀</div>
            <h4 className="mb-2 font-bold text-brand-primary">もっと詳しい分析を見る</h4>
            <p className="mb-4 text-sm text-[var(--text-muted)]">
              登録すると、学習パターン分析、目標設定、詳細なレポートが利用できます。
            </p>
            <button
              type="button"
              onClick={onRegisterClick}
              className="w-full transform rounded-lg bg-gradient-to-r from-brand-primary to-brand-primary/80 px-4 py-3 text-sm font-medium text-[var(--bg)] shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:from-brand-primary/90 hover:to-brand-primary/70 hover:shadow-lg"
            >
              無料で始める
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
