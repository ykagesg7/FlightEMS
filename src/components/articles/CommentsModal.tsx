import React, { useState, useEffect } from 'react';
import { ArticleComment, CreateCommentRequest } from '../../types/articles';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  articleTitle: string;
  comments: ArticleComment[];
  onSubmitComment: (request: CreateCommentRequest) => void;
  onLoadComments: (articleId: string) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  articleId,
  articleTitle,
  comments,
  onSubmitComment,
  onLoadComments
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      onLoadComments(articleId);
    }
  }, [isOpen, articleId, onLoadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmitComment({
        article_id: articleId,
        content: newComment.trim()
      });
      setNewComment('');
    } catch (error) {
      console.error('コメント投稿エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* モーダル */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-2xl rounded-xl shadow-2xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* ヘッダー */}
          <div className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div>
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                コメント
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {articleTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* コメント一覧 */}
          <div className="max-h-96 overflow-y-auto p-6">
            {comments.length === 0 ? (
              <div className={`text-center py-8 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>まだコメントがありません</p>
                <p className="text-sm mt-1">最初のコメントを投稿してみましょう！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {/* アバター */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        {comment.user?.display_name?.charAt(0) || 'U'}
                      </div>

                      {/* コメント内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`font-medium text-sm ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {comment.user?.display_name || 'ユーザー'}
                          </span>
                          <span className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* コメント投稿フォーム */}
          {user ? (
            <div className={`p-6 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="コメントを入力してください..."
                  rows={3}
                  className={`w-full p-3 rounded-lg border resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {newComment.length}/500文字
                  </span>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting || newComment.length > 500}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      !newComment.trim() || isSubmitting || newComment.length > 500
                        ? theme === 'dark'
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isSubmitting ? '投稿中...' : 'コメント投稿'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className={`p-6 border-t text-center ${
              theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
            }`}>
              <p>コメントを投稿するにはログインが必要です</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
