import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LearningContent } from '../types';
import supabase from '../utils/supabase';

interface LearningProgress {
  id: string;
  user_id: string;
  content_id: string;
  completed: boolean;
  progress_percentage: number;
  last_position: number;
  last_read_at: string;
  read_count: number;
  created_at: string;
  updated_at: string;
}

export const useLearningProgress = () => {
  const { user } = useAuth();
  const stableUser = useMemo(() => user, [user]);
  const [userProgress, setUserProgress] = useState<Record<string, LearningProgress>>({});
  const [learningContents, setLearningContents] = useState<LearningContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 学習コンテンツをロード
  const loadLearningContents = useCallback(async () => {
    try {
      // 認証状態を確認
      const { data: authData } = await supabase.auth.getSession();
      console.log('認証状態:', authData.session ? '認証済み' : '未認証');

      const { data, error } = await supabase
        .from('learning_contents')
        .select('*')
        .eq('is_published', true)
        .order('category')
        .order('order_index');

      if (error) {
        console.error('Supabaseエラー詳細:', error);
        throw error;
      }

      if (data && data.length > 0) {
        setLearningContents(data);
      } else {
        setLearningContents([]);
      }
    } catch (err) {
      console.error('学習コンテンツのロードエラー:', err);
      setError(err instanceof Error ? err : new Error('学習コンテンツのロード中に不明なエラーが発生しました'));
      setLearningContents([]);
    }
  }, []);

  // 進捗データをロード
  const loadUserProgress = useCallback(async () => {
    try {
      if (!stableUser) {
        setUserProgress({});
        return;
      }

      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', stableUser.id);

      if (error) {
        throw error;
      }

      if (data) {
        const progressMap: Record<string, LearningProgress> = {};
        data.forEach(progress => {
          progressMap[progress.content_id] = progress;
        });
        setUserProgress(progressMap);
      }
    } catch (err) {
      console.error('学習進捗のロードエラー:', err);
      setError(err instanceof Error ? err : new Error('学習進捗のロード中に不明なエラーが発生しました'));
    }
  }, [stableUser]);

  // ユーザー認証の変更を監視し、コンテンツと進捗をロード
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await loadLearningContents();
      await loadUserProgress();
      setIsLoading(false);
    };

    loadInitialData();
  }, [loadLearningContents, loadUserProgress]);

  // 進捗の更新
  const updateProgress = useCallback(async (contentId: string, position: number) => {
    try {
      if (!stableUser) return;

      // 既存の進捗データを取得
      const existingProgress = userProgress[contentId];

      // 進捗率を計算（簡易的な計算 - 実際の実装では調整が必要）
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progressPercentage = Math.round((position / totalHeight) * 100);

      // 同じ位置の場合や小さすぎる変化は無視
      if (existingProgress &&
        (existingProgress.last_position === position ||
          Math.abs(existingProgress.last_position - position) < 10)) {
        return;
      }

      const newProgress = {
        user_id: stableUser.id,
        content_id: contentId,
        last_position: position,
        progress_percentage: Math.min(progressPercentage, 99), // 99%まで（完了ボタンで100%に）
        read_count: existingProgress ? existingProgress.read_count + 1 : 1,
        last_read_at: new Date().toISOString(),
        completed: existingProgress ? existingProgress.completed : false
      };

      const { data, error } = await supabase
        .from('learning_progress')
        .upsert([newProgress], { onConflict: 'user_id,content_id' });

      if (error) {
        throw error;
      }

      if (data) {
        // ローカル状態を更新
        setUserProgress(prev => ({
          ...prev,
          [contentId]: data[0]
        }));
      }
    } catch (err) {
      console.error('進捗更新エラー:', err);
      setError(err instanceof Error ? err : new Error('進捗更新中に不明なエラーが発生しました'));
    }
  }, [stableUser, userProgress]);

  // 完了としてマーク
  const markAsCompleted = useCallback(async (contentId: string) => {
    try {
      if (!stableUser) return;

      const newProgress = {
        user_id: stableUser.id,
        content_id: contentId,
        completed: true,
        progress_percentage: 100,
        last_read_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('learning_progress')
        .upsert([newProgress], { onConflict: 'user_id,content_id' });

      if (error) {
        throw error;
      }

      if (data) {
        // ローカル状態を更新
        setUserProgress(prev => ({
          ...prev,
          [contentId]: data[0]
        }));
      }
    } catch (err) {
      console.error('完了マークエラー:', err);
      setError(err instanceof Error ? err : new Error('コンテンツを完了としてマーク中に不明なエラーが発生しました'));
    }
  }, [stableUser]);

  // 進捗率の取得 (0-100%)
  const getProgress = useCallback((contentId: string): number => {
    const progress = userProgress[contentId];
    if (!progress) return 0;
    return progress.completed ? 100 : progress.progress_percentage;
  }, [userProgress]);

  // 完了状態の確認
  const isCompleted = useCallback((contentId: string): boolean => {
    return userProgress[contentId]?.completed || false;
  }, [userProgress]);

  // 最後に読んだ情報の取得
  const getLastReadInfo = useCallback((contentId: string) => {
    const progress = userProgress[contentId];
    if (!progress) return null;

    return {
      position: progress.last_position,
      date: progress.last_read_at
    };
  }, [userProgress]);

  // 進捗のリセット
  const resetProgress = useCallback(async (contentId: string) => {
    try {
      if (!stableUser) return;

      const { error } = await supabase
        .from('learning_progress')
        .delete()
        .eq('user_id', stableUser.id)
        .eq('content_id', contentId);

      if (error) {
        throw error;
      }

      // ローカル状態を更新
      setUserProgress(prev => {
        const newState = { ...prev };
        delete newState[contentId];
        return newState;
      });
    } catch (err) {
      console.error('進捗リセットエラー:', err);
      setError(err instanceof Error ? err : new Error('進捗のリセット中に不明なエラーが発生しました'));
    }
  }, [stableUser]);

  // カテゴリー別のコンテンツ取得
  const getContentsByCategory = useCallback((category?: string) => {
    if (!category) return learningContents;
    return learningContents.filter(content => content.category === category);
  }, [learningContents]);

  // 全カテゴリーのリストを取得
  const getAllCategories = useCallback((): string[] => {
    const categories = new Set(learningContents.map(content => content.category));
    return Array.from(categories);
  }, [learningContents]);

  return {
    // データ
    userProgress,
    learningContents,
    isLoading,
    error,

    // アクション
    updateProgress,
    markAsCompleted,
    getProgress,
    isCompleted,
    getLastReadInfo,
    resetProgress,
    loadUserProgress,
    loadLearningContents,

    // ヘルパー関数
    getContentsByCategory,
    getAllCategories
  };
};
