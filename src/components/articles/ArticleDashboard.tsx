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
import ArticleTabs from './ArticleTabs';
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
  const searchFromUrl = searchParams.get('q') || '';
  const tagsFromUrl = searchParams.get('tags') || '';

  // フィルタリング状態
  const [activeCategory, setActiveCategory] = useState<string>(
    categoryFromUrl || 'すべて'
  );
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    tagsFromUrl ? tagsFromUrl.split(',').filter(Boolean) : []
  );

  // 記事メタデータの読み込み
  React.useEffect(() => {
    const loadArticleMetas = async () => {
      try {
        const index = await buildArticleIndex();
        const metaMap: Record<string, ArticleMeta> = {};
        index.forEach(entry => {
          metaMap[entry.meta.slug] = entry.meta;
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
    const normalizeText = (s: string) => {
      const nk = s.normalize('NFKC');
      const lower = nk.toLowerCase();
      return lower.replace(/[\u30a1-\u30f6]/g, (ch) =>
        String.fromCharCode(ch.charCodeAt(0) - 0x60)
      );
    };

    let filtered = articleContents;

    // カテゴリーフィルタ
    if (activeCategory !== 'すべて') {
      filtered = filtered.filter((content) => content.category === activeCategory);
    }

    // 検索クエリフィルタ
    if (searchQuery.trim()) {
      const normalizedQuery = normalizeText(searchQuery);
      filtered = filtered.filter((content) => {
        const titleMatch = normalizeText(content.title).includes(normalizedQuery);
        const descMatch = normalizeText(content.description || '').includes(normalizedQuery);
        const categoryMatch = normalizeText(content.category).includes(normalizedQuery);

        // メタデータからも検索
        const meta = Object.values(articleMetas).find(m =>
          m.slug.includes(content.id) || content.title.includes(m.title)
        );
        const metaMatch = meta ?
          normalizeText(meta.title).includes(normalizedQuery) ||
          normalizeText(meta.excerpt || '').includes(normalizedQuery) ||
          meta.tags.some(tag => normalizeText(tag).includes(normalizedQuery))
          : false;

        return titleMatch || descMatch || categoryMatch || metaMatch;
      });
    }

    // タグフィルタ
    if (selectedTags.length > 0) {
      filtered = filtered.filter((content) => {
        const meta = Object.values(articleMetas).find(m =>
          m.slug.includes(content.id) || content.title.includes(m.title)
        );
        return meta ? selectedTags.some(tag => meta.tags.includes(tag)) : false;
      });
    }

    return filtered;
  }, [articleContents, activeCategory, searchQuery, selectedTags, articleMetas]);

  // 利用可能なタグを抽出
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    Object.values(articleMetas).forEach(meta => {
      meta.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [articleMetas]);

  // 登録促進モーダル
  const showRegistrationModal = useCallback(() => {
    navigate('/auth');
  }, [navigate]);

  // ローディング状態
  if (isLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className={`
          text-center
          ${effectiveTheme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mx-auto mb-4"></div>
          <p>学習データを読み込み中...</p>
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
            {/* 検索・フィルタリング */}
            <div className="mb-8">
              <ArticleSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                availableTags={availableTags}
                placeholder="記事を検索..."
              />
            </div>

            {/* カテゴリータブ */}
            <div className="mb-6">
              <ArticleTabs
                categories={['すべて', ...articleCategories]}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                contentCounts={{
                  'すべて': articleContents.length,
                  ...articleCategories.reduce((acc, cat) => ({
                    ...acc,
                    [cat]: articleContents.filter(c => c.category === cat).length
                  }), {})
                }}
              />
            </div>

            {/* 記事一覧 */}
            <div className="space-y-6">
              {filteredContents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredContents.map((article) => {
                    // 記事のメタデータを取得
                    const meta = Object.values(articleMetas).find(m =>
                      m.slug.includes(article.id) || article.title.includes(m.title)
                    );

                    // 進捗情報を取得
                    const progress = meta ? getArticleProgress(meta.slug) : null;

                    // ソーシャル統計を取得
                    const stats = meta ? socialStats[meta.slug] : undefined;

                    return (
                      <EnhancedArticleCard
                        key={article.id}
                        article={article}
                        articleMeta={meta}
                        progress={progress}
                        isDemo={isDemo}
                        onRegisterPrompt={showRegistrationModal}
                        stats={stats}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className={`
                  text-center py-12
                  ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  <div className="text-4xl mb-4">📚</div>
                  <p className="text-lg font-medium mb-2">記事が見つかりませんでした</p>
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
