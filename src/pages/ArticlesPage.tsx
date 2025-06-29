import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArticleStatsBar } from '../components/articles/ArticleStatsBar';
import { CommentsModal } from '../components/articles/CommentsModal';
import FreemiumUpgradePrompt from '../components/learning/FreemiumUpgradePrompt';
import LearningTabMDX from '../components/mdx/LearningTabMDX';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useArticleStats } from '../hooks/useArticleStats';
import { useFreemiumAccess } from '../hooks/useFreemiumAccess';
import { useLearningProgress } from '../hooks/useLearningProgress';

// ハイライト効果用のスタイル
const highlightStyle = `
  .highlight-article {
    animation: highlight-pulse 2s ease-in-out;
    transform: scale(1.02);
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3) !important;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @keyframes highlight-pulse {
    0% {
      transform: scale(1);
      border-color: inherit;
      box-shadow: inherit;
    }
    50% {
      transform: scale(1.02);
      border-color: #8b5cf6;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
    }
    100% {
      transform: scale(1.02);
      border-color: #8b5cf6;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
    }
  }
`;

// 記事カテゴリマッピング（Articles専用）
const articleCategoryMapping: { [key: string]: string } = {
  'mentality': 'メンタリティー',
  'thinking': '思考法',
  'logical-thinking': '論理的思考',
  'others': 'その他'
};

function ArticlesPage() {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const { theme } = useTheme();
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    learningContents,
    isLoading,
    loadLearningContents
  } = useLearningProgress();

  // Articles専用のコンテンツフィルタリング
  const articleCategories = ['メンタリティー', '思考法'];

  const articleContents = useMemo(() => {
    return learningContents.filter(content =>
      content.is_published &&
      articleCategories.includes(content.category)
    );
  }, [learningContents]);

  const {
    displayContents,
    canAccessContent,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    freemiumInfo,
    isPreviewMode
  } = useFreemiumAccess('articles');

  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedArticleForComments, setSelectedArticleForComments] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // ソーシャル機能のフック
  const {
    stats,
    comments,
    loadArticleStats,
    loadComments,
    toggleLike,
    createComment,
    recordView
  } = useArticleStats();

  // Articles専用コンテンツにFreemiumアクセス制御を適用
  const accessibleArticleContents = useMemo(() => {
    return articleContents.filter(content =>
      displayContents.some(dc => dc.id === content.id)
    );
  }, [articleContents, displayContents]);

  // カテゴリ別フィルタリング
  const filteredContents = useMemo(() => {
    if (!categoryFromUrl || !articleCategoryMapping[categoryFromUrl]) {
      return accessibleArticleContents;
    }

    const selectedCategory = articleCategoryMapping[categoryFromUrl];
    return accessibleArticleContents.filter(content => {
      if (selectedCategory === 'メンタリティー') {
        return content.category?.includes('メンタリティー') ||
          content.category?.includes('自己啓発') ||
          content.id.startsWith('1.') ||
          content.title?.includes('メンタリティー');
      }
      if (selectedCategory === '思考法') {
        return content.category?.includes('思考法') ||
          content.id.startsWith('2.') ||
          content.title?.includes('思考法') ||
          content.title?.includes('論理的');
      }
      if (selectedCategory === '論理的思考') {
        return content.category?.includes('論理') ||
          content.title?.includes('論理') ||
          content.title?.includes('プレゼンテーション');
      }

      return content.category === selectedCategory;
    });
  }, [accessibleArticleContents, categoryFromUrl]);

  // コンポーネントがマウントされたときのみコンテンツをロード
  useEffect(() => {
    loadLearningContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 記事統計を読み込み
  useEffect(() => {
    if (filteredContents.length > 0) {
      const articleIds = filteredContents.map(content => content.id);
      loadArticleStats(articleIds);
    }
  }, [filteredContents, loadArticleStats]); // useCallbackで最適化済み

  // スタイルタグを動的に追加
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = highlightStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // 記事が選択されたときの処理
  const handleContentSelect = (contentId: string) => {
    setSelectedTab(contentId);
    // 閲覧数を記録
    recordView({ article_id: contentId });
    // ページ上部にスクロール
    window.scrollTo(0, 0);
  };

  // 記事一覧に戻る処理
  const handleBackToList = () => {
    setSelectedTab(null);
  };

  // いいねボタンクリック処理
  const handleLikeClick = (articleId: string) => {
    toggleLike({ article_id: articleId });
  };

  // コメントボタンクリック処理
  const handleCommentClick = (articleId: string, articleTitle: string) => {
    setSelectedArticleForComments({ id: articleId, title: articleTitle });
    setCommentsModalOpen(true);
  };

  // コメントモーダルを閉じる
  const handleCloseCommentsModal = () => {
    setCommentsModalOpen(false);
    setSelectedArticleForComments(null);
  };

  // カテゴリーでグループ化（フィルタリング後のコンテンツを使用）
  const groupedContents: Record<string, any[]> = {};
  filteredContents.forEach(content => {
    if (!groupedContents[content.category]) {
      groupedContents[content.category] = [];
    }
    groupedContents[content.category].push(content);
  });

  // カテゴリーの順序を保持
  const categories = Object.keys(groupedContents).sort();

  // 最新記事3つを取得（更新日時順、フィルタリング後のコンテンツから）
  const latestArticles = filteredContents
    .filter(content => canAccessContent(content.id))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  // 記事IDから記事のカテゴリを取得する関数
  const findArticleCategory = (articleId: string) => {
    for (const content of filteredContents) {
      if (content.id === articleId) {
        return content.category;
      }
    }
    return null;
  };

  // 最新記事にジャンプする関数
  const handleJumpToArticle = (articleId: string) => {
    const category = findArticleCategory(articleId);
    if (category) {
      // 対象記事のDOM要素にスクロール
      setTimeout(() => {
        const articleElement = document.getElementById(`article-${articleId}`);
        if (articleElement) {
          articleElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          // 一時的にハイライト効果を追加
          articleElement.classList.add('highlight-article');
          setTimeout(() => {
            articleElement.classList.remove('highlight-article');
          }, 2000);
        }
      }, 100);
    }
  };

  if (selectedTab) {
    return (
      <div className={`min-h-screen ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
        }`}>
        <div className="container mx-auto px-4 py-6">
          {canAccessContent(selectedTab) ? (
            <LearningTabMDX
              contentId={selectedTab}
              contentType="articles"
              onBackToList={handleBackToList}
              onContentSelect={handleContentSelect}
            />
          ) : (
            <FreemiumUpgradePrompt contentId={selectedTab} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark'
      ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-800 text-gray-100'
      : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900'
      }`}>
      <div className="container mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-8">
          {/* パンくずナビゲーション */}
          {categoryFromUrl && articleCategoryMapping[categoryFromUrl] && (
            <nav className="mb-4">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <a
                    href="/articles"
                    className={`hover:underline ${theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
                      }`}
                  >
                    📚 記事一覧
                  </a>
                </li>
                <li className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {articleCategoryMapping[categoryFromUrl]}
                </li>
              </ol>
            </nav>
          )}

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 py-2">
              📚 {categoryFromUrl && articleCategoryMapping[categoryFromUrl]
                ? `${articleCategoryMapping[categoryFromUrl]} 記事`
                : '学習記事'}
            </h1>
            <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
              {categoryFromUrl && articleCategoryMapping[categoryFromUrl]
                ? `${articleCategoryMapping[categoryFromUrl]}に関する記事をご覧いただけます`
                : '航空知識を深める記事コレクション'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === 'dark' ? 'border-indigo-400' : 'border-indigo-600'
                }`}></div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'
                }`}>
                記事を読み込んでいます...
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* 最新記事セクション */}
            {latestArticles.length > 0 && (
              <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900' : 'bg-gradient-to-r from-indigo-100 to-purple-100'
                } rounded-xl shadow-xl border ${theme === 'dark' ? 'border-violet-600/50' : 'border-indigo-200'
                } p-6 mb-8`}>
                <div className="flex items-center mb-6">
                  <div className="text-2xl mr-3">🆕</div>
                  <div>
                    <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-violet-100' : 'text-indigo-800'
                      }`}>
                      最新記事
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-violet-200/80' : 'text-indigo-600'
                      }`}>
                      最近更新された記事をチェック
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                  {latestArticles.map(content => {
                    const updatedDate = new Date(content.updated_at);
                    const daysAgo = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));

                    return (
                      <div
                        key={content.id}
                        onClick={() => handleJumpToArticle(content.id)}
                        className={`
                          p-4 rounded-lg border transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-[1.02]
                          ${theme === 'dark'
                            ? 'bg-gradient-to-br from-violet-800/60 to-purple-800/40 border-violet-500/30 hover:from-violet-700/70 hover:to-purple-700/50 hover:border-violet-400/50'
                            : 'bg-white border-indigo-200 hover:bg-indigo-50'}
                        `}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-semibold text-sm leading-tight line-clamp-2 ${theme === 'dark' ? 'text-violet-100' : 'text-indigo-800'
                            }`}>
                            {content.title}
                          </h3>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${theme === 'dark'
                            ? 'bg-violet-700/60 text-violet-100 border border-violet-500/30'
                            : 'bg-indigo-200 text-indigo-700'
                            }`}>
                            {content.category}
                          </span>

                          <div className="flex flex-col items-end">
                            <span className={`text-xs ${theme === 'dark' ? 'text-violet-200' : 'text-indigo-600'
                              }`}>
                              {daysAgo === 0 ? '今日更新' : daysAgo === 1 ? '昨日更新' : `${daysAgo}日前更新`}
                            </span>
                            <span className={`text-xs opacity-75 ${theme === 'dark' ? 'text-violet-300' : 'text-indigo-500'
                              }`}>
                              {updatedDate.toLocaleDateString('ja-JP', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center text-xs">
                          <span className={`${theme === 'dark' ? 'text-violet-200' : 'text-indigo-600'
                            }`}>
                            記事にジャンプ →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {categories.length > 0 ? (
              <div className="space-y-8">
                {categories.map(category => (
                  <div key={category} className={`${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'
                    } rounded-xl shadow-xl border ${theme === 'dark' ? 'border-slate-700/50' : 'border-blue-200'
                    } p-6`}>
                    <h2 className={`text-2xl font-bold mb-6 border-b pb-3 ${theme === 'dark'
                      ? 'text-gray-100 border-gray-700'
                      : 'text-slate-800 border-gray-200'
                      }`}>
                      {category}
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {groupedContents[category]
                        .sort((a, b) => a.order_index - b.order_index)
                        .map(content => {
                          const hasAccess = canAccessContent(content.id);
                          const isFreemium = false; // フリーミアム判定は一時的に無効化

                          return (
                            <div
                              key={content.id}
                              id={`article-${content.id}`}
                              onClick={() => hasAccess && handleContentSelect(content.id)}
                              className={`
                                p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg
                                ${hasAccess
                                  ? theme === 'dark'
                                    ? 'bg-gradient-to-br from-slate-800 to-gray-800 border-slate-600/40 hover:from-slate-700 hover:to-gray-700 hover:border-purple-500/50'
                                    : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                                  : theme === 'dark'
                                    ? 'bg-gradient-to-br from-slate-800/60 to-gray-800/60 border-slate-600/30 cursor-not-allowed opacity-60'
                                    : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'}
                              `}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className={`font-semibold text-lg leading-tight ${hasAccess
                                  ? theme === 'dark' ? 'text-gray-100' : 'text-slate-800'
                                  : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                  {content.title}
                                </h3>

                                <div className="flex items-center space-x-1 ml-2">
                                  {/* フリーミアムバッジ */}
                                  {isPreviewMode && isFreemium && (
                                    <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap">
                                      Free
                                    </span>
                                  )}
                                  {isPreviewMode && !hasAccess && !isFreemium && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap ${theme === 'dark'
                                      ? 'border border-gray-600 bg-gray-700 text-gray-400'
                                      : 'border border-gray-300 bg-gray-200 text-gray-500'
                                      }`}>
                                      🔒
                                    </span>
                                  )}
                                </div>
                              </div>

                              {content.description && (
                                <p className={`text-sm leading-relaxed ${hasAccess
                                  ? theme === 'dark' ? 'text-gray-300' : 'text-slate-600'
                                  : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                  }`}>
                                  {content.description}
                                </p>
                              )}

                              {hasAccess && (
                                <>
                                  <div className="mt-3 flex items-center text-sm">
                                    <span className={`${theme === 'dark' ? 'text-purple-300' : 'text-indigo-700'
                                      }`}>
                                      記事を読む →
                                    </span>
                                  </div>

                                  {/* ソーシャル機能 */}
                                  {stats[content.id] && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                      <ArticleStatsBar
                                        stats={stats[content.id]}
                                        onLikeClick={() => handleLikeClick(content.id)}
                                        onCommentClick={() => handleCommentClick(content.id, content.title)}
                                        compact={true}
                                      />
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } rounded-lg shadow-lg`}>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  記事がありません
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* コメントモーダル */}
      {selectedArticleForComments && (
        <CommentsModal
          isOpen={commentsModalOpen}
          onClose={handleCloseCommentsModal}
          articleId={selectedArticleForComments.id}
          articleTitle={selectedArticleForComments.title}
          comments={comments[selectedArticleForComments.id] || []}
          onSubmitComment={createComment}
          onLoadComments={loadComments}
        />
      )}
    </div>
  );
}

export default ArticlesPage;
