import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useArticleProgress } from '../../../hooks/useArticleProgress';
import { useArticleStats } from '../../../hooks/useArticleStats';
import { LearningContent } from '../../../types';
import { ArticleMeta } from '../../../types/articles';
import { buildArticleIndex } from '../../../utils/articlesIndex';
import ArticleSearch from './ArticleSearch';
import ArticleSortControls from './ArticleSortControls';
import { EnhancedArticleCard } from './EnhancedArticleCard';
import { ProgressSidebar } from './ProgressSidebar';
import { ProgressSummaryHeader } from './ProgressSummaryHeader';

interface ArticleDashboardProps {
  learningContents: LearningContent[];
  isLoading: boolean;
}

export const ArticleDashboard: React.FC<ArticleDashboardProps> = ({
  learningContents,
  isLoading
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // 進捗管理
  const {
    stats,
    isDemo,
    getArticleProgress,
    isLoading: progressLoading,
    refreshProgress
  } = useArticleProgress();

  // ソーシャル機能
  const {
    stats: socialStats,
    loadArticleStats,
    recordView
  } = useArticleStats();

  // 記事メタチE�Eタ
  const [articleMetas, setArticleMetas] = useState<Record<string, ArticleMeta>>({});

  // URLパラメータから状態を取得
  const categoryFromUrl = searchParams.get('category');
  const mainFilterFromUrl = searchParams.get('mainFilter');
  const tagsFromUrl = searchParams.get('tags') || '';
  const sortFromUrl = searchParams.get('sort') || '';

  // メインフィルターの定義
  const mainFilters: Record<string, string[]> = {
    'すべて': [],
    'マインド': ['メンタリティー', '思考法'],
    '学科': ['CPL学科', 'PPL'],
    '操縦法': ['操縦']
  };

  // フィルタリング状態
  const [activeMainFilter, setActiveMainFilter] = useState<string>(
    mainFilterFromUrl || 'すべて'
  );
  const [activeCategory, setActiveCategory] = useState<string>(
    categoryFromUrl || 'すべて'
  );

  // URLパラメータの変更を監視
  React.useEffect(() => {
    const mainFilterParam = searchParams.get('mainFilter');
    const categoryParam = searchParams.get('category');
    if (mainFilterParam && mainFilterParam !== activeMainFilter) {
      setActiveMainFilter(mainFilterParam);
    }
    if (categoryParam !== activeCategory && categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);

  // ページ遷移後に進捗を再読み込み
  React.useEffect(() => {
    // /articlesページに戻った時に進捗を再読み込み
    if (location.pathname === '/articles') {
      refreshProgress();
    }
  }, [location.pathname, refreshProgress]);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    tagsFromUrl ? tagsFromUrl.split(',').filter(Boolean) : []
  );

  // ソート状態
  const [sortBy, setSortBy] = useState<string>(sortFromUrl || 'date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 記事メタデータの読み込み
  React.useEffect(() => {
    const loadArticleMetas = async () => {
      try {
        const index = await buildArticleIndex();
        const metaMap: Record<string, ArticleMeta> = {};
        index.forEach(entry => {
          // filenameをキーとして使用（content.idと一致する）
          metaMap[entry.filename] = entry.meta;
        });
        setArticleMetas(metaMap);

        // ソーシャル統計も読み込み（記事コンテンツがロードされた後に行う）
      } catch (error) {
        console.error('記事メタデータの読み込みエラー:', error);
      }
    };

    loadArticleMetas();
  }, [loadArticleStats]);

  // Articles専用のコンテンツフィルタリング
  const articleCategories = ['メンタリティー', '思考法', '操縦', 'CPL学科', 'PPL'];

  // サブフィルター（カテゴリー）の取得
  const subCategories = useMemo(() => {
    if (activeMainFilter === 'すべて') {
      return articleCategories;
    }
    return mainFilters[activeMainFilter as keyof typeof mainFilters] || [];
  }, [activeMainFilter, articleCategories]);
  const articleContents = useMemo(() => {
    return learningContents.filter(
      (content) => content.is_published && articleCategories.includes(content.category)
    );
  }, [learningContents]);

  const getMetaForArticle = useCallback(
    (article: LearningContent): ArticleMeta | undefined =>
      articleMetas[article.id] ??
      Object.values(articleMetas).find(
        m => m.slug.includes(article.id) || article.title.includes(m.title)
      ),
    [articleMetas]
  );

  // 記事コンテンツがロードされた後に統計データを読み込み
  React.useEffect(() => {
    if (articleContents.length > 0) {
      const articleIds = articleContents.map(content => content.id);
      loadArticleStats(articleIds);
    }
  }, [articleContents, loadArticleStats]);

  // フィルタリングロジック
  const filteredContents = useMemo(() => {
    let filtered = articleContents;

    // メインフィルター
    if (activeMainFilter !== 'すべて') {
      const mainFilterCategories = mainFilters[activeMainFilter as keyof typeof mainFilters] || [];
      filtered = filtered.filter((content) => mainFilterCategories.includes(content.category));
    }

    // カテゴリーフィルタ（サブフィルター）
    if (activeCategory !== 'すべて') {
      filtered = filtered.filter((content) => content.category === activeCategory);
    }

    // タグフィルタ（複数選択可）
    if (selectedTags.length > 0) {
      filtered = filtered.filter((content) => {
        const meta = articleMetas[content.id];
        return meta ? selectedTags.some(tag => meta.tags.includes(tag)) : false;
      });
    }


    // ソート処理
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;


      switch (sortBy) {
        case 'date': {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          comparison = dateA - dateB;
          break;
        }

        case 'title':
          comparison = a.title.localeCompare(b.title, 'ja');
          break;

        case 'readingTime': {
          const metaA = Object.values(articleMetas).find(m =>
            m.slug.includes(a.id) || a.title.includes(m.title)
          );
          const metaB = Object.values(articleMetas).find(m =>
            m.slug.includes(b.id) || b.title.includes(m.title)
          );
          const timeA = metaA?.readingTime || 10;
          const timeB = metaB?.readingTime || 10;
          comparison = timeA - timeB;
          break;
        }

        case 'popularity': {
          const statsA = Object.values(articleMetas).find(m =>
            m.slug.includes(a.id) || a.title.includes(m.title)
          );
          const statsB = Object.values(articleMetas).find(m =>
            m.slug.includes(b.id) || b.title.includes(m.title)
          );
          const socialA = statsA ? socialStats[statsA.slug] : undefined;
          const socialB = statsB ? socialStats[statsB.slug] : undefined;
          const likesA = socialA?.likes_count || 0;
          const likesB = socialB?.likes_count || 0;
          comparison = likesA - likesB;
          break;
        }

        case 'category':
          comparison = a.category.localeCompare(b.category, 'ja');
          break;

        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [articleContents, activeMainFilter, activeCategory, selectedTags, articleMetas, sortBy, sortOrder, socialStats, mainFilters]);

  // 記事ステータス（シリーズロック廃止後は完了 / 進行中のみ）
  const articleStatuses = useMemo(() => {
    const statusMap = new Map<string, 'completed' | 'in-progress'>();
    filteredContents.forEach(article => {
      const progress = getArticleProgress(article.id);
      const done = progress?.completed === true || (progress?.scrollProgress ?? 0) >= 95;
      statusMap.set(article.id, done ? 'completed' : 'in-progress');
    });
    return statusMap;
  }, [filteredContents, getArticleProgress]);

  /**
   * 同一 meta.series 内で、最も order が小さい「未完了」記事 1 件だけを「次に読む」としてハイライトする。
   * シリーズなしの記事は対象外（一覧の黄色リングが全未読に付くのを避ける）。
   */
  const isNextToRead = useMemo(() => {
    const nextIds = new Set<string>();
    const bySeries = new Map<string, LearningContent[]>();
    for (const article of filteredContents) {
      const meta = getMetaForArticle(article);
      if (!meta?.series) continue;
      const list = bySeries.get(meta.series) ?? [];
      list.push(article);
      bySeries.set(meta.series, list);
    }
    for (const [, articles] of bySeries) {
      articles.sort(
        (a, b) =>
          (getMetaForArticle(a)?.order ?? 999) - (getMetaForArticle(b)?.order ?? 999)
      );
      const next = articles.find(article => {
        const p = getArticleProgress(article.id);
        return !p?.completed && (p?.scrollProgress ?? 0) < 95;
      });
      if (next) nextIds.add(next.id);
    }
    return nextIds;
  }, [filteredContents, getArticleProgress, getMetaForArticle]);

  const handleArticleClick = async (articleId: string) => {
    try {
      await recordView({ article_id: articleId });
      navigate(`/articles/${articleId}`);
    } catch (error) {
      console.error('閲覧数の記録に失敗しました:', error);
    }
  };

  // タグフィルタリング前のフィルタリング結果（メインフィルター + サブフィルター）
  const contentsBeforeTagFilter = useMemo(() => {
    let filtered = articleContents;

    // メインフィルター
    if (activeMainFilter !== 'すべて') {
      const mainFilterCategories = mainFilters[activeMainFilter as keyof typeof mainFilters] || [];
      filtered = filtered.filter((content) => mainFilterCategories.includes(content.category));
    }

    // カテゴリーフィルタ（サブフィルター）
    if (activeCategory !== 'すべて') {
      filtered = filtered.filter((content) => content.category === activeCategory);
    }

    return filtered;
  }, [articleContents, activeMainFilter, activeCategory, mainFilters]);

  // 利用可能なタグを抽出（フィルタリングされた記事のタグのみ、ソート済み）
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    contentsBeforeTagFilter.forEach(content => {
      const meta = articleMetas[content.id];
      if (meta) {
        meta.tags.forEach(tag => tags.add(tag));
      }
    });
    // 日本語と英語を分けてソート
    const japaneseTags: string[] = [];
    const englishTags: string[] = [];
    Array.from(tags).forEach(tag => {
      // 日本語かどうかの判定（ひらがな、カタカナ、漢字が含まれるか）
      if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(tag)) {
        japaneseTags.push(tag);
      } else {
        englishTags.push(tag);
      }
    });
    // 英語はアルファベット順、日本語は読み順（localeCompare使用）
    englishTags.sort();
    japaneseTags.sort((a, b) => a.localeCompare(b, 'ja'));
    return [...englishTags, ...japaneseTags];
  }, [contentsBeforeTagFilter, articleMetas]);


  // メインフィルター変更時の処理
  const handleMainFilterChange = useCallback((mainFilter: string) => {
    setActiveMainFilter(mainFilter);
    setActiveCategory('すべて');
    const newSearchParams = new URLSearchParams(searchParams);
    if (mainFilter === 'すべて') {
      newSearchParams.delete('mainFilter');
    } else {
      newSearchParams.set('mainFilter', mainFilter);
    }
    newSearchParams.delete('category');
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  // カテゴリ変更時のURLパラメータ更新とソート適用
  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);

    // カテゴリーに応じたデフォルトソートを適用
    let defaultSort = 'date';
    if (category === 'メンタリティー') {
      defaultSort = 'popularity'; // 人気度でソート
    } else if (category === '思考法') {
      defaultSort = 'readingTime'; // 読了時間でソート
    } else if (category === '操縦') {
      defaultSort = 'title'; // タイトル順でソート
    } else if (category === 'CPL学科') {
      defaultSort = 'date'; // 日付順でソート
    }

    setSortBy(defaultSort);

    const newSearchParams = new URLSearchParams(searchParams);
    if (category === 'すべて') {
      newSearchParams.delete('category');
    } else {
      newSearchParams.set('category', category);
    }
    newSearchParams.delete('mainFilter');
    newSearchParams.set('sort', defaultSort);
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  // ソート変更時のURLパラメータ更新
  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', newSortBy);
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  // ソート順の変更
  const handleSortOrderChange = useCallback(() => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
  }, [sortOrder]);



  // 登録誘導モーダル
  const showRegistrationModal = useCallback(() => {
    navigate('/auth');
  }, [navigate]);

  // ローディング状態
  if (isLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-whiskyPapa-black text-white">
        <div className="text-center p-8 rounded-xl border backdrop-blur-sm bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whiskyPapa-yellow mx-auto mb-4"></div>
          <p className="text-lg font-medium text-white">
            学習データを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 relative bg-whiskyPapa-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission Dashboardへの戻るボタン */}
        <div className="mb-6">
          <Link
            to="/mission"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-whiskyPapa-yellow hover:text-whiskyPapa-yellow/80 border border-whiskyPapa-yellow/30 rounded-lg hover:border-whiskyPapa-yellow/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Mission Dashboardへ戻る
          </Link>
        </div>

        {/* 進捗サマリーヘッダー */}
        {stats && (
          <ProgressSummaryHeader
            stats={stats}
            isDemo={isDemo}
            onRegisterClick={showRegistrationModal}
          />
        )}

        {/* メインコンテンツエリア */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* 左サイドバー: 詳細進捗 */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            {stats && (
              <ProgressSidebar
                stats={stats}
                articleContents={articleContents}
                articleCategories={articleCategories}
                isDemo={isDemo}
                onRegisterClick={showRegistrationModal}
                getArticleProgress={getArticleProgress}
                activeMainFilter={activeMainFilter}
                subCategories={subCategories}
              />
            )}
          </div>

          {/* メインエリア: 記事一覧 */}
          <div className="xl:col-span-3 order-1 xl:order-2">
            {/* メインフィルター */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {Object.keys(mainFilters).map((filter) => {
                  const filterCategories = mainFilters[filter as keyof typeof mainFilters];
                  const filterCount = filter === 'すべて'
                    ? articleContents.length
                    : articleContents.filter(c => filterCategories.includes(c.category)).length;
                  return (
                    <button
                      key={filter}
                      onClick={() => handleMainFilterChange(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeMainFilter === filter
                        ? 'bg-whiskyPapa-yellow text-black shadow-lg shadow-whiskyPapa-yellow/50'
                        : 'bg-gray-800 text-gray-300 border-2 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                        }`}
                    >
                      {filter} ({filterCount})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* フィルタリング */}
            <div className="mb-8">
              <ArticleSearch
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                availableTags={availableTags}
                categories={['すべて', ...subCategories]}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                categoryCounts={{
                  'すべて': filteredContents.length,
                  ...subCategories.reduce((acc, cat) => {
                    const count = articleContents.filter(c => {
                      // メインフィルターが適用されている場合は、その範囲内でカウント
                      if (activeMainFilter !== 'すべて') {
                        const mainFilterCategories = mainFilters[activeMainFilter as keyof typeof mainFilters];
                        return c.category === cat && mainFilterCategories.includes(c.category);
                      }
                      return c.category === cat;
                    }).length;
                    return { ...acc, [cat]: count };
                  }, {})
                }}
                mainFilter={activeMainFilter}
              />
            </div>


            {/* ソートコントロール */}
            <div className="mb-6">
              <ArticleSortControls
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                onSortOrderChange={handleSortOrderChange}
              />
            </div>

            {/* 記事一覧 */}
            <div className="space-y-8">
              {filteredContents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredContents.map((article) => {
                    const meta = getMetaForArticle(article);
                    const progress = getArticleProgress(article.id);

                    const stats = socialStats[article.id] || {
                      likes_count: 0,
                      comments_count: 0,
                      views_count: 0,
                      user_liked: false
                    };

                    return (
                      <EnhancedArticleCard
                        key={article.id}
                        article={article}
                        articleMeta={meta}
                        progress={progress || undefined}
                        isDemo={isDemo}
                        onRegisterPrompt={showRegistrationModal}
                        stats={stats}
                        onArticleClick={() => handleArticleClick(article.id)}
                        isNextToRead={isNextToRead.has(article.id)}
                        articleStatus={articleStatuses.get(article.id) ?? 'in-progress'}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className={`
                  text-center py-12 p-8 rounded-xl border backdrop-blur-sm
                  ${'bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20 text-gray-400'}
                `}>
                  <div className="text-4xl mb-4">📚</div>
                  <p className="text-lg font-medium mb-2 text-white">
                    記事が見つかりませんでした
                  </p>
                  <p className="text-sm">
                    検索条件を変更するか、カテゴリーを「すべて」に設定してお試しください。
                  </p>
                </div>
              )}
            </div>

            {/* デモ用追加機能 */}
            {isDemo && filteredContents.length > 0 && (
              <div className="mt-12 p-6 rounded-xl border-2 border-dashed text-center backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-blue-500/60 bg-blue-900/30 hover:bg-blue-900/40 shadow-blue-900/20">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent from-white to-gray-200">
                  さらに詳しい学習分析を体験
                </h3>
                <p className="mb-4 text-gray-300">
                  登録すると、AI による学習パターン分析、パーソナライズされた推薦、
                  詳細な成績レポートなどが利用できます。
                </p>
                <button
                  onClick={showRegistrationModal}
                  className="px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 border backdrop-blur-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 border-blue-500/30"
                >
                  無料で始める✨
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
