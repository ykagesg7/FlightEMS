import React, { useEffect, useState } from 'react';
import { useArticleStats } from '../hooks/useArticleStats';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const ArticleStatsTestPage: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const {
    stats,
    comments,
    isLoading,
    loadArticleStats,
    loadComments,
    toggleLike,
    createComment,
    recordView
  } = useArticleStats();

  const [testComment, setTestComment] = useState('');
  const [selectedArticle, setSelectedArticle] = useState('test-article-1');

  // テスト用記事ID
  const testArticleIds = [
    'test-article-1',
    'test-article-2', 
    'test-article-3'
  ];

  useEffect(() => {
    // 統計を読み込み
    loadArticleStats(testArticleIds);
  }, [loadArticleStats]);

  const handleLoadComments = (articleId: string) => {
    loadComments(articleId);
  };

  const handleToggleLike = (articleId: string) => {
    toggleLike({ article_id: articleId });
  };

  const handleCreateComment = (articleId: string) => {
    if (testComment.trim()) {
      createComment({
        article_id: articleId,
        content: testComment.trim()
      });
      setTestComment('');
    }
  };

  const handleRecordView = (articleId: string) => {
    recordView({ article_id: articleId });
  };

  return (
    <div className={`min-h-screen p-8 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">記事統計テストページ</h1>
        
        <div className={`border px-4 py-3 rounded mb-6 ${
          user 
            ? 'bg-green-100 border-green-400 text-green-700'
            : 'bg-blue-100 border-blue-400 text-blue-700'
        }`}>
          {user ? (
            <>
              ✅ ログイン中: {user.email}<br/>
              📝 いいね・閲覧数・コメント機能が利用可能です
            </>
          ) : (
            <>
              👤 匿名ユーザー<br/>
              📝 いいね・閲覧数は利用可能、コメントはログインが必要です
            </>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">統計を読み込み中...</p>
          </div>
        )}

        <div className="space-y-6">
          {testArticleIds.map(articleId => {
            const articleStats = stats[articleId];
            const articleComments = comments[articleId] || [];

            return (
              <div key={articleId} className={`p-6 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <h2 className="text-xl font-semibold mb-4">
                  テスト記事: {articleId}
                </h2>

                {articleStats ? (
                  <div className="space-y-4">
                    {/* 統計表示 */}
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleLike(articleId)}
                          className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
                            articleStats.user_liked
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title="いいね（ログイン不要）"
                        >
                          <span>{articleStats.user_liked ? '❤️' : '🤍'}</span>
                          <span>{articleStats.likes_count}</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span>💬</span>
                        <span>{articleStats.comments_count}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span>👁️</span>
                        <span>{articleStats.views_count}</span>
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleLoadComments(articleId)}
                        className={`px-4 py-2 rounded transition-colors ${
                          theme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        コメント読み込み
                      </button>

                      <button
                        onClick={() => handleRecordView(articleId)}
                        className={`px-4 py-2 rounded transition-colors ${
                          theme === 'dark'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                        title="閲覧記録（ログイン不要）"
                      >
                        閲覧記録
                      </button>
                    </div>

                    {/* コメント投稿 */}
                    {user && (
                      <div className="space-y-2">
                        <textarea
                          value={selectedArticle === articleId ? testComment : ''}
                          onChange={(e) => {
                            setSelectedArticle(articleId);
                            setTestComment(e.target.value);
                          }}
                          placeholder="コメントを入力..."
                          className={`w-full p-3 border rounded-lg resize-none ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          rows={3}
                        />
                        <button
                          onClick={() => handleCreateComment(articleId)}
                          disabled={!testComment.trim() || selectedArticle !== articleId}
                          className={`px-4 py-2 rounded transition-colors ${
                            theme === 'dark'
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-purple-500 hover:bg-purple-600 text-white'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          コメント投稿
                        </button>
                      </div>
                    )}

                    {/* コメント一覧 */}
                    {articleComments.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold">コメント一覧:</h3>
                        {articleComments.map(comment => (
                          <div key={comment.id} className={`p-3 rounded border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600'
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">
                                {comment.user?.display_name || 'ユーザー'}
                              </span>
                              <span className="text-sm opacity-70">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p>{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">統計を読み込み中...</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="font-semibold mb-2">テスト手順:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li><strong>匿名ユーザーテスト:</strong> ログアウト状態でいいね・閲覧記録をテスト</li>
            <li><strong>いいね機能:</strong> ログイン不要でいいねボタンをクリック（ローカルストレージに保存）</li>
            <li><strong>閲覧記録:</strong> ログイン不要で閲覧記録ボタンをクリック（重複防止機能付き）</li>
            <li><strong>ログインユーザーテスト:</strong> ログイン後、全機能をテスト</li>
            <li><strong>コメント機能:</strong> ログイン必須でコメント投稿をテスト</li>
            <li><strong>データ永続化:</strong> ページリロード後も統計が保持されることを確認</li>
            <li><strong>セッション管理:</strong> ブラウザを閉じて再度開いても匿名いいねが保持されることを確認</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ArticleStatsTestPage; 