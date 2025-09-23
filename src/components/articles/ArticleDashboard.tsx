import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useArticleProgress } from '../../hooks/useArticleProgress';
import { useArticleStats } from '../../hooks/useArticleStats';
import { useAuth } from '../../hooks/useAuth';
import { LearningContent } from '../../types';
import { ArticleMeta } from '../../types/articles';
import { buildArticleIndex } from '../../utils/articlesIndex';
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
  const { effectiveTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 進捗管理
  const {
    stats,
    userProgress,
    isDemo,
    getArticleProgress,
    isLoading: progressLoading
  } = useArticleProgress();

  // ソーシャル機能
  const {
    stats: socialStats,
    loadArticleStats
  } = useArticleStats();

  // 記事メタデータ
  const [articleMetas, setArticleMetas] = useState<Record<string, ArticleMeta>>({});

  // URLパラメータから状態を取得
  const categoryFromUrl = searchParams.get('category');
  const tagsFromUrl = searchParams.get('tags') || '';
  const sortFromUrl = searchParams.get('sort') || '';

  // フィルタリング状態
  const [activeCategory, setActiveCategory] = useState<string>(
    categoryFromUrl || 'すべて'
  );
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

        // ソーシャル統計も読み込み
        const articleIds = index.map(entry => entry.meta.slug);
        loadArticleStats(articleIds);
      } catch (error) {
        console.error('記事メタデータの読み込みエラー:', error);
      }
    };

    loadArticleMetas();
  }, [loadArticleStats]);

  // Articles専用のコンテンツフィルタリング
  const articleCategories = ['メンタリティー', '思考法', '操縦'];
  const articleContents = useMemo(() => {
    return learningContents.filter(
      (content) => content.is_published && articleCategories.includes(content.category)
    );
  }, [learningContents]);

  // フィルタリングロジック
  const filteredContents = useMemo(() => {
    let filtered = articleContents;

    // カテゴリーフィルタ
    if (activeCategory !== 'すべて') {
      filtered = filtered.filter((content) => content.category === activeCategory);
    }

    // タグフィルタ（複数選択）
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
          const likesA = socialA?.likes || 0;
          const likesB = socialB?.likes || 0;
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
  }, [articleContents, activeCategory, selectedTags, articleMetas, sortBy, sortOrder, socialStats]);

  // 利用可能なタグを抽出
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    Object.values(articleMetas).forEach(meta => {
      meta.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [articleMetas]);


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
    }

    setSortBy(defaultSort);

    const newSearchParams = new URLSearchParams(searchParams);
    if (category === 'すべて') {
      newSearchParams.delete('category');
    } else {
      newSearchParams.set('category', category);
    }
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

  // ソート順序変更
  const handleSortOrderChange = useCallback(() => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
  }, [sortOrder]);



  // 登録促進モーダル
  const showRegistrationModal = useCallback(() => {
    navigate('/auth');
  }, [navigate]);

  // ローディング状態
  if (isLoading || progressLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          background: effectiveTheme === 'day' ? '#0b1d3a' : 'var(--bg)',
          color: 'var(--text-primary)'
        }}
      >
        <div className={`
          text-center p-8 rounded-xl border backdrop-blur-sm
          ${effectiveTheme === 'dark'
            ? 'hud-surface border-gray-700'
            : 'hud-surface border-gray-300'
          }
        `}>
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${effectiveTheme === 'dark' ? 'border-red-500' : 'border-green-500'
            }`}></div>
          <p className={`text-lg font-medium ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            学習データを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 relative"
      style={{
        background: effectiveTheme === 'day' ? '#0b1d3a' : 'var(--bg)',
        color: 'var(--text-primary)'
      }}
    >
      {/* HUD枠線 */}
      {effectiveTheme === 'day' && (
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
                isDemo={isDemo}
                onRegisterClick={showRegistrationModal}
              />
            )}
          </div>

          {/* メインエリア: 記事一覧 */}
          <div className="xl:col-span-3 order-1 xl:order-2">
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
            <div className="space-y-6">
              {filteredContents.length > 0 ? (
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${effectiveTheme === 'day' ? 'hud-grid' : ''
                  }`}>
                  {filteredContents.map((article) => {
                    // 記事のメタデータを取得
                    const meta = Object.values(articleMetas).find(m =>
                      m.slug.includes(article.id) || article.title.includes(m.title)
                    );

                    // 進捗情報を取得
                    const progress = meta ? getArticleProgress(meta.slug) : undefined;

                    // ソーシャル統計を取得
                    const stats = meta ? socialStats[meta.slug] : undefined;

                    return (
                      <EnhancedArticleCard
                        key={article.id}
                        article={article}
                        articleMeta={meta}
                        progress={progress || undefined}
                        isDemo={isDemo}
                        onRegisterPrompt={showRegistrationModal}
                        stats={stats}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className={`
                  text-center py-12 p-8 rounded-xl border backdrop-blur-sm
                  ${effectiveTheme === 'dark'
                    ? 'hud-surface border-gray-700 text-gray-400'
                    : 'hud-surface border-gray-300 text-gray-600'
                  }
                `}>
                  <div className="text-4xl mb-4">📚</div>
                  <p className={`text-lg font-medium mb-2 ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                    記事が見つかりませんでした
                  </p>
                  <p className="text-sm">
                    検索条件を変更するか、カテゴリーを「すべて」に設定してお試しください。
                  </p>
                </div>
              )}
            </div>

            {/* デモ用追加情報 */}
            {isDemo && filteredContents.length > 0 && (
              <div className={`
                 mt-12 p-6 rounded-xl border-2 border-dashed text-center backdrop-blur-sm
                 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                 ${effectiveTheme === 'dark'
                  ? 'border-blue-500/60 bg-blue-900/30 hover:bg-blue-900/40 shadow-blue-900/20'
                  : 'hud-surface hover:bg-white/10 shadow-green-900/10'
                }
               `}>
                <div className="text-3xl mb-4">🎯</div>
                <h3 className={`
                   text-xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent
                   ${effectiveTheme === 'dark'
                    ? 'from-white to-gray-200'
                    : 'from-[#39FF14] to-green-600'
                  }
                 `}>
                  さらに詳しい学習分析を体験
                </h3>
                <p className={`
                  mb-4
                  ${effectiveTheme === 'dark'
                    ? 'text-gray-300'
                    : 'text-[color:var(--text-primary)]'
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
                     ${effectiveTheme === 'dark'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 border-blue-500/30'
                      : 'hud-surface hud-text hover:bg-white/10'
                    }
                   `}
                >
                  無料で始める ✨
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
