import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MDXLoader from '../../components/mdx/MDXLoader';
import { isWithdrawnArticle, WITHDRAWN_ARTICLE_MESSAGE } from '../../constants/withdrawnArticleIds';
import { useArticleStats } from '../../hooks/useArticleStats';
import { useAuth } from '../../hooks/useAuth';
import { ArticleMeta } from '../../types/articles';
import { isArticleReleased } from '../../utils/articlePublishGate';
import { buildArticleIndex, findArticleByRouteParam } from '../../utils/articlesIndex';
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
  const navigate = useNavigate();
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
  /** Filename id after resolving pretty email/marketing slugs. */
  const [canonicalId, setCanonicalId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadArticleMetas = async () => {
      if (!contentId) {
        setIsLoadingMetas(false);
        return;
      }
      setIsLoadingMetas(true);
      setCanonicalId(null);
      try {
        const index = await buildArticleIndex();
        if (cancelled) return;
        const metaMap: Record<string, ArticleMeta> = {};
        index.forEach((entry) => {
          metaMap[entry.filename] = entry.meta;
        });
        setArticleMetas(metaMap);

        const matched = await findArticleByRouteParam(contentId);
        if (cancelled) return;
        if (matched && matched.filename !== contentId) {
          // Resolve immediately so content loads even if URL rewrite is delayed.
          setCanonicalId(matched.filename);
          navigate(`/articles/${matched.filename}`, { replace: true });
          return;
        }
        setCanonicalId(matched?.filename ?? contentId);
      } catch (error) {
        console.error('記事メタデータの読み込みエラー:', error);
        if (!cancelled) setCanonicalId(contentId);
      } finally {
        if (!cancelled) setIsLoadingMetas(false);
      }
    };

    loadArticleMetas();
    return () => {
      cancelled = true;
    };
  }, [contentId, navigate]);

  const articleId = canonicalId ?? contentId ?? '';

  const { prev, next } = usePrevNext(articleId);

  const resolvedCurrentMeta = articleId ? articleMetas[articleId] : undefined;

  const nextMeta = useMemo(
    () => (next ? getMetaForArticle(next, articleMetas) : undefined),
    [next, articleMetas]
  );

  useEffect(() => {
    if (!articleId || isWithdrawnArticle(articleId)) return;
    loadArticleStats([articleId]);
    loadComments(articleId);
  }, [articleId, loadArticleStats, loadComments]);

  const handleLoadComments = useCallback(async () => {
    if (!articleId) return;
    await loadComments(articleId);
  }, [loadComments, articleId]);

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!articleId) return;
      await createComment({ article_id: articleId, content });
    },
    [createComment, articleId]
  );

  const handleEditComment = useCallback(
    async (commentId: string, content: string) => {
      if (!articleId) return;
      await updateComment({ comment_id: commentId, article_id: articleId, content });
    },
    [updateComment, articleId]
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!articleId) return;
      await deleteComment({ comment_id: commentId, article_id: articleId });
    },
    [deleteComment, articleId]
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

  const articleComments = comments[articleId] || [];
  const withdrawn = isWithdrawnArticle(articleId);
  const notYetReleased =
    !withdrawn &&
    !isLoadingMetas &&
    Boolean(resolvedCurrentMeta?.publishedAt) &&
    !isArticleReleased(resolvedCurrentMeta?.publishedAt);

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
        ) : isLoadingMetas || !canonicalId ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-brand-primary" />
          </div>
        ) : notYetReleased ? (
          <div
            className="rounded-lg border border-brand-primary/30 bg-brand-secondary-dark px-4 py-6 text-[color:var(--text-primary)]"
            role="status"
          >
            <p className="text-base leading-relaxed">
              この記事はまだ公開前です（公開予定: {resolvedCurrentMeta?.publishedAt?.slice(0, 10)}）。
            </p>
            <Link to="/articles" className="mt-3 inline-block text-sm text-brand-primary underline">
              記事一覧へ戻る
            </Link>
          </div>
        ) : (
          <>
            <ReadingProgressBar contentId={articleId} />
            <MDXLoader contentId={articleId} />
            <RelatedTestsBlock contentId={articleId} />
          </>
        )}

        {!withdrawn && !notYetReleased && canonicalId && (
          <CommentSection
            articleId={articleId}
            comments={articleComments}
            isLoading={isLoading}
            currentUserId={user?.id}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onLoadComments={handleLoadComments}
          />
        )}

        {!withdrawn && !notYetReleased && canonicalId && (
          <SeriesNextChapterCta
            next={next}
            nextMeta={nextMeta}
            currentMeta={resolvedCurrentMeta}
          />
        )}

        <PrevNextNav currentId={articleId} listPath="/articles" />
      </div>
      <ScrollToButtons />
      <KeyboardShortcuts prevId={prev?.id} nextId={next?.id} />
    </div>
  );
};

export default ArticleDetailPage;
