import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createBrowserSupabaseClient } from '../utils/supabase';
import { 
  getSessionId, 
  getAnonymousUserInfo, 
  getLocalLikeState, 
  setLocalLikeState,
  getLocalViewState,
  setLocalViewState
} from '../utils/sessionUtils';
import { 
  ArticleStats, 
  ArticleComment, 
  CreateCommentRequest, 
  ToggleLikeRequest,
  RecordViewRequest 
} from '../types/articles';

export function useArticleStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, ArticleStats>>({});
  const [comments, setComments] = useState<Record<string, ArticleComment[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadedArticleIds, setLoadedArticleIds] = useState<string[]>([]);

  const supabase = createBrowserSupabaseClient();

  // 記事統計を取得
  const loadArticleStats = useCallback(async (articleIds: string[]) => {
    const newArticleIds = articleIds.filter(id => !stats[id]);
    if (newArticleIds.length === 0) return;

    setIsLoading(true);
    try {
      const articleStats: Record<string, ArticleStats> = { ...stats };
      
      // 各記事の統計を初期化
      newArticleIds.forEach(id => {
        articleStats[id] = {
          article_id: id,
          likes_count: 0,
          comments_count: 0,
          views_count: 0,
          user_liked: false
        };
      });

      // 統計ビューから一括取得
      const { data: statsData, error: statsError } = await supabase
        .from('learning_content_stats')
        .select('*')
        .in('content_id', newArticleIds);

      if (statsError) {
        console.error('統計取得エラー:', statsError);
      } else if (statsData) {
        statsData.forEach(stat => {
          if (articleStats[stat.content_id]) {
            articleStats[stat.content_id].likes_count = stat.likes_count || 0;
            articleStats[stat.content_id].comments_count = stat.comments_count || 0;
            articleStats[stat.content_id].views_count = stat.views_count || 0;
          }
        });
      }

      // ユーザーのいいね状態を取得
      if (user) {
        // ログインユーザーの場合：データベースから取得
        const { data: userLikesData, error: userLikesError } = await supabase
          .from('learning_content_likes')
          .select('content_id')
          .in('content_id', newArticleIds)
          .eq('user_id', user.id);

        if (userLikesError) {
          console.error('ユーザーいいね状態取得エラー:', userLikesError);
        } else if (userLikesData) {
          userLikesData.forEach(like => {
            if (articleStats[like.content_id]) {
              articleStats[like.content_id].user_liked = true;
            }
          });
        }
      } else {
        // 匿名ユーザーの場合：ローカルストレージから取得
        newArticleIds.forEach(id => {
          articleStats[id].user_liked = getLocalLikeState(id);
        });
      }

      setStats(articleStats);
      setLoadedArticleIds(prev => [...prev, ...newArticleIds]);
    } catch (error) {
      console.error('記事統計の取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  }, [stats, user, supabase]);

  // コメントを取得
  const loadComments = useCallback(async (articleId: string) => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('learning_content_comments')
        .select(`
          id,
          content_id,
          user_id,
          content,
          created_at,
          updated_at,
          profiles (
            id,
            username,
            full_name
          )
        `)
        .eq('content_id', articleId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('コメント取得エラー:', commentsError);
        return;
      }

      const transformedComments: ArticleComment[] = (commentsData || []).map(comment => {
        const profile = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;
        return {
          id: comment.id,
          article_id: comment.content_id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          user: {
            id: comment.user_id,
            email: '', // プライバシー保護のため空
            display_name: profile?.full_name || profile?.username || 'ユーザー'
          }
        };
      });

      setComments(prev => ({
        ...prev,
        [articleId]: transformedComments
      }));
    } catch (error) {
      console.error('コメントの取得に失敗しました:', error);
    }
  }, [supabase]);

  // いいねを切り替え
  const toggleLike = useCallback(async (request: ToggleLikeRequest) => {
    try {
      const currentStats = stats[request.article_id];
      if (!currentStats) return;

      if (user) {
        // ログインユーザーの場合：データベースで管理
        if (currentStats.user_liked) {
          // いいね削除
          const { error } = await supabase
            .from('learning_content_likes')
            .delete()
            .eq('content_id', request.article_id)
            .eq('user_id', user.id);

          if (error) {
            console.error('いいね削除エラー:', error);
            return;
          }

          setStats(prev => ({
            ...prev,
            [request.article_id]: {
              ...currentStats,
              user_liked: false,
              likes_count: Math.max(0, currentStats.likes_count - 1)
            }
          }));
        } else {
          // いいね追加
          const { error } = await supabase
            .from('learning_content_likes')
            .insert({
              content_id: request.article_id,
              user_id: user.id
            });

          if (error) {
            console.error('いいね追加エラー:', error);
            return;
          }

          setStats(prev => ({
            ...prev,
            [request.article_id]: {
              ...currentStats,
              user_liked: true,
              likes_count: currentStats.likes_count + 1
            }
          }));
        }
      } else {
        // 匿名ユーザーの場合：セッション管理
        const anonymousInfo = getAnonymousUserInfo();
        
        if (currentStats.user_liked) {
          // いいね削除
          const { error } = await supabase
            .from('learning_content_likes')
            .delete()
            .eq('content_id', request.article_id)
            .eq('session_id', anonymousInfo.sessionId);

          if (error) {
            console.error('匿名いいね削除エラー:', error);
            return;
          }

          // ローカルストレージも更新
          setLocalLikeState(request.article_id, false);

          setStats(prev => ({
            ...prev,
            [request.article_id]: {
              ...currentStats,
              user_liked: false,
              likes_count: Math.max(0, currentStats.likes_count - 1)
            }
          }));
        } else {
          // いいね追加
          const { error } = await supabase
            .from('learning_content_likes')
            .insert({
              content_id: request.article_id,
              session_id: anonymousInfo.sessionId,
              user_agent: anonymousInfo.userAgent
            });

          if (error) {
            console.error('匿名いいね追加エラー:', error);
            return;
          }

          // ローカルストレージも更新
          setLocalLikeState(request.article_id, true);

          setStats(prev => ({
            ...prev,
            [request.article_id]: {
              ...currentStats,
              user_liked: true,
              likes_count: currentStats.likes_count + 1
            }
          }));
        }
      }
    } catch (error) {
      console.error('いいねの切り替えに失敗しました:', error);
    }
  }, [user, stats, supabase]);

  // コメントを投稿（ログインユーザーのみ）
  const createComment = useCallback(async (request: CreateCommentRequest) => {
    if (!user) {
      alert('コメントするにはログインが必要です');
      return;
    }

    try {
      const { error } = await supabase
        .from('learning_content_comments')
        .insert({
          content_id: request.article_id,
          user_id: user.id,
          content: request.content
        });

      if (error) {
        console.error('コメント投稿エラー:', error);
        return;
      }

      // コメント数を更新
      setStats(prev => ({
        ...prev,
        [request.article_id]: {
          ...prev[request.article_id],
          comments_count: prev[request.article_id].comments_count + 1
        }
      }));

      // コメント一覧を再読み込み
      loadComments(request.article_id);
    } catch (error) {
      console.error('コメントの投稿に失敗しました:', error);
    }
  }, [user, supabase, loadComments]);

  // 閲覧数を記録（ログイン不要）
  const recordView = useCallback(async (request: RecordViewRequest) => {
    try {
      // 既に閲覧済みかチェック（重複防止）
      if (getLocalViewState(request.article_id)) {
        return; // 既に閲覧済み
      }

      const anonymousInfo = getAnonymousUserInfo();

      // 閲覧記録を追加
      const { error } = await supabase
        .from('learning_content_views')
        .insert({
          content_id: request.article_id,
          user_id: user?.id || null,
          session_id: user ? null : anonymousInfo.sessionId, // ログインユーザーの場合はsession_idはnull
          user_agent: anonymousInfo.userAgent
        });

      if (error) {
        // 重複エラーの場合は無視（既に閲覧済み）
        if (error.code === '23505') {
          console.log('既に閲覧済みです:', request.article_id);
          setLocalViewState(request.article_id);
          return;
        }
        console.error('閲覧記録エラー:', error);
        return;
      }

      // ローカルストレージに閲覧済み状態を保存
      setLocalViewState(request.article_id);

      // 統計を更新
      setStats(prev => ({
        ...prev,
        [request.article_id]: {
          ...prev[request.article_id],
          views_count: prev[request.article_id].views_count + 1
        }
      }));
    } catch (error) {
      console.error('閲覧記録に失敗しました:', error);
    }
  }, [user, supabase]);

  return {
    stats,
    comments,
    isLoading,
    loadArticleStats,
    loadComments,
    toggleLike,
    createComment,
    recordView
  };
} 