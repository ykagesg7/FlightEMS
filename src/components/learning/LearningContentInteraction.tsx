import React, { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useArticleStats } from '../../hooks/useArticleStats';

interface LearningContentInteractionProps {
  contentId: string;
}

const LearningContentInteraction: React.FC<LearningContentInteractionProps> = ({ contentId }) => {
  const user = useAuthStore(state => state.user);

  // 新しいuseArticleStatsフックを使用
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

  // コンポーネントマウント時に統計とコメントを読み込み
  useEffect(() => {
    loadArticleStats([contentId]);
    loadComments(contentId);
    // 閲覧数を記録
    recordView({ article_id: contentId });
  }, [contentId, loadArticleStats, loadComments, recordView]);

  // 現在の記事の統計を取得
  const articleStats = stats[contentId];
  const articleComments = comments[contentId] || [];

  // いいねボタンクリック処理
  const handleLikeClick = () => {
    toggleLike({ article_id: contentId });
  };

  // コメント投稿処理
  const handleCommentSubmit = (content: string) => {
    if (content.trim()) {
      createComment({
        article_id: contentId,
        content: content.trim()
      });
    }
  };

  if (isLoading || !articleStats) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 rounded-lg border bg-gray-50 border-gray-200">
      {/* いいねセクション */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleLikeClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            articleStats.user_liked
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title={articleStats.user_liked ? 'いいねを取り消す' : 'いいね（ログイン不要）'}
        >
          <span className="text-lg">{articleStats.user_liked ? '❤️' : '🤍'}</span>
          <span>{articleStats.likes_count}</span>
        </button>

        {/* 閲覧数表示 */}
        <div className="flex items-center gap-2 text-gray-500">
          <span>👁️</span>
          <span>{articleStats.views_count} 回閲覧</span>
        </div>

        {!user && (
          <span className="text-sm text-gray-500">
            いいねはログイン不要！コメントはログインが必要です。
          </span>
        )}
      </div>

      {/* コメント投稿フォーム（ログインユーザーのみ） */}
      {user && (
        <CommentForm
          onSubmit={handleCommentSubmit}
        />
      )}

      {/* コメント一覧 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          コメント ({articleStats.comments_count})
        </h3>

        {articleComments.length === 0 ? (
          <p className="text-center py-4 text-gray-500">
            まだコメントがありません。{user ? '最初のコメントを投稿してみましょう！' : 'ログインしてコメントを投稿してみましょう！'}
          </p>
        ) : (
          <div className="space-y-4">
            {articleComments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-lg bg-white border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">
                    {comment.user?.display_name || 'ユーザー'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// コメント投稿フォームコンポーネント
interface CommentFormProps {
  onSubmit: (content: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
  const [newComment, setNewComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(newComment.trim());
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6">
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="コメントを入力してください..."
        className="w-full p-3 rounded-lg border resize-none bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        rows={3}
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSubmit}
          disabled={!newComment.trim() || isSubmitting}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !newComment.trim() || isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
          }`}
          title={!newComment.trim() ? 'コメントを入力してください' : isSubmitting ? '投稿中...' : 'コメントを投稿'}
        >
          {isSubmitting ? '投稿中...' : 'コメント投稿'}
        </button>
      </div>
    </div>
  );
};

export default LearningContentInteraction;
