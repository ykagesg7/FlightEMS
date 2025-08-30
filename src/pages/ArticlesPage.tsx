import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ArticleSearch from '../components/articles/ArticleSearch';
import ArticleSection from '../components/articles/ArticleSection';
import ArticleTabs from '../components/articles/ArticleTabs';
import { CommentsModal } from '../components/articles/CommentsModal';
import FreemiumUpgradePrompt from '../components/learning/FreemiumUpgradePrompt';
import LearningTabMDX from '../components/mdx/LearningTabMDX';
import { useArticleStats } from '../hooks/useArticleStats';
import { useLearningProgress } from '../hooks/useLearningProgress';

// ハイライト効果用のスタイル（HUDトークン使用）
const highlightStyle = `
  .highlight-article {
    animation: highlight-pulse 2s ease-in-out;
    transform: scale(1.02);
    border-color: var(--hud-primary) !important;
    box-shadow: 0 0 20px var(--hud-glow) !important;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @keyframes highlight-pulse {
    0% { transform: scale(1); border-color: inherit; box-shadow: inherit; }
    50% { transform: scale(1.02); border-color: var(--hud-primary); box-shadow: 0 0 20px var(--hud-glow); }
    100% { transform: scale(1.02); border-color: var(--hud-primary); box-shadow: 0 0 20px var(--hud-glow); }
  }
`;

// 記事カテゴリマッピング（Articles専用）
const articleCategoryMapping: { [key: string]: string } = {
  mentality: 'メンタリティー',
  thinking: '思考法',
  'logical-thinking': '論理的思考',
  'flight-control': '操縦',
  others: 'その他',
};

function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const searchFromUrl = searchParams.get('q') || '';
  const tagsFromUrl = searchParams.get('tags') || '';


  const { learningContents, isLoading, loadLearningContents } = useLearningProgress();

  // Articles専用のコンテンツフィルタリング
  const articleCategories = ['メンタリティー', '思考法', '操縦'];

  const articleContents = useMemo(() => {
    return learningContents.filter(
      (content) => content.is_published && articleCategories.includes(content.category)
    );
  }, [learningContents]);



  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedArticleForComments, setSelectedArticleForComments] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // 新しい状態管理
  const [activeCategory, setActiveCategory] = useState<string>(categoryFromUrl ? (articleCategoryMapping[categoryFromUrl] || 'すべて') : 'メンタリティー');
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedTags, setSelectedTags] = useState<string[]>(tagsFromUrl ? tagsFromUrl.split(',').filter(Boolean) : []);

  // ソーシャル機能のフック
  const { stats, comments, loadArticleStats, loadComments, createComment, recordView } =
    useArticleStats();

  // Articles専用コンテンツ（フリーミアム判定は現状未使用）
  const accessibleArticleContents = articleContents;

  // 改善されたフィルタリングロジック
  const filteredContents = useMemo(() => {
    const normalizeText = (s: string) => {
      const nk = s.normalize('NFKC');
      const lower = nk.toLowerCase();
      // カタカナ→ひらがな
      return lower.replace(/[\u30a1-\u30f6]/g, (ch) =>
        String.fromCharCode(ch.charCodeAt(0) - 0x60)
      );
    };

    let filtered = accessibleArticleContents;

    if (activeCategory !== 'すべて') {
      filtered = filtered.filter((content) => content.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = normalizeText(searchQuery);
      filtered = filtered.filter(
        (content) =>
          normalizeText(content.title).includes(query) ||
          (content.description && normalizeText(content.description).includes(query)) ||
          (content.sub_category && normalizeText(content.sub_category).includes(query))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((content) =>
        selectedTags.some((tag) => content.sub_category === tag || content.category === tag)
      );
    }

    return filtered;
  }, [accessibleArticleContents, activeCategory, searchQuery, selectedTags]);

  // サブカテゴリ別のグループ化
  const groupedBySubCategory = useMemo(() => {
    const grouped: Record<string, typeof filteredContents> = {} as any;
    filteredContents.forEach((content) => {
      const subCategory = content.sub_category || 'その他';
      if (!grouped[subCategory]) grouped[subCategory] = [] as any;
      grouped[subCategory].push(content);
    });
    return grouped;
  }, [filteredContents]);

  // 利用可能なタグの取得
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    accessibleArticleContents.forEach((content) => {
      if (content.sub_category) tags.add(content.sub_category);
    });
    return Array.from(tags).sort();
  }, [accessibleArticleContents]);

  // 初回ロード
  useEffect(() => {
    loadLearningContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 統計ロード
  useEffect(() => {
    if (filteredContents.length > 0) {
      const articleIds = filteredContents.map((content) => content.id);
      loadArticleStats(articleIds);
    }
  }, [filteredContents, loadArticleStats]);

  // HUDハイライトCSS注入
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = highlightStyle;
    document.head.appendChild(styleElement);
    return () => { document.head.removeChild(styleElement); };
  }, []);

  // 操作ハンドラ
  const handleContentSelect = (contentId: string) => {
    setSelectedTab(contentId);
    recordView({ article_id: contentId });
    window.scrollTo(0, 0);
  };
  const handleBackToList = () => setSelectedTab(null);
  const handleCategoryChange = (category: string) => setActiveCategory(category);
  const handleSearch = (query: string) => setSearchQuery(query);
  const handleFilterChange = (filters: string[]) => setSelectedTags(filters);
  const handleCloseCommentsModal = () => {
    setCommentsModalOpen(false);
    setSelectedArticleForComments(null);
  };

  // 最新記事（更新順）
  const latestArticles = filteredContents
    .slice()
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  // URL 同期（カテゴリ / 検索 / タグ）
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    // カテゴリ: 表示名 → キー
    const categoryKey = Object.keys(articleCategoryMapping).find(
      (k) => articleCategoryMapping[k] === activeCategory
    );
    if (activeCategory && activeCategory !== 'すべて' && categoryKey) {
      params.set('category', categoryKey);
    } else {
      params.delete('category');
    }
    if (searchQuery && searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    } else {
      params.delete('q');
    }
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    } else {
      params.delete('tags');
    }
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, searchQuery, selectedTags]);

  if (selectedTab) {
    return (
      <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
        <div className="hud-line" />
        <div className="absolute top-0 left-0 h-full" style={{ width: 1 }}>
          <div className="hud-line" style={{ width: 1, height: '100%' }} />
        </div>
        <div className="absolute top-0 right-0 h-full" style={{ width: 1 }}>
          <div className="hud-line" style={{ width: 1, height: '100%' }} />
        </div>
        <div className="container mx-auto px-4 py-6">
          {true ? (
            <LearningTabMDX
              contentId={selectedTab}
              contentType="articles"
              onBackToList={handleBackToList}
              onContentSelect={handleContentSelect}
            />
          ) : (
            <FreemiumUpgradePrompt contentId={selectedTab!} />
          )}
        </div>
        <div className="hud-line" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* ヘッダー下のHUDライン */}
      <div className="hud-line" />
      {/* 左右のHUDライン */}
      <div className="absolute top-0 left-0 h-full" style={{ width: 1 }}>
        <div className="hud-line" style={{ width: 1, height: '100%' }} />
      </div>
      <div className="absolute top-0 right-0 h-full" style={{ width: 1 }}>
        <div className="hud-line" style={{ width: 1, height: '100%' }} />
      </div>

      <div className="mb-8">
        {categoryFromUrl && articleCategoryMapping[categoryFromUrl] && (
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm hud-text">
              <li>
                <Link to="/articles" className={`hover:underline hud-text`}>📚 記事一覧</Link>
              </li>
              <li className="hud-text">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li className="font-medium hud-text">{articleCategoryMapping[categoryFromUrl]}</li>
            </ol>
          </nav>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 hud-border" />
            <p className="text-sm text-[color:var(--text-muted)]">記事を読み込んでいます...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <ArticleSearch onSearch={handleSearch} onFilterChange={handleFilterChange} availableTags={availableTags} />
          </div>

          <div className="mb-8" role="region" aria-labelledby="tabs-articles">
            <h2 id="tabs-articles" className="sr-only">記事カテゴリ</h2>
            <ArticleTabs categories={['すべて', ...articleCategories]} activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
          </div>

          {latestArticles.length > 0 && (
            <div className={`hud-surface hud-glow rounded-2xl p-6 mb-8 shadow-xl border hud-border transition-all duration-300 hover:shadow-2xl`}>
              <div className="flex items-center mb-6">
                <div className="text-2xl mr-3 hud-text">🆕</div>
                <div>
                  <h2 className={`text-2xl font-bold hud-text`}>最新記事</h2>
                  <p className={`text-sm text-[color:var(--text-muted)]`}>最近更新された記事をチェック</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                {latestArticles.map((content) => (
                  <div
                    key={content.id}
                    onClick={() => handleContentSelect(content.id)}
                    className={`p-4 rounded-xl border hud-border hud-surface transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl transform hover:scale-[1.02] hover:hud-glow group`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold text-sm leading-tight line-clamp-2 hud-text group-hover:text-[color:var(--hud-primary)]`}>{content.title}</h3>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className={`text-xs px-2 py-1 rounded-full border hud-border text-[color:var(--hud-primary)] bg-[color:var(--panel)]`}>{content.sub_category || content.category}</span>
                      <div className="flex flex-col items-end">
                        <span className={`text-xs text-[color:var(--text-muted)]`}>
                          {new Date(content.updated_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-xs">
                      <span className={`text-[color:var(--text-muted)] group-hover:hud-text transition-colors duration-200`}>記事を読む →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(groupedBySubCategory).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedBySubCategory)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([subCategory, articles]) => (
                  <ArticleSection
                    key={subCategory}
                    title={subCategory}
                    articles={articles.sort((a, b) => a.order_index - b.order_index)}
                    onArticleClick={handleContentSelect}
                    stats={stats}
                    highlightQuery={searchQuery}
                  />
                ))}
            </div>
          ) : (
            <div className={`text-center py-12 hud-surface rounded-lg shadow-lg border hud-border`}>
              <div className="text-4xl mb-4 hud-text">📚</div>
              <p className={`text-lg text-[color:var(--text-muted)]`}>
                {searchQuery || selectedTags.length > 0 ? '検索条件に一致する記事が見つかりませんでした' : '記事がありません'}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="hud-line" />

      {selectedArticleForComments && (
        <CommentsModal
          isOpen={commentsModalOpen}
          onClose={handleCloseCommentsModal}
          articleId={selectedArticleForComments?.id ?? ''}
          articleTitle={selectedArticleForComments?.title ?? ''}
          comments={selectedArticleForComments?.id ? comments[selectedArticleForComments.id] || [] : []}
          onSubmitComment={createComment}
          onLoadComments={loadComments}
        />
      )}
    </div>
  );
}

export default ArticlesPage;
