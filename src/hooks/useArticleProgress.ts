import { useCallback, useEffect, useState } from 'react';
import { ArticleMeta } from '../types/articles';
import { buildArticleIndex } from '../utils/articlesIndex';
import { supabase } from '../utils/supabase';
import { useAuth } from './useAuth';
import { useGamification } from './useGamification';
import { calculateTotalArticleXp } from '../utils/articleXpRewards';
import { updateStreak } from '../utils/streak';
import { usePPLRanks } from './usePPLRanks';

// 記事の進捗情報
export interface ArticleProgress {
  articleSlug: string;
  readAt: Date;
  readingTime: number; // 秒
  scrollProgress: number; // 0-100%
  completed: boolean;
  bookmarked: boolean;
  rating?: number; // 1-5
  notes?: string;
  lastPosition: number; // スクロール位置
}

// 学習統計
export interface LearningStats {
  totalArticles: number;
  readArticles: number;
  completedArticles: number;
  streakDays: number; // 後方互換性のため残す
  averageRating: number; // 後方互換性のため残す
  completedMissions: number; // 完了したミッションの総数
  rankProgress: number; // 次のランクまでの進捗率（0-100）
  currentRank?: string | null; // 現在のランク（オプション、表示用）
  categoriesProgress: Record<string, { read: number; total: number; percentage: number }>;
  seriesProgress: Record<string, { read: number; total: number; percentage: number }>;
  recentActivity: ArticleProgress[];
  favoriteCategories: string[];
  readingGoals: {
    daily: number; // 1日の目標記事数
    weekly: number; // 1週間の目標記事数
    achieved: boolean;
  };
}

// ダミーデータ（未登録ユーザー用）
const DEMO_STATS: LearningStats = {
  totalArticles: 26,
  readArticles: 12,
  completedArticles: 8,
  streakDays: 7,
  averageRating: 4.2,
  completedMissions: 5,
  rankProgress: 45,
  currentRank: 'spectator',
  categoriesProgress: {
    '思考法': { read: 6, total: 8, percentage: 75 },
    'メンタリティー': { read: 4, total: 6, percentage: 67 },
    '操縦': { read: 2, total: 7, percentage: 29 },
    '成功哲学': { read: 0, total: 5, percentage: 0 }
  },
  seriesProgress: {
    'ロジカルプレゼンテーション': { read: 3, total: 4, percentage: 75 },
    'アナロジー思考': { read: 3, total: 3, percentage: 100 },
    'Millionaire Teaching': { read: 2, total: 3, percentage: 67 }
  },
  recentActivity: [
    {
      articleSlug: '/articles/millionaire-teaching-2',
      readAt: new Date(Date.now() - 1000 * 60 * 30), // 30分前
      readingTime: 720, // 12分
      scrollProgress: 100,
      completed: true,
      bookmarked: true,
      rating: 5,
      lastPosition: 0
    },
    {
      articleSlug: '/articles/logical-presentation-3',
      readAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2時間前
      readingTime: 480, // 8分
      scrollProgress: 85,
      completed: false,
      bookmarked: false,
      rating: 4,
      lastPosition: 1200
    },
    {
      articleSlug: '/articles/analogy-thinking-1',
      readAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1日前
      readingTime: 600, // 10分
      scrollProgress: 100,
      completed: true,
      bookmarked: true,
      rating: 5,
      lastPosition: 0
    }
  ],
  favoriteCategories: ['思考法', 'メンタリティー'],
  readingGoals: {
    daily: 2,
    weekly: 10,
    achieved: true
  }
};

const DEMO_PROGRESS: Record<string, ArticleProgress> = {
  '/articles/millionaire-teaching-2': DEMO_STATS.recentActivity[0],
  '/articles/logical-presentation-3': DEMO_STATS.recentActivity[1],
  '/articles/analogy-thinking-1': DEMO_STATS.recentActivity[2],
  '/articles/logical-presentation-1': {
    articleSlug: '/articles/logical-presentation-1',
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    readingTime: 420,
    scrollProgress: 100,
    completed: true,
    bookmarked: false,
    rating: 4,
    lastPosition: 0
  },
  '/articles/logical-presentation-2': {
    articleSlug: '/articles/logical-presentation-2',
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    readingTime: 390,
    scrollProgress: 100,
    completed: true,
    bookmarked: true,
    rating: 4,
    lastPosition: 0
  }
};

export const useArticleProgress = () => {
  const { user } = useAuth();
  const { completeMissionByAction, profile, rankProgress: gamificationRankProgress } = useGamification();
  const { checkRanksForContent, refreshRanks } = usePPLRanks();
  const [userProgress, setUserProgress] = useState<Record<string, ArticleProgress>>({});
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 記事インデックスを取得（slugとfilenameの両方で検索可能）
  const [articleIndex, setArticleIndex] = useState<Record<string, ArticleMeta>>({});
  const [articleIndexByFilename, setArticleIndexByFilename] = useState<Record<string, ArticleMeta>>({});

  useEffect(() => {
    const loadArticleIndex = async () => {
      try {
        const index = await buildArticleIndex();
        const indexMap: Record<string, ArticleMeta> = {};
        const indexMapByFilename: Record<string, ArticleMeta> = {};
        index.forEach(entry => {
          indexMap[entry.meta.slug] = entry.meta;
          indexMapByFilename[entry.filename] = entry.meta;
        });
        setArticleIndex(indexMap);
        setArticleIndexByFilename(indexMapByFilename);
      } catch (err) {
        console.error('記事インデックス読み込みエラー:', err);
      }
    };

    loadArticleIndex();
  }, []);

  // 統計の計算
  const calculateStats = useCallback((
    progress: Record<string, ArticleProgress>,
    userProfile?: { current_streak_days?: number },
    gamificationProfile?: { completed_missions?: Array<{ mission_id: string }>; rank?: string } | null,
    rankProgressValue?: number
  ): LearningStats => {
    const articles = Object.values(articleIndex);
    const progressList = Object.values(progress);

    // カテゴリー別進捗
    const categoriesProgress: Record<string, { read: number; total: number; percentage: number }> = {};
    const seriesProgress: Record<string, { read: number; total: number; percentage: number }> = {};

    // 全記事をカテゴリー・シリーズ別に分類
    articles.forEach(article => {
      // タグを疑似カテゴリーとして使用
      const category = article.tags[0] || 'その他';
      if (!categoriesProgress[category]) {
        categoriesProgress[category] = { read: 0, total: 0, percentage: 0 };
      }
      categoriesProgress[category].total++;

      // シリーズ進捗
      if (article.series) {
        if (!seriesProgress[article.series]) {
          seriesProgress[article.series] = { read: 0, total: 0, percentage: 0 };
        }
        seriesProgress[article.series].total++;
      }
    });

    // 読了記事をカウント
    progressList.forEach(prog => {
      // articleSlugはcontent_id（filename）の可能性があるため、両方を試す
      const article = articleIndex[prog.articleSlug] || articleIndexByFilename[prog.articleSlug];
      if (!article) return;

      const category = article.tags[0] || 'その他';
      if (categoriesProgress[category] && prog.completed) {
        categoriesProgress[category].read++;
      }

      if (article.series && seriesProgress[article.series] && prog.completed) {
        seriesProgress[article.series].read++;
      }
    });

    // パーセンテージ計算
    Object.keys(categoriesProgress).forEach(category => {
      const cat = categoriesProgress[category];
      cat.percentage = cat.total > 0 ? Math.round((cat.read / cat.total) * 100) : 0;
    });

    Object.keys(seriesProgress).forEach(series => {
      const ser = seriesProgress[series];
      ser.percentage = ser.total > 0 ? Math.round((ser.read / ser.total) * 100) : 0;
    });

    const completedArticles = progressList.filter(p => p.completed).length;

    const ratingsWithValue = progressList.filter(p => p.rating && p.rating > 0);
    const averageRating = ratingsWithValue.length > 0
      ? ratingsWithValue.reduce((sum, p) => sum + (p.rating || 0), 0) / ratingsWithValue.length
      : 0;

    // 連続日数: user_learning_profilesから取得（後方互換性のため残す）
    const streakDays = userProfile?.current_streak_days || 0;

    // XPシステムからデータを取得
    const completedMissions = gamificationProfile?.completed_missions?.length || 0;
    const rankProgress = rankProgressValue !== undefined ? rankProgressValue : 0;
    const currentRank = gamificationProfile?.rank || null;

    // 今日の完了記事数を計算（日付ベース）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCompletedArticles = progressList.filter(p => {
      const readDate = new Date(p.readAt);
      readDate.setHours(0, 0, 0, 0);
      return p.completed && readDate.getTime() === today.getTime();
    }).length;

    return {
      totalArticles: articles.length,
      readArticles: progressList.length,
      completedArticles,
      streakDays,
      averageRating,
      completedMissions,
      rankProgress,
      currentRank,
      categoriesProgress,
      seriesProgress,
      recentActivity: progressList
        .sort((a, b) => b.readAt.getTime() - a.readAt.getTime())
        .slice(0, 10),
      favoriteCategories: Object.entries(categoriesProgress)
        .sort(([, a], [, b]) => b.percentage - a.percentage)
        .slice(0, 3)
        .map(([category]) => category),
      readingGoals: {
        daily: 2,
        weekly: 10,
        achieved: todayCompletedArticles >= 2 // 今日の完了記事数で判定
      }
    };
  }, [articleIndex, articleIndexByFilename]);

  // 初期データ読み込み
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // 登録ユーザーの場合：Supabaseから進捗データとプロファイルを読み込み
          const progressResult = await supabase
            .from('learning_progress')
            .select('*')
            .eq('user_id', user.id);

          if (progressResult.error) {
            console.error('進捗データ取得エラー:', progressResult.error);
            throw progressResult.error;
          }

          // プロファイルデータを取得（エラーが発生しても続行）
          let userProfile: { current_streak_days?: number } | undefined;
          try {
            const profileResult = await supabase
              .from('user_learning_profiles')
              .select('current_streak_days')
              .eq('user_id', user.id)
              .maybeSingle(); // single()の代わりにmaybeSingle()を使用（レコードが存在しない場合もエラーにならない）

            // エラーをチェック
            if (profileResult.error) {
              // PGRST116はレコードが存在しない場合のエラーコード
              // その他のエラー（406など）はRLSポリシーやテーブル設定の問題の可能性
              if (profileResult.error.code === 'PGRST116') {
                // レコードが存在しない場合は正常（初回ユーザーなど）
                console.debug('プロファイルレコードが存在しません（初回ユーザーの可能性）');
              } else {
                console.warn('プロファイルデータ取得エラー（無視して続行）:', profileResult.error);
              }
            } else if (profileResult.data) {
              userProfile = profileResult.data;
            }
          } catch (profileError) {
            // 予期しないエラーも無視
            console.warn('プロファイルデータ取得エラー（無視して続行）:', profileError);
          }

          // データをArticleProgress形式に変換
          const progressMap: Record<string, ArticleProgress> = {};
          progressResult.data?.forEach(record => {
            progressMap[record.content_id] = {
              articleSlug: record.content_id,
              readAt: new Date(record.last_read_at),
              readingTime: 0, // 将来的に計算可能
              scrollProgress: record.progress_percentage,
              completed: record.completed,
              bookmarked: false, // 将来的に別テーブルで管理
              lastPosition: record.last_position
            };
          });

          setUserProgress(progressMap);
          // useGamificationから取得したデータを使用
          setStats(calculateStats(progressMap, userProfile, profile, gamificationRankProgress));
        } else {
          // 未登録ユーザーの場合：ダミーデータを使用
          setUserProgress(DEMO_PROGRESS);
          setStats(DEMO_STATS);
        }
      } catch (err) {
        console.error('進捗データ読み込みエラー:', err);
        setError(err instanceof Error ? err : new Error('データの読み込みに失敗しました'));
      } finally {
        setIsLoading(false);
      }
    };

    if (Object.keys(articleIndex).length > 0 && Object.keys(articleIndexByFilename).length > 0) {
      loadInitialData();
    }
  }, [user, articleIndex, articleIndexByFilename, calculateStats, profile, gamificationRankProgress]);

  // 記事の進捗を更新
  const updateArticleProgress = useCallback(async (
    articleSlug: string,
    updates: Partial<ArticleProgress>
  ) => {
    if (!user) {
      // 未登録ユーザーの場合は更新しない（デモモード）
      return;
    }

    try {
      const existing = userProgress[articleSlug];
      const newProgress: ArticleProgress = {
        ...existing,
        articleSlug,
        readAt: updates.readAt || existing?.readAt || new Date(),
        readingTime: existing?.readingTime || 0,
        scrollProgress: updates.scrollProgress ?? existing?.scrollProgress ?? 0,
        completed: updates.completed ?? (updates.scrollProgress !== undefined ? updates.scrollProgress >= 95 : existing?.completed ?? false),
        bookmarked: existing?.bookmarked || false,
        lastPosition: updates.lastPosition ?? existing?.lastPosition ?? 0,
        ...updates
      };

      // Supabaseに保存（UPSERT）
      const { error: upsertError } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          content_id: articleSlug,
          progress_percentage: Math.round(newProgress.scrollProgress),
          completed: newProgress.completed || newProgress.scrollProgress >= 95, // completedフラグまたは95%以上で完了
          last_position: newProgress.lastPosition,
          last_read_at: newProgress.readAt.toISOString(),
          read_count: existing ? (existing.readingTime > 0 ? 2 : 1) : 1,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,content_id'
        });

      // 記事が完了した場合、PPLランクをチェック
      if (newProgress.completed && (!existing || !existing.completed)) {
        // データベースのトリガーが自動的にランクをチェックするが、
        // フロントエンドでもランクを再取得して通知を表示できるようにする
        checkRanksForContent(articleSlug).then((newRanks) => {
          refreshRanks();
          // 新しいランクが取得された場合、通知を表示（グローバル通知システムが設定されている場合）
          if (newRanks && newRanks.length > 0) {
            // 通知はグローバル通知システムで処理される（将来実装）
            // 現時点では、コンソールログで確認可能
            console.log('PPLランク取得:', newRanks);
          }
        }).catch(err => {
          console.warn('PPLランクチェックエラー（無視して続行）:', err);
        });
      }

      if (upsertError) {
        // ネットワークエラー（ERR_QUIC_PROTOCOL_ERROR、ERR_FAILEDなど）は無視
        // ページ離脱時やネットワーク不安定時に発生する可能性がある
        if (upsertError.message?.includes('Failed to fetch') || upsertError.message?.includes('network')) {
          // ネットワークエラーは無視（エラーログは出力しない）
          return;
        }
        // その他のエラーは警告のみ（致命的ではない）
        console.warn('Supabase保存エラー（無視して続行）:', upsertError);
        return;
      }

      // ローカル状態を更新
      setUserProgress(prev => ({
        ...prev,
        [articleSlug]: newProgress
      }));

      // ローカル状態を更新（先に実行してUIを即座に更新）
      const newProgressMap = { ...userProgress, [articleSlug]: newProgress };

      // 統計を再計算（プロファイルは非同期で取得、失敗しても続行）
      // プロファイル取得は非同期で実行し、完了後に統計を再計算
      // これにより、プロファイル取得が失敗しても進捗更新は成功する
      const updateStatsWithProfile = async () => {
        let userLearningProfile: { current_streak_days?: number } | undefined;
        try {
          const profileResult = await supabase
            .from('user_learning_profiles')
            .select('current_streak_days')
            .eq('user_id', user.id)
            .maybeSingle();

          if (profileResult.error) {
            // PGRST116はレコードが存在しない場合のエラーコード
            if (profileResult.error.code === 'PGRST116') {
              // レコードが存在しない場合は正常（初回ユーザーなど）
              // エラーログは出力しない
            } else {
              // その他のエラー（ネットワークエラー、CORS、502など）は無視
              // エラーログは出力しない（コンソールを汚さない）
            }
          } else if (profileResult.data) {
            userLearningProfile = profileResult.data;
          }
        } catch (profileError) {
          // ネットワークエラーなどは無視（エラーログは出力しない）
        }

        // プロファイル取得後に統計を再計算
        // userLearningProfileは第2引数（userProfile）、profileは第3引数（gamificationProfile）
        setStats(calculateStats(newProgressMap, userLearningProfile, profile, gamificationRankProgress));
      };

      // まずプロファイルなしで統計を計算（即座にUIを更新）
      // userLearningProfileはundefined、profileはuseGamificationから取得済み
      setStats(calculateStats(newProgressMap, undefined, profile, gamificationRankProgress));

      // その後、プロファイルを取得して統計を再計算（バックグラウンドで実行）
      updateStatsWithProfile().catch(() => {
        // エラーは無視（既にプロファイルなしで統計を計算済み）
      });

      // 記事完了時にミッション達成をチェック
      if (newProgress.scrollProgress >= 95 || newProgress.completed) {
        try {
          await completeMissionByAction('article_read');
        } catch (missionError) {
          // ミッション達成の失敗は致命的ではないためログのみ
          console.warn('Mission completion check failed:', missionError);
        }
      }
    } catch (err) {
      // ネットワークエラー（ERR_QUIC_PROTOCOL_ERROR、ERR_FAILEDなど）は無視
      // ページ離脱時やネットワーク不安定時に発生する可能性がある
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
        // ネットワークエラーは無視（エラーログは出力しない）
        return;
      }
      // その他のエラーは警告のみ（致命的ではない）
      console.warn('進捗更新エラー（無視して続行）:', err);
      // setErrorは呼ばない（ネットワークエラーは正常）
    }
  }, [user, userProgress, calculateStats, completeMissionByAction, articleIndex, articleIndexByFilename]);

  // 記事をブックマーク
  const toggleBookmark = useCallback(async (articleSlug: string) => {
    const existing = userProgress[articleSlug];
    await updateArticleProgress(articleSlug, {
      bookmarked: !existing?.bookmarked
    });
  }, [updateArticleProgress, userProgress]);

  // 記事を完了としてマーク
  const markAsCompleted = useCallback(async (articleSlug: string) => {
    await updateArticleProgress(articleSlug, {
      completed: true,
      scrollProgress: 100
    });
  }, [updateArticleProgress]);

  // 記事に評価を付ける
  const rateArticle = useCallback(async (articleSlug: string, rating: number) => {
    await updateArticleProgress(articleSlug, { rating });
  }, [updateArticleProgress]);

  // 記事の進捗を取得
  const getArticleProgress = useCallback((articleSlug: string): ArticleProgress | null => {
    return userProgress[articleSlug] || null;
  }, [userProgress]);

  // 記事が完了済みかチェック
  const isArticleCompleted = useCallback((articleSlug: string): boolean => {
    return userProgress[articleSlug]?.completed || false;
  }, [userProgress]);

  // 記事がブックマーク済みかチェック
  const isArticleBookmarked = useCallback((articleSlug: string): boolean => {
    return userProgress[articleSlug]?.bookmarked || false;
  }, [userProgress]);

  // Supabaseから最新の進捗データを再取得
  const refreshProgress = useCallback(async () => {
    if (!user) return;

    try {
      const progressResult = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressResult.error) {
        console.error('進捗データ再取得エラー:', progressResult.error);
        return;
      }

      // プロファイルデータを取得（エラーが発生しても続行）
      let userProfile: { current_streak_days?: number } | undefined;
      try {
        const profileResult = await supabase
          .from('user_learning_profiles')
          .select('current_streak_days')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileResult.error) {
          if (profileResult.error.code === 'PGRST116') {
            console.debug('プロファイルレコードが存在しません（初回ユーザーの可能性）');
          } else {
            console.warn('プロファイルデータ取得エラー（無視して続行）:', profileResult.error);
          }
        } else if (profileResult.data) {
          userProfile = profileResult.data;
        }
      } catch (profileError) {
        console.warn('プロファイルデータ取得エラー（無視して続行）:', profileError);
      }

      // データをArticleProgress形式に変換して更新
      const progressMap: Record<string, ArticleProgress> = {};
      progressResult.data?.forEach(record => {
        progressMap[record.content_id] = {
          articleSlug: record.content_id,
          readAt: new Date(record.last_read_at),
          readingTime: 0,
          scrollProgress: record.progress_percentage,
          completed: record.completed,
          bookmarked: false,
          lastPosition: record.last_position
        };
      });

      setUserProgress(progressMap);
      setStats(calculateStats(progressMap, userProfile, profile, gamificationRankProgress));
    } catch (err) {
      console.error('進捗データ再取得エラー:', err);
    }
  }, [user, calculateStats, profile, gamificationRankProgress]);

  return {
    // データ
    stats,
    userProgress,
    isLoading,
    error,

    // 未登録ユーザー判定
    isDemo: !user,

    // アクション
    updateArticleProgress,
    toggleBookmark,
    markAsCompleted,
    rateArticle,
    refreshProgress,

    // ゲッター
    getArticleProgress,
    isArticleCompleted,
    isArticleBookmarked
  };
};
