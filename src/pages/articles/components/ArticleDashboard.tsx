import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useArticleProgress } from '../../../hooks/useArticleProgress';
import { useArticleStats } from '../../../hooks/useArticleStats';
import { useSeriesUnlock } from '../../../hooks/useSeriesUnlock';
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

  // 進捗管理
  const {
    stats,
    isDemo,
    getArticleProgress,
    isLoading: progressLoading
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
  const groupFromUrl = searchParams.get('group');
  const tagsFromUrl = searchParams.get('tags') || '';
  const sortFromUrl = searchParams.get('sort') || '';

  // フィルタリング状態
  const [activeGroup, setActiveGroup] = useState<string | null>(
    groupFromUrl || null
  );
  const [activeCategory, setActiveCategory] = useState<string>(
    categoryFromUrl || 'すべて'
  );

  // URLパラメータの変更を監視
  React.useEffect(() => {
    const groupParam = searchParams.get('group');
    const categoryParam = searchParams.get('category');
    if (groupParam !== activeGroup) {
      setActiveGroup(groupParam);
    }
    if (categoryParam !== activeCategory && categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);
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

  // 記事グループの定義
  const articleGroups = {
    'マインド': ['メンタリティー', '思考法'],
    '学科知識': ['CPL学科', 'PPL'],
    '操縦技': ['操縦']
  };

  // Articles専用のコンテンツフィルタリング
  const articleCategories = ['メンタリティー', '思考法', '操縦', 'CPL学科', 'PPL'];
  const articleContents = useMemo(() => {
    return learningContents.filter(
      (content) => content.is_published && articleCategories.includes(content.category)
    );
  }, [learningContents]);

  // シリーズアンロック機能
  const learningContentIds = useMemo(() => articleContents.map(c => c.id), [articleContents]);
  const seriesUnlock = useSeriesUnlock(articleMetas, learningContentIds);

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

    // グループフィルタ
    if (activeGroup) {
      const groupCategories = articleGroups[activeGroup as keyof typeof articleGroups] || [];
      filtered = filtered.filter((content) => groupCategories.includes(content.category));
    }

    // カテゴリーフィルタ
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
        case 'date':
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          comparison = dateA - dateB;
          break;

        case 'title':
          comparison = a.title.localeCompare(b.title, 'ja');
          break;

        case 'readingTime':
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

        case 'popularity':
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

        case 'category':
          comparison = a.category.localeCompare(b.category, 'ja');
          break;


        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [articleContents, activeGroup, activeCategory, selectedTags, articleMetas, sortBy, sortOrder, socialStats, articleGroups]);

  // 記事クリック時の閲覧数記録とロックチェック
  const handleArticleClick = async (articleId: string, isLocked: boolean) => {
    if (isLocked) {
      // ロックされている場合は遷移しない（トーストなどで通知するか、CTAを表示）
      const reason = seriesUnlock.getLockedReason(articleId);
      if (reason) {
        alert(reason); // TODO: トーストライブラリに置き換え
      }
      return;
    }

    try {
      await recordView({ article_id: articleId });
      navigate(`/articles/${articleId}`);
    } catch (error) {
      console.error('閲覧数の記録に失敗しました:', error);
    }
  };

  // 利用可能なタグを抽出
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    Object.values(articleMetas).forEach(meta => {
      meta.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [articleMetas]);


  // グループ変更時の処理
  const handleGroupChange = useCallback((group: string | null) => {
    setActiveGroup(group);
    setActiveCategory('すべて');
    const newSearchParams = new URLSearchParams(searchParams);
    if (group) {
      newSearchParams.set('group', group);
    } else {
      newSearchParams.delete('group');
    }
    newSearchParams.delete('category');
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  // カテゴリ変更時のURLパラメータ更新とソート適用
  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setActiveGroup(null); // カテゴリ選択時はグループをクリア

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
    newSearchParams.delete('group');
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
        <div className={`
          text-center p-8 rounded-xl border backdrop-blur-sm
          ${true
            ? 'bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20'
            : 'bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20'
          }
        `}>
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
      {/* HUD枠線 */}
      {false && (
        <>
          {/* 上部のHUDライン */}
          <div className="hud-line" />
          {/* 左右のHUDライン */}
          <div className="absolute top-0 left-0 h-full" style={{ width: 1 }}>
            <div className="hud-line" style={{ width: 1, height: '100%' }} />
          </div>
          <div className="absolute top-0 right-0 h-full" style={{ width: 1 }}>
            <div className="hud-line" style={{ width: 1, height: '100%' }} />
          </div>
        </>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              />
            )}
          </div>

          {/* メインエリア: 記事一覧 */}
          <div className="xl:col-span-3 order-1 xl:order-2">
            {/* グループタブ */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleGroupChange(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!activeGroup
                    ? 'bg-whiskyPapa-yellow text-black shadow-lg shadow-whiskyPapa-yellow/50'
                    : 'bg-gray-800 text-gray-300 border-2 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                    }`}
                >
                  すべて
                </button>
                {Object.keys(articleGroups).map((group) => {
                  const groupCategories = articleGroups[group as keyof typeof articleGroups];
                  const groupCount = articleContents.filter(c => groupCategories.includes(c.category)).length;
                  return (
                    <button
                      key={group}
                      onClick={() => handleGroupChange(group)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeGroup === group
                        ? 'bg-whiskyPapa-yellow text-black shadow-lg shadow-whiskyPapa-yellow/50'
                        : 'bg-gray-800 text-gray-300 border-2 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                        }`}
                    >
                      {group} ({groupCount})
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
                categories={['すべて', ...articleCategories]}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                categoryCounts={{
                  'すべて': articleContents.length,
                  ...articleCategories.reduce((acc, cat) => ({
                    ...acc,
                    [cat]: articleContents.filter(c => c.category === cat).length
                  }), {})
                }}
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
                (() => {
                  // グループごとに記事を分類
                  const groupedContents: Record<string, typeof filteredContents> = {};
                  Object.keys(articleGroups).forEach(group => {
                    const groupCategories = articleGroups[group as keyof typeof articleGroups];
                    groupedContents[group] = filteredContents.filter(c => groupCategories.includes(c.category));
                  });

                  // アクティブなグループがある場合はそのグループのみ表示、ない場合は全グループ表示
                  const displayGroups = activeGroup
                    ? [activeGroup]
                    : Object.keys(articleGroups).filter(group => groupedContents[group].length > 0);

                  return (
                    <>
                      {displayGroups.map((group) => {
                        const groupArticles = groupedContents[group];
                        if (groupArticles.length === 0) return null;

                        return (
                          <div key={group} className="space-y-4">
                            {/* グループヘッダー */}
                            <div className="flex items-center space-x-3 mb-4">
                              <h2 className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent from-white to-gray-200">
                                {group}
                              </h2>
                              <span className="text-sm text-gray-400">
                                ({groupArticles.length}件)
                              </span>
                              <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent"></div>
                            </div>

                            {/* グループの記事 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {groupArticles.map((article) => {
                                // 記事のメタデータを取得
                                const meta = Object.values(articleMetas).find(m =>
                                  m.slug.includes(article.id) || article.title.includes(m.title)
                                );

                                // 進捗情報を取得
                                const progress = meta ? getArticleProgress(meta.slug) : undefined;

                                // ソーシャル統計を取得（デフォルト値を提供）
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
                                    locked={!seriesUnlock.isUnlocked(article.id)}
                                    lockedReason={seriesUnlock.getLockedReason(article.id)}
                                    onArticleClick={() => handleArticleClick(article.id, !seriesUnlock.isUnlocked(article.id))}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()
              ) : (
                <div className={`
                  text-center py-12 p-8 rounded-xl border backdrop-blur-sm
                  ${true
                    ? 'bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20 text-gray-400'
                    : 'bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20 text-gray-400'
                  }
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
              <div className={`
                 mt-12 p-6 rounded-xl border-2 border-dashed text-center backdrop-blur-sm
                 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                 ${true
                  ? 'border-blue-500/60 bg-blue-900/30 hover:bg-blue-900/40 shadow-blue-900/20'
                  : 'bg-whiskyPapa-black-dark hover:bg-whiskyPapa-yellow/10'
                }
               `}>
                <div className="text-3xl mb-4">🎯</div>
                <h3 className={`
                   text-xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent
                   ${true
                    ? 'from-white to-gray-200'
                    : 'from-[#39FF14] to-green-600'
                  }
                 `}>
                  さらに詳しい学習分析を体験
                </h3>
                <p className={`
                  mb-4
                  ${true
                    ? 'text-gray-300'
                    : 'text-white'
                  }
                `}>
                  登録すると、AI による学習パターン分析、パーソナライズされた推薦、
                  詳細な成績レポートなどが利用できます。
                </p>
                <button
                  onClick={showRegistrationModal}
                  className={`
                     px-8 py-3 rounded-xl font-medium transition-all duration-300
                     shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1
                     border backdrop-blur-sm
                     ${true
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 border-blue-500/30'
                      : 'bg-whiskyPapa-black-dark text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10'
                    }
                   `}
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
