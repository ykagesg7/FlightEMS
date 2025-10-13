import React, { useCallback, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CommentSection } from '../components/articles/CommentSection';
import { KeyboardShortcuts } from '../components/articles/KeyboardShortcuts';
import { PrevNextNav } from '../components/articles/PrevNextNav';
import { ReadingProgressBar } from '../components/articles/ReadingProgressBar';
import { ScrollToButtons } from '../components/articles/ScrollToButtons';
import { usePrevNext } from '../components/articles/usePrevNext';
import MDXLoader from '../components/mdx/MDXLoader';
import { useArticleStats } from '../hooks/useArticleStats';
import { useAuth } from '../hooks/useAuth';

const ArticleDetailPage: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const { user } = useAuth();
  const {
    comments,
    isLoading,
    loadArticleStats,
    loadComments,
    createComment,
    updateComment,
    deleteComment
  } = useArticleStats();

  if (!contentId) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">コンテンツIDが指定されていません。</p>
        <Link to="/articles" className="underline">記事一覧へ戻る</Link>
      </div>
    );
  }

  const { prev, next } = usePrevNext(contentId);
  const articleComments = comments[contentId] || [];

  // 記事の統計情報とコメントを読み込む
  useEffect(() => {
    loadArticleStats([contentId]);
    loadComments(contentId);
  }, [contentId, loadArticleStats, loadComments]);

  // コメント操作のハンドラー
  const handleLoadComments = useCallback(async () => {
    await loadComments(contentId);
  }, [loadComments, contentId]);

  const handleAddComment = useCallback(async (content: string) => {
    await createComment({ article_id: contentId, content });
  }, [createComment, contentId]);

  const handleEditComment = useCallback(async (commentId: string, content: string) => {
    await updateComment({ comment_id: commentId, article_id: contentId, content });
  }, [updateComment, contentId]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    await deleteComment({ comment_id: commentId, article_id: contentId });
  }, [deleteComment, contentId]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* 読了時間表示と進捗管理（プログレスバーは非表示） */}
      <ReadingProgressBar contentId={contentId} />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Link to="/articles" className="text-sm text-[color:var(--hud-primary)] underline">← 記事一覧へ</Link>
        </div>
        <MDXLoader contentId={contentId} />
        
        {/* コメントセクション */}
        <CommentSection
          articleId={contentId}
          comments={articleComments}
          isLoading={isLoading}
          currentUserId={user?.id}
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
          onLoadComments={handleLoadComments}
        />
        
        {/* 前後の記事へのナビゲーション（コメントの下に配置） */}
        <PrevNextNav currentId={contentId} listPath="/articles" />
      </div>
      <ScrollToButtons />
      <KeyboardShortcuts prevId={prev?.id} nextId={next?.id} />
    </div>
  );
};

export default ArticleDetailPage;


