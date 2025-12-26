import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArticleComment } from '../../types/articles';
import { CommentForm } from './CommentForm';

interface CommentItemProps {
  comment: ArticleComment;
  isOwner: boolean;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isOwner,
  onEdit,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;

    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEdit = async (content: string) => {
    await onEdit(comment.id, content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(comment.id);
    setShowDeleteConfirm(false);
  };

  const isEdited = comment.updated_at !== comment.created_at;

  return (
    <div
      className="p-4 rounded-lg transition-all bg-white/5 border border-[#39FF14]/20 backdrop-blur-sm"
    >
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {/* アバター画像 */}
          {comment.user.avatar_url ? (
            <img
              src={comment.user.avatar_url}
              alt={comment.user.display_name}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                // 画像読み込みエラー時はデフォルトアバターに置き換え
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${comment.user.avatar_url ? 'hidden' : ''} bg-[#39FF14] text-[#0b1d3a]`}
          >
            {comment.user.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div
                className="font-medium text-[color:var(--text-primary)]"
              >
                {comment.user.display_name}
              </div>
              {/* 名無しさんの場合、プロフィール設定を促す */}
              {isOwner && comment.user.display_name === '名無しさん' && (
                <Link
                  to="/account?tab=profile"
                  className="text-xs px-2 py-0.5 rounded-full transition-all bg-[#39FF14]/20 text-[#39FF14] hover:bg-[#39FF14]/30"
                  title="プロフィールでユーザー名を設定"
                >
                  設定する
                </Link>
              )}
            </div>
            <div
              className="text-xs text-gray-500"
            >
              {formatDate(comment.created_at)}
              {isEdited && ' (編集済み)'}
            </div>
          </div>
        </div>

        {/* アクションボタン（自分のコメントの場合のみ） */}
        {isOwner && !isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg transition-all text-gray-500 hover:bg-white/10 hover:text-[color:var(--text-primary)]"
              aria-label="編集"
              title="編集"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg transition-all text-gray-500 hover:bg-red-500/20 hover:text-red-600"
              aria-label="削除"
              title="削除"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* コンテンツ */}
      {isEditing ? (
        <CommentForm
          onSubmit={handleEdit}
          onCancel={() => setIsEditing(false)}
          initialValue={comment.content}
          placeholder="コメントを編集..."
          submitButtonText="更新"
        />
      ) : (
        <div
          className="whitespace-pre-wrap break-words text-[color:var(--text-primary)]"
        >
          {comment.content}
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="max-w-md w-full p-6 rounded-xl shadow-2xl bg-[#0b1d3a] border border-[#39FF14]/30"
          >
            <h3
              className="text-lg font-bold mb-4 text-[color:var(--text-primary)]"
            >
              コメントを削除しますか？
            </h3>
            <p
              className="mb-6 text-gray-400"
            >
              この操作は取り消せません。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg font-medium transition-all bg-white/10 text-[color:var(--text-primary)] hover:bg-white/20 border border-[#39FF14]/30"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg font-medium transition-all bg-red-600 text-white hover:bg-red-500 hover:shadow-lg"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

