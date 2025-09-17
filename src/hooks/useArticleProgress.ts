import { useCallback, useEffect, useState } from 'react';
import { ArticleMeta } from '../types/articles';
import { buildArticleIndex } from '../utils/articlesIndex';
import { useAuth } from './useAuth';

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
  totalReadingTime: number; // 分
  streakDays: number;
  averageRating: number;
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
  totalReadingTime: 180, // 3時間
  streakDays: 7,
  averageRating: 4.2,
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
  const [userProgress, setUserProgress] = useState<Record<string, ArticleProgress>>({});
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 記事インデックスを取得
  const [articleIndex, setArticleIndex] = useState<Record<string, ArticleMeta>>({});

  useEffect(() => {
    const loadArticleIndex = async () => {
      try {
        const index = await buildArticleIndex();
        const indexMap: Record<string, ArticleMeta> = {};
        index.forEach(entry => {
          indexMap[entry.meta.slug] = entry.meta;
        });
        setArticleIndex(indexMap);
      } catch (err) {
        console.error('記事インデックス読み込みエラー:', err);
      }
    };

    loadArticleIndex();
  }, []);

  // 統計の計算
  const calculateStats = useCallback((progress: Record<string, ArticleProgress>): LearningStats => {
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
      const article = articleIndex[prog.articleSlug];
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
    const totalReadingTime = Math.round(progressList.reduce((sum, p) => sum + p.readingTime, 0) / 60); // 分に変換
    const ratingsWithValue = progressList.filter(p => p.rating && p.rating > 0);
    const averageRating = ratingsWithValue.length > 0
      ? ratingsWithValue.reduce((sum, p) => sum + (p.rating || 0), 0) / ratingsWithValue.length
      : 0;

    // 連続日数計算（簡易版）
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const recentReads = progressList.filter(p =>
      p.readAt.toDateString() === today.toDateString() ||
      p.readAt.toDateString() === yesterday.toDateString()
    );
    const streakDays = recentReads.length > 0 ? 1 : 0; // 簡易計算

    return {
      totalArticles: articles.length,
      readArticles: progressList.length,
      completedArticles,
      totalReadingTime,
      streakDays,
      averageRating,
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
        achieved: completedArticles >= 2 // 簡易判定
      }
    };
  }, [articleIndex]);

  // 初期データ読み込み
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // 登録ユーザーの場合：実際のデータを読み込み（将来実装）
          // TODO: Supabaseからユーザーの進捗データを取得
          console.log('登録ユーザーのデータ読み込み（未実装）');
          setUserProgress({});
          setStats(calculateStats({}));
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

    if (Object.keys(articleIndex).length > 0) {
      loadInitialData();
    }
  }, [user, articleIndex, calculateStats]);

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
        articleSlug,
        readAt: new Date(),
        readingTime: 0,
        scrollProgress: 0,
        completed: false,
        bookmarked: false,
        lastPosition: 0,
        ...existing,
        ...updates
      };

      // TODO: Supabaseに保存
      console.log('進捗更新（未実装）:', newProgress);

      setUserProgress(prev => ({
        ...prev,
        [articleSlug]: newProgress
      }));

      // 統計を再計算
      const newProgressMap = { ...userProgress, [articleSlug]: newProgress };
      setStats(calculateStats(newProgressMap));
    } catch (err) {
      console.error('進捗更新エラー:', err);
      setError(err instanceof Error ? err : new Error('進捗の更新に失敗しました'));
    }
  }, [user, userProgress, calculateStats]);

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

    // ゲッター
    getArticleProgress,
    isArticleCompleted,
    isArticleBookmarked,

    // ダミーデータ（デモ用）
    demoStats: DEMO_STATS,
    demoProgress: DEMO_PROGRESS
  };
};
