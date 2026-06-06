import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MDXLoader from '../../components/mdx/MDXLoader';
import { isWithdrawnArticle, WITHDRAWN_ARTICLE_MESSAGE } from '../../constants/withdrawnArticleIds';
import { useArticleStats } from '../../hooks/useArticleStats';
import { useAuth } from '../../hooks/useAuth';
import { ArticleMeta } from '../../types/articles';
import { buildArticleIndex } from '../../utils/articlesIndex';
import { getMetaForArticle } from './articleHubFilters';
import { CommentSection } from './components/CommentSection';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { PrevNextNav } from './components/PrevNextNav';
import { ReadingProgressBar } from './components/ReadingProgressBar';
import { RelatedTestsBlock } from './components/RelatedTestsBlock';
import { ScrollToButtons } from './components/ScrollToButtons';
import { SeriesNextChapterCta } from './components/SeriesNextChapterCta';
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
    deleteComment,
  } = useArticleStats();

  const [articleMetas, setArticleMetas] = useState<Record<string, ArticleMeta>>({});
  const [isLoadingMetas, setIsLoadingMetas] = useState(true);

  useEffect(() => {
    const loadArticleMetas = async () => {
      try {
        const index = await buildArticleIndex();
        const metaMap: Record<string, ArticleMeta> = {};
        index.forEach((entry) => {
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

  const resolvedCurrentMeta = contentId ? articleMetas[contentId] : undefined;

  const nextMeta = useMemo(
    () => (next ? getMetaForArticle(next, articleMetas) : undefined),
    [next, articleMetas]
  );

  useEffect(() => {
    if (!contentId || isWithdrawnArticle(contentId)) return;
    loadArticleStats([contentId]);
    loadComments(contentId);
  }, [contentId, loadArticleStats, loadComments]);

  const handleLoadComments = useCallback(async () => {
    if (!contentId) return;
    await loadComments(contentId);
  }, [loadComments, contentId]);

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!contentId) return;
      await createComment({ article_id: contentId, content });
    },
    [createComment, contentId]
  );

  const handleEditComment = useCallback(
    async (commentId: string, content: string) => {
      if (!contentId) return;
      await updateComment({ comment_id: commentId, article_id: contentId, content });
    },
    [updateComment, contentId]
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!contentId) return;
      await deleteComment({ comment_id: commentId, article_id: contentId });
    },
    [deleteComment, contentId]
  );

  if (!contentId) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500">コンテンツIDが指定されていません。</p>
        <Link to="/articles" className="underline">
          記事一覧へ戻る
        </Link>
      </div>
    );
  }

  const articleComments = comments[contentId] || [];
  const withdrawn = isWithdrawnArticle(contentId);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Link to="/articles" className="text-sm text-brand-primary underline">
            ← 記事一覧へ
          </Link>
        </div>
        {withdrawn ? (
          <div
            className="rounded-lg border border-brand-primary/30 bg-brand-secondary-dark px-4 py-6 text-[color:var(--text-primary)]"
            role="status"
          >
            <p className="text-base leading-relaxed">{WITHDRAWN_ARTICLE_MESSAGE}</p>
          </div>
        ) : isLoadingMetas ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-brand-primary" />
          </div>
        ) : (
          <>
            <ReadingProgressBar contentId={contentId} />
            <MDXLoader contentId={contentId} />
            <RelatedTestsBlock contentId={contentId} />
          </>
        )}

        {!withdrawn && (
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
        )}

        {!withdrawn && (
          <SeriesNextChapterCta
            next={next}
            nextMeta={nextMeta}
            currentMeta={resolvedCurrentMeta}
          />
        )}

        <PrevNextNav currentId={contentId} listPath="/articles" />
      </div>
      <ScrollToButtons />
      <KeyboardShortcuts prevId={prev?.id} nextId={next?.id} />
    </div>
  );
};

export default ArticleDetailPage;
