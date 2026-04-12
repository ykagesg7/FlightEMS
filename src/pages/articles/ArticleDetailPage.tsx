import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MDXLoader from '../../components/mdx/MDXLoader';
import { useArticleStats } from '../../hooks/useArticleStats';
import { useAuth } from '../../hooks/useAuth';
import { ArticleMeta } from '../../types/articles';
import { buildArticleIndex } from '../../utils/articlesIndex';
import { CommentSection } from './components/CommentSection';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { PrevNextNav } from './components/PrevNextNav';
import { RelatedTestsBlock } from './components/RelatedTestsBlock';
import { ScrollToButtons } from './components/ScrollToButtons';
import { usePrevNext } from './components/usePrevNext';

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

  const [, setArticleMetas] = useState<Record<string, ArticleMeta>>({});
  const [isLoadingMetas, setIsLoadingMetas] = useState(true);

  useEffect(() => {
    const loadArticleMetas = async () => {
      try {
        const index = await buildArticleIndex();
        const metaMap: Record<string, ArticleMeta> = {};
        index.forEach(entry => {
          metaMap[entry.filename] = entry.meta;
        });
        setArticleMetas(metaMap);
      } catch (error) {
        console.error('記事メタデータの読み込みエラー:', error);
      } finally {
        setIsLoadingMetas(false);
      }
    };

    loadArticleMetas();
  }, []);

  const { prev, next } = usePrevNext(contentId ?? '');

  useEffect(() => {
    if (!contentId) return;
    loadArticleStats([contentId]);
    loadComments(contentId);
  }, [contentId, loadArticleStats, loadComments]);

  const handleLoadComments = useCallback(async () => {
    if (!contentId) return;
    await loadComments(contentId);
  }, [loadComments, contentId]);

  const handleAddComment = useCallback(async (content: string) => {
    if (!contentId) return;
    await createComment({ article_id: contentId, content });
  }, [createComment, contentId]);

  const handleEditComment = useCallback(async (commentId: string, content: string) => {
    if (!contentId) return;
    await updateComment({ comment_id: commentId, article_id: contentId, content });
  }, [updateComment, contentId]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!contentId) return;
    await deleteComment({ comment_id: commentId, article_id: contentId });
  }, [deleteComment, contentId]);

  if (!contentId) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">コンテンツIDが指定されていません。</p>
        <Link to="/articles" className="underline">記事一覧へ戻る</Link>
      </div>
    );
  }

  const articleComments = comments[contentId] || [];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Link to="/articles" className="text-sm text-[color:var(--hud-primary)] underline">← 記事一覧へ</Link>
        </div>
        {isLoadingMetas ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <MDXLoader contentId={contentId} />
            <RelatedTestsBlock contentId={contentId} />
          </>
        )}

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

        <PrevNextNav currentId={contentId} listPath="/articles" />
      </div>
      <ScrollToButtons />
      <KeyboardShortcuts prevId={prev?.id} nextId={next?.id} />
    </div>
  );
};

export default ArticleDetailPage;
