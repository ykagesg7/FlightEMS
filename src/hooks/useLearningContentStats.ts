import { useState, useEffect, useCallback } from 'react';
import supabase from '../utils/supabase';

interface ContentStats {
  contentId: string;
  likesCount: number;
  commentsCount: number;
}

export const useLearningContentStats = (contentIds: string[]) => {
  const [stats, setStats] = useState<ContentStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false; // クリーンアップ用フラグ

    const fetchStats = async () => {
      if (contentIds.length === 0) {
        if (!isCancelled) {
          setStats([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        if (!isCancelled) {
          setIsLoading(true);
        }

        // いいね数を取得
        const { data: likesData, error: likesError } = await supabase
          .from('learning_content_likes')
          .select('content_id')
          .in('content_id', contentIds);

        if (likesError) throw likesError;

        // コメント数を取得
        const { data: commentsData, error: commentsError } = await supabase
          .from('learning_content_comments')
          .select('content_id')
          .in('content_id', contentIds);

        if (commentsError) throw commentsError;

        // キャンセルされていない場合のみ状態を更新
        if (!isCancelled) {
          // 各コンテンツの統計を計算
          const statsMap = contentIds.map(contentId => {
            const likesCount = likesData?.filter(like => like.content_id === contentId).length || 0;
            const commentsCount = commentsData?.filter(comment => comment.content_id === contentId).length || 0;

            return {
              contentId,
              likesCount,
              commentsCount
            };
          });

          setStats(statsMap);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('統計データの取得に失敗しました:', error);
          setStats([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchStats();

    // クリーンアップ関数
    return () => {
      isCancelled = true;
    };
  }, [contentIds.length, contentIds.join(',')]); // より安全な依存関係

  const getStatsForContent = useCallback((contentId: string) => {
    return stats.find(stat => stat.contentId === contentId) || {
      contentId,
      likesCount: 0,
      commentsCount: 0
    };
  }, [stats]);

  return {
    stats,
    isLoading,
    getStatsForContent
  };
}; 