import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArticleComment } from '../../../types/articles';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  articleId: string;
  comments: ArticleComment[];
  isLoading: boolean;
  currentUserId?: string;
  onAddComment: (content: string) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLoadComments: () => Promise<void>;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  articleId: _articleId,
  comments,
  isLoading,
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLoadComments
}) => {
  const navigate = useNavigate();

  // コメントを読み込む
  useEffect(() => {
    onLoadComments();
  }, [onLoadComments]);

  return (
    <details className="mt-12 rounded-xl border border-hud-green/30 bg-brand-secondary-dark p-6">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-2xl font-bold text-[color:var(--text-primary)]">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        コメント
        <span className="rounded-full bg-hud-green/20 px-2 py-1 text-sm text-hud-green">
          {comments.length}
        </span>
      </summary>
      <div className="mt-6">

      {/* ログインユーザー向けのコメント投稿フォーム */}
      {currentUserId ? (
        <div className="mb-6">
          <CommentForm
            onSubmit={onAddComment}
            placeholder="コメントを入力してください..."
            submitButtonText="投稿"
          />
        </div>
      ) : (
        /* ゲストユーザー向けのログイン誘導メッセージ */
        <div className="mb-6 rounded-lg border-2 border-dashed border-hud-green/30 bg-hud-green/5 p-4 text-center">
          <p className="mb-3 text-[color:var(--text-primary)]">
            コメントを投稿するにはログインが必要です。
          </p>
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="rounded-lg bg-hud-green px-6 py-2 font-bold text-[var(--bg)] hover:opacity-90"
          >
            ログイン / 新規登録
          </button>
        </div>
      )}

      {/* ローディング状態 */}
      {isLoading && comments.length === 0 && (
        <div className="flex justify-center py-8">
          <div
            className="h-8 w-8 animate-spin rounded-full border-b-2 border-hud-green"
          />
        </div>
      )}

      {/* コメント一覧 */}
      {!isLoading && comments.length === 0 ? (
        <div
          className="text-center py-12 text-gray-500"
        >
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-lg font-medium">まだコメントがありません</p>
          <p className="text-sm mt-2">最初のコメントを投稿してみましょう。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOwner={currentUserId === comment.user_id}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
            />
          ))}
        </div>
      )}
      </div>
    </details>
  );
};

