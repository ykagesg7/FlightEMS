import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useFreemiumAccess } from '../hooks/useFreemiumAccess';
import { useArticleStats } from '../hooks/useArticleStats';
import LearningTabMDX from '../components/mdx/LearningTabMDX';
import FreemiumUpgradePrompt from '../components/learning/FreemiumUpgradePrompt';
import { ArticleStatsBar } from '../components/articles/ArticleStatsBar';
import { CommentsModal } from '../components/articles/CommentsModal';
import { useTheme } from '../contexts/ThemeContext';

function ArticlesPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { 
    learningContents, 
    isLoading,
    loadLearningContents
  } = useLearningProgress();
  
  const { 
    displayContents, 
    canAccessContent, 
    freemiumInfo,
    isPreviewMode
  } = useFreemiumAccess();
  
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

  // コンポーネントがマウントされたときのみコンテンツをロード
  useEffect(() => {
    loadLearningContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 記事統計を読み込み
  useEffect(() => {
    if (displayContents.length > 0) {
      const articleIds = displayContents.map(content => content.id);
      loadArticleStats(articleIds);
    }
  }, [displayContents, loadArticleStats]); // useCallbackで最適化済み

  // 記事が選択されたときの処理
  const handleContentSelect = (contentId: string) => {
    setSelectedTab(contentId);
    // 閲覧数を記録
    recordView({ article_id: contentId });
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

  // カテゴリーでグループ化
  const groupedContents: Record<string, any[]> = {};
  displayContents.forEach(content => {
    if (!groupedContents[content.category]) {
      groupedContents[content.category] = [];
    }
    groupedContents[content.category].push(content);
  });
  
  // カテゴリーの順序を保持
  const categories = Object.keys(groupedContents).sort();

  if (selectedTab) {
    return (
          <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
        <div className="container mx-auto px-4 py-6">
          {canAccessContent(selectedTab) ? (
            <LearningTabMDX 
              contentId={selectedTab} 
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
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 py-2">
            📚 学習記事
          </h1>
          <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
            航空知識を深める記事コレクション
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                theme === 'dark' ? 'border-indigo-400' : 'border-indigo-600'
              }`}></div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-slate-600'
              }`}>
                記事を読み込んでいます...
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {categories.length > 0 ? (
              <div className="space-y-8">
                {categories.map(category => (
                  <div key={category} className={`${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } rounded-xl shadow-xl border ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                  } p-6`}>
                    <h2 className={`text-2xl font-bold mb-6 border-b pb-3 ${
                      theme === 'dark' 
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
                              onClick={() => hasAccess && handleContentSelect(content.id)}
                              className={`
                                p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg
                                ${hasAccess
                                  ? theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-indigo-500'
                                    : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                                  : theme === 'dark'
                                    ? 'bg-gray-750 border-gray-600 cursor-not-allowed opacity-60'
                                    : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'}
                              `}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className={`font-semibold text-lg leading-tight ${
                                  hasAccess
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
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap ${
                                      theme === 'dark'
                                        ? 'border border-gray-600 bg-gray-700 text-gray-400'
                                        : 'border border-gray-300 bg-gray-200 text-gray-500'
                                    }`}>
                                      🔒
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {content.description && (
                                <p className={`text-sm leading-relaxed ${
                                  hasAccess
                                    ? theme === 'dark' ? 'text-gray-300' : 'text-slate-600'
                                    : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                  {content.description}
                                </p>
                              )}
                              
                              {hasAccess && (
                                <>
                                  <div className="mt-3 flex items-center text-sm">
                                    <span className={`${
                                      theme === 'dark' ? 'text-indigo-400' : 'text-indigo-700'
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
              <div className={`text-center py-12 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } rounded-lg shadow-lg`}>
                <p className={`text-lg ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
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