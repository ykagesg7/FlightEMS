import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CPL_CATEGORY,
  filterPublishedArticleContents,
  FLIGHT_OPS_CATEGORY,
  PPL_CATEGORY,
} from '../../../constants/articleHubCategories';
import { useArticleProgress } from '../../../hooks/useArticleProgress';
import { useArticleStats } from '../../../hooks/useArticleStats';
import { LearningContent } from '../../../types';
import { ArticleMeta } from '../../../types/articles';
import { buildArticleIndex } from '../../../utils/articlesIndex';
import {
  buildArticleHubSearchParams,
  computeNextToReadIds,
  filterArticleHubContents,
  getAllTags,
  getMetaForArticle,
  getTopTags,
  getVisibleTabs,
  parseArticleHubSearchParams,
  parseLegacyArticleHubParams,
  pickNextToReadArticle,
  type ArticleHubSort,
  type ArticleHubState,
  type ArticleHubStatus,
  type ArticleHubTab,
} from '../articleHubFilters';
import { ArticleActiveFilterChips } from './ArticleActiveFilterChips';
import { ArticleFilterDrawer } from './ArticleFilterDrawer';
import { ArticleHubToolbar } from './ArticleHubToolbar';
import { ContinueReadingHero } from './ContinueReadingHero';
import { EnhancedArticleCard } from './EnhancedArticleCard';
import { ProgressSidebar } from './ProgressSidebar';
import { ProgressSummaryHeader } from './ProgressSummaryHeader';

interface ArticleDashboardProps {
  learningContents: LearningContent[];
  isLoading: boolean;
}

function countForTab(contents: LearningContent[], tab: ArticleHubTab): number {
  switch (tab) {
    case 'continue':
      return contents.length;
    case 'cpl':
      return contents.filter((c) => c.category === CPL_CATEGORY).length;
    case 'ppl':
      return contents.filter((c) => c.category === PPL_CATEGORY).length;
    case 'usaf':
      return contents.filter((c) => c.category === FLIGHT_OPS_CATEGORY).length;
    case 'mindset':
      return contents.filter((c) => c.category === 'メンタリティー' || c.category === '思考法').length;
    default:
      return 0;
  }
}

export const ArticleDashboard: React.FC<ArticleDashboardProps> = ({
  learningContents,
  isLoading,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const {
    stats,
    isDemo,
    getArticleProgress,
    isLoading: progressLoading,
    refreshProgress,
  } = useArticleProgress();

  const { stats: socialStats, loadArticleStats, recordView } = useArticleStats();

  const [articleMetas, setArticleMetas] = useState<Record<string, ArticleMeta>>({});
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [legacyMigrated, setLegacyMigrated] = useState(false);

  const articleContents = useMemo(
    () => filterPublishedArticleContents(learningContents),
    [learningContents]
  );

  const visibleTabs = useMemo(() => getVisibleTabs(articleContents), [articleContents]);

  const hubState = useMemo(
    () => parseArticleHubSearchParams(searchParams, visibleTabs),
    [searchParams, visibleTabs]
  );

  // Migrate legacy URL params once on mount
  useEffect(() => {
    if (legacyMigrated) return;
    const hasLegacy =
      searchParams.has('mainFilter') ||
      searchParams.has('category') ||
      (!searchParams.has('tab') &&
        (searchParams.has('mainFilter') || searchParams.has('category')));
    if (!hasLegacy) {
      setLegacyMigrated(true);
      return;
    }
    const legacy = parseLegacyArticleHubParams(searchParams);
    const next = parseArticleHubSearchParams(searchParams, visibleTabs);
    const merged = { ...next, ...legacy, tab: next.tab };
    setSearchParams(buildArticleHubSearchParams(merged), { replace: true });
    setLegacyMigrated(true);
  }, [legacyMigrated, searchParams, setSearchParams, visibleTabs]);

  useEffect(() => {
    if (location.pathname === '/articles') {
      refreshProgress();
    }
  }, [location.pathname, refreshProgress]);

  useEffect(() => {
    const loadArticleMetas = async () => {
      try {
        const index = await buildArticleIndex();
        const metaMap: Record<string, ArticleMeta> = {};
        index.forEach((entry) => {
          metaMap[entry.filename] = entry.meta;
        });
        setArticleMetas(metaMap);
      } catch (error) {
        console.error('記事メタデータの読み込みエラー:', error);
      }
    };
    loadArticleMetas();
  }, []);

  useEffect(() => {
    if (articleContents.length > 0) {
      loadArticleStats(articleContents.map((c) => c.id));
    }
  }, [articleContents, loadArticleStats]);

  const updateHubState = useCallback(
    (patch: Partial<ArticleHubState>) => {
      const next = { ...hubState, ...patch };
      setSearchParams(buildArticleHubSearchParams(next));
    },
    [hubState, setSearchParams]
  );

  const filteredContents = useMemo(
    () =>
      filterArticleHubContents({
        contents: articleContents,
        metas: articleMetas,
        state: hubState,
        getProgress: getArticleProgress,
        socialStats,
      }),
    [articleContents, articleMetas, hubState, getArticleProgress, socialStats]
  );

  const tabScopedContents = useMemo(() => {
    const tabState = { ...hubState, query: '', tags: [], status: 'all' as const };
    return filterArticleHubContents({
      contents: articleContents,
      metas: articleMetas,
      state: tabState,
      getProgress: getArticleProgress,
    });
  }, [articleContents, articleMetas, hubState.tab, getArticleProgress]);

  const availableTags = useMemo(
    () => getAllTags(tabScopedContents, articleMetas),
    [tabScopedContents, articleMetas]
  );

  const topTags = useMemo(
    () => getTopTags(tabScopedContents, articleMetas, 12),
    [tabScopedContents, articleMetas]
  );

  const drawerTags = useMemo(() => {
    const combined = new Set([...topTags, ...hubState.tags, ...availableTags]);
    return [...combined].sort((a, b) => a.localeCompare(b, 'ja'));
  }, [topTags, hubState.tags, availableTags]);

  const tabCounts = useMemo(() => {
    const counts: Partial<Record<ArticleHubTab, number>> = {};
    for (const tab of visibleTabs) {
      counts[tab] = countForTab(articleContents, tab);
    }
    return counts;
  }, [articleContents, visibleTabs]);

  const articleStatuses = useMemo(() => {
    const statusMap = new Map<string, 'completed' | 'in-progress'>();
    filteredContents.forEach((article) => {
      const progress = getArticleProgress(article.id);
      const done =
        progress?.completed === true || (progress?.scrollProgress ?? 0) >= 95;
      statusMap.set(article.id, done ? 'completed' : 'in-progress');
    });
    return statusMap;
  }, [filteredContents, getArticleProgress]);

  const isNextToRead = useMemo(
    () =>
      computeNextToReadIds(filteredContents, articleMetas, getArticleProgress),
    [filteredContents, articleMetas, getArticleProgress]
  );

  const heroArticle = useMemo(() => {
    if (hubState.tab !== 'continue' || hubState.query || hubState.tags.length > 0) {
      return null;
    }
    return pickNextToReadArticle(articleContents, articleMetas, getArticleProgress);
  }, [hubState, articleContents, articleMetas, getArticleProgress]);

  const gridContents = useMemo(() => {
    if (!heroArticle) return filteredContents;
    return filteredContents.filter((c) => c.id !== heroArticle.id);
  }, [filteredContents, heroArticle]);

  const activeFilterCount =
    hubState.tags.length + (hubState.status !== 'all' ? 1 : 0);

  const handleArticleClick = async (articleId: string) => {
    try {
      await recordView({ article_id: articleId });
      navigate(`/articles/${articleId}`);
    } catch (error) {
      console.error('閲覧数の記録に失敗しました:', error);
    }
  };

  const showRegistrationModal = useCallback(() => {
    navigate('/auth');
  }, [navigate]);

  if (isLoading || progressLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text-primary)]">
        <div className="rounded-xl border border-brand-primary/20 bg-brand-secondary-dark p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-brand-primary" />
          <p className="text-lg font-medium">学習データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg)] py-8 text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/mission"
            className="inline-flex items-center gap-2 rounded-lg border border-brand-primary/30 px-4 py-2 text-sm font-medium text-brand-primary transition-colors hover:border-brand-primary/50 hover:text-brand-primary-dark"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Mission Dashboardへ戻る
          </Link>
        </div>

        {stats && (
          <ProgressSummaryHeader
            stats={stats}
            isDemo={isDemo}
            onRegisterClick={showRegistrationModal}
          />
        )}

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-4">
          <div className="order-2 xl:order-1 xl:col-span-1">
            {stats && (
              <ProgressSidebar
                stats={stats}
                articleContents={articleContents}
                isDemo={isDemo}
                onRegisterClick={showRegistrationModal}
                getArticleProgress={getArticleProgress}
              />
            )}
          </div>

          <div className="order-1 xl:order-2 xl:col-span-3">
            <ArticleHubToolbar
              state={hubState}
              visibleTabs={visibleTabs}
              tabCounts={tabCounts}
              onQueryChange={(query) => updateHubState({ query })}
              onTabChange={(tab) => updateHubState({ tab })}
              onSortChange={(sort: ArticleHubSort) => updateHubState({ sort })}
              onOpenFilters={() => setFilterDrawerOpen(true)}
              activeFilterCount={activeFilterCount}
            />

            <ArticleActiveFilterChips
              state={hubState}
              onClearQuery={() => updateHubState({ query: '' })}
              onClearTag={(tag) =>
                updateHubState({ tags: hubState.tags.filter((t) => t !== tag) })
              }
              onClearStatus={() => updateHubState({ status: 'all' })}
              onClearTab={() => updateHubState({ tab: 'continue' })}
            />

            <ArticleFilterDrawer
              isOpen={filterDrawerOpen}
              onClose={() => setFilterDrawerOpen(false)}
              selectedTags={hubState.tags}
              availableTags={drawerTags}
              status={hubState.status}
              onTagsChange={(tags) => updateHubState({ tags })}
              onStatusChange={(status: ArticleHubStatus) => updateHubState({ status })}
            />

            {heroArticle && (
              <ContinueReadingHero
                article={heroArticle}
                meta={getMetaForArticle(heroArticle, articleMetas)}
                onRead={() => handleArticleClick(heroArticle.id)}
              />
            )}

            <div className="space-y-8">
              {gridContents.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {gridContents.map((article) => {
                    const meta = getMetaForArticle(article, articleMetas);
                    const progress = getArticleProgress(article.id);
                    const articleStats = socialStats[article.id] || {
                      likes_count: 0,
                      comments_count: 0,
                      views_count: 0,
                      user_liked: false,
                    };

                    return (
                      <EnhancedArticleCard
                        key={article.id}
                        article={article}
                        articleMeta={meta}
                        progress={progress || undefined}
                        isDemo={isDemo}
                        onRegisterPrompt={showRegistrationModal}
                        stats={articleStats}
                        onArticleClick={() => handleArticleClick(article.id)}
                        isNextToRead={isNextToRead.has(article.id)}
                        articleStatus={articleStatuses.get(article.id) ?? 'in-progress'}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-brand-primary/20 bg-brand-secondary-dark p-8 text-center backdrop-blur-sm text-[var(--text-muted)]">
                  <div className="mb-4 text-4xl">📚</div>
                  <p className="mb-2 text-lg font-medium text-[var(--text-primary)]">
                    記事が見つかりませんでした
                  </p>
                  <p className="text-sm">
                    検索条件やフィルタを変更してお試しください。
                  </p>
                </div>
              )}
            </div>

            {isDemo && gridContents.length > 0 && (
              <div className="mt-12 rounded-xl border-2 border-dashed border-blue-500/60 bg-blue-900/30 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:bg-blue-900/40 hover:shadow-lg">
                <div className="mb-4 text-3xl">🎯</div>
                <h3 className="mb-2 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent from-white to-gray-200">
                  さらに詳しい学習分析を体験
                </h3>
                <p className="mb-4 text-gray-300">
                  登録すると、AI による学習パターン分析、パーソナライズされた推薦、
                  詳細な成績レポートなどが利用できます。
                </p>
                <button
                  type="button"
                  onClick={showRegistrationModal}
                  className="transform rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:from-blue-500 hover:to-purple-500 hover:shadow-xl"
                >
                  無料で始める
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
