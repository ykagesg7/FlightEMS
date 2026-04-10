import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MDXLoader from '../../components/mdx/MDXLoader';
import { useArticleStats } from '../../hooks/useArticleStats';
import { useAuth } from '../../hooks/useAuth';
import { useSeriesUnlock } from '../../hooks/useSeriesUnlock';
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

  // 記事メタデータの読み込み
  const [articleMetas, setArticleMetas] = useState<Record<string, ArticleMeta>>({});
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

  // シリーズアンロック機能
  const allContentIds = useMemo(() => Object.keys(articleMetas), [articleMetas]);
  const seriesUnlock = useSeriesUnlock(articleMetas, allContentIds);

  // All hooks must be called before any early return (rules-of-hooks)
  const { prev, next } = usePrevNext(contentId ?? '');

  // 記事の統計情報とコメントを読み込む
  useEffect(() => {
    if (!contentId) return;
    loadArticleStats([contentId]);
    loadComments(contentId);
  }, [contentId, loadArticleStats, loadComments]);

  // コメント操作のハンドラー
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

  // ロック状態をチェック
  const isLocked = !seriesUnlock.isUnlocked(contentId);
  const lockedReason = seriesUnlock.getLockedReason(contentId);
  const previousArticleId = seriesUnlock.getPreviousArticleInSeries(contentId);
  const previousMeta = previousArticleId ? articleMetas[previousArticleId] : null;

  // ロックされている場合はCTAを表示
  if (isLocked && !isLoadingMetas) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="mb-4">
            <Link to="/articles" className="text-sm text-[color:var(--hud-primary)] underline">← 記事一覧へ</Link>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🔒</span>
                <h2 className="text-xl font-bold text-red-800 dark:text-red-300">
                  この記事はロックされています
                </h2>
              </div>
              <p className="text-red-700 dark:text-red-300 mb-4">
                {lockedReason || 'この記事を読むには、前の記事を読了する必要があります。'}
              </p>
            </div>

            {previousArticleId && previousMeta && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  先に読むべき記事
                </h3>
                <Link
                  to={`/articles/${previousArticleId}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {previousMeta.title} →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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


