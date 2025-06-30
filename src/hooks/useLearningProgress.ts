import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LearningContent } from '../types';
import supabase from '../utils/supabase';
import { cplAviationLawContents } from '../utils/testLearningData';

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
  const [userProgress, setUserProgress] = useState<Record<string, LearningProgress>>({});
  const [learningContents, setLearningContents] = useState<LearningContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 学習コンテンツをロード
  const loadLearningContents = async () => {
    try {
      // ユーザーのチェックを一時的に無効化（コンテンツ表示のため）
      // if (!user) {
      //   console.log('ユーザーが未ログインのため、コンテンツをロードできません');
      //   return;
      // }

      const { data, error } = await supabase
        .from('learning_contents')
        .select('*')
        .eq('is_published', true)
        .order('category')
        .order('order_index');

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // 既存のコンテンツにCPL航空法記事を追加
        const combinedContents = [...data, ...cplAviationLawContents];
        setLearningContents(combinedContents);
        // 開発環境でのみログを出力
        if (import.meta.env.MODE === 'development') {
          console.log('学習コンテンツをロードしました:', combinedContents.length, '件');
        }
      } else {
        // データベースが空の場合はCPL航空法記事のみ表示
        setLearningContents(cplAviationLawContents);
        // 開発環境でのみログを出力
        if (import.meta.env.MODE === 'development') {
          console.log('CPL航空法記事のみ表示:', cplAviationLawContents.length, '件');
        }
      }
    } catch (err) {
      console.error('学習コンテンツのロードエラー:', err);
      setError(err instanceof Error ? err : new Error('学習コンテンツのロード中に不明なエラーが発生しました'));
      // エラーが発生した場合でもCPL記事は表示
      setLearningContents(cplAviationLawContents);
    }
  };

  // 進捗データをロード
  const loadUserProgress = async () => {
    try {
      if (!user) {
        setUserProgress({});
        return;
      }

      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      if (data) {
        // 進捗データをコンテンツIDをキーとするオブジェクトに変換
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
  };

  // 初期化フラグと前回のユーザーIDを記録
  const [initialized, setInitialized] = useState(false);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  // ユーザー認証の変更を監視（重複呼び出しを防ぐ）
  useEffect(() => {
    const currentUserId = user?.id || null;

    // 初回ロードまたはユーザーが変更された場合のみ実行
    if (!initialized || lastUserId !== currentUserId) {
      const loadData = async () => {
        setIsLoading(true);

        // コンテンツは一度だけロード
        if (!initialized) {
          await loadLearningContents();
          setInitialized(true);
        }

        // ユーザーがいる場合のみ進捗をロード
        await loadUserProgress();

        setIsLoading(false);
      };

      loadData();
      setLastUserId(currentUserId);
    }
  }, [user, initialized, lastUserId]);

  // 進捗の更新
  const updateProgress = async (contentId: string, position: number) => {
    try {
      if (!user) return;

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
        user_id: user.id,
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
  };

  // 完了としてマーク
  const markAsCompleted = async (contentId: string) => {
    try {
      if (!user) return;

      const newProgress = {
        user_id: user.id,
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
  };

  // 進捗率の取得 (0-100%)
  const getProgress = (contentId: string): number => {
    const progress = userProgress[contentId];
    if (!progress) return 0;
    return progress.completed ? 100 : progress.progress_percentage;
  };

  // 完了状態の確認
  const isCompleted = (contentId: string): boolean => {
    return userProgress[contentId]?.completed || false;
  };

  // 最後に読んだ情報の取得
  const getLastReadInfo = (contentId: string) => {
    const progress = userProgress[contentId];
    if (!progress) return null;

    return {
      position: progress.last_position,
      date: progress.last_read_at
    };
  };

  // 進捗のリセット
  const resetProgress = async (contentId: string) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('learning_progress')
        .delete()
        .eq('user_id', user.id)
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
  };

  // カテゴリー別のコンテンツ取得
  const getContentsByCategory = (category?: string) => {
    if (!category) return learningContents;
    return learningContents.filter(content => content.category === category);
  };

  // 全カテゴリーのリストを取得
  const getAllCategories = (): string[] => {
    const categories = new Set(learningContents.map(content => content.category));
    return Array.from(categories);
  };

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
