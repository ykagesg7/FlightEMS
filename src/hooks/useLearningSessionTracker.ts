import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { SessionMetadata } from '../types';
import supabase from '../utils/supabase';

export interface LearningSessionData {
  sessionType: 'reading' | 'quiz' | 'test' | 'review';
  contentId: string;
  contentType: 'article' | 'quiz' | 'test' | 'exercise';
  startTime: Date;
  endTime?: Date;
  engagementScore?: number; // 0-1
  comprehensionScore?: number; // 0-1
  difficultyPerceived?: number; // 1-5
  satisfactionRating?: number; // 1-5
  notes?: string;
  metadata?: SessionMetadata;
}

export interface SessionMetrics {
  totalTime: number; // 分
  averageEngagement: number;
  sessionCount: number;
  currentStreak: number;
}

export const useLearningSessionTracker = () => {
  const { user } = useAuthStore();
  const [currentSession, setCurrentSession] = useState<LearningSessionData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

  // 学習セッション開始
  const startSession = useCallback(async (
    sessionType: LearningSessionData['sessionType'],
    contentId: string,
    contentType: LearningSessionData['contentType'],
    metadata?: SessionMetadata
  ) => {
    if (!user) return null;

    const sessionData: LearningSessionData = {
      sessionType,
      contentId,
      contentType,
      startTime: new Date(),
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    setCurrentSession(sessionData);
    setIsTracking(true);
    lastActivityRef.current = new Date();

    // エンゲージメント追跡の開始
    startEngagementTracking();

    return sessionData;
  }, [user]);

  // 学習セッション終了
  const endSession = useCallback(async (
    sessionData?: Partial<LearningSessionData>
  ) => {
    if (!user || !currentSession) return null;

    const endTime = new Date();
    const durationMinutes = Math.round(
      (endTime.getTime() - currentSession.startTime.getTime()) / 60000
    );

    const completedSession = {
      ...currentSession,
      endTime,
      ...sessionData
    };

    try {
      // データベースに記録
      const { data, error } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          session_type: completedSession.sessionType,
          content_id: completedSession.contentId,
          content_type: completedSession.contentType,
          start_time: completedSession.startTime.toISOString(),
          end_time: completedSession.endTime.toISOString(),
          duration_minutes: durationMinutes,
          engagement_score: completedSession.engagementScore,
          comprehension_score: completedSession.comprehensionScore,
          difficulty_perceived: completedSession.difficultyPerceived,
          satisfaction_rating: completedSession.satisfactionRating,
          notes: completedSession.notes,
          metadata: completedSession.metadata
        })
        .select()
        .single();

      if (error) throw error;

      // 学習プロファイルの更新
      await updateLearningProfile(durationMinutes, completedSession);

      // 状態をクリア
      setCurrentSession(null);
      setIsTracking(false);
      stopEngagementTracking();

      // メトリクスを更新
      await loadSessionMetrics();

      return data;
    } catch (error) {
      console.error('Session save error:', error);
      return null;
    }
  }, [user, currentSession]);

  // エンゲージメント追跡開始
  const startEngagementTracking = useCallback(() => {
    let engagementScore = 1.0;
    let lastActivity = Date.now();

    // マウス移動、キーボード、スクロールイベントの監視
    const activityEvents = ['mousemove', 'keydown', 'scroll', 'click'];

    const trackActivity = () => {
      lastActivity = Date.now();
      lastActivityRef.current = new Date();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    // エンゲージメントスコアの定期計算
    sessionIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;

      // 30秒以上非アクティブの場合、エンゲージメントを下げる
      if (timeSinceActivity > 30000) {
        engagementScore = Math.max(0.1, engagementScore - 0.1);
      } else {
        engagementScore = Math.min(1.0, engagementScore + 0.05);
      }

      // 現在のセッションにエンゲージメントスコアを更新
      setCurrentSession(prev => prev ? {
        ...prev,
        engagementScore: parseFloat(engagementScore.toFixed(2))
      } : null);
    }, 10000); // 10秒間隔で更新

    // クリーンアップ関数を返す
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
    };
  }, []);

  // エンゲージメント追跡停止
  const stopEngagementTracking = useCallback(() => {
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
      sessionIntervalRef.current = null;
    }
  }, []);

  // 学習プロファイル更新
  const updateLearningProfile = useCallback(async (
    durationMinutes: number,
    sessionData: LearningSessionData
  ) => {
    if (!user) return;

    try {
      // 現在のプロファイルを取得
      const { data: profile, error: fetchError } = await supabase
        .from('user_learning_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // ストリーク計算
      let currentStreak = profile?.current_streak_days || 0;
      const lastSessionDate = profile?.updated_at ?
        new Date(profile.updated_at).toISOString().split('T')[0] : null;

      if (lastSessionDate) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastSessionDate === today) {
          // 今日既に学習済み - ストリーク維持
        } else if (lastSessionDate === yesterdayStr) {
          // 昨日学習していた - ストリーク継続
          currentStreak += 1;
        } else {
          // ギャップあり - ストリークリセット
          currentStreak = 1;
        }
      } else {
        // 初回学習
        currentStreak = 1;
      }

      const updateData = {
        total_study_time_minutes: (profile?.total_study_time_minutes || 0) + durationMinutes,
        current_streak_days: currentStreak,
        longest_streak_days: Math.max(profile?.longest_streak_days || 0, currentStreak),
      };

      // プロファイル更新
      const { error: updateError } = await supabase
        .from('user_learning_profiles')
        .upsert({
          user_id: user.id,
          ...updateData
        }, {
          onConflict: 'user_id'
        });

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Profile update error:', error);
    }
  }, [user]);

  // セッションメトリクス読み込み
  const loadSessionMetrics = useCallback(async () => {
    if (!user) return;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: sessions, error } = await supabase
        .from('learning_sessions')
        .select('duration_minutes, engagement_score, created_at')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      if (sessions && sessions.length > 0) {
        const totalTime = sessions.reduce((sum, session) =>
          sum + (session.duration_minutes || 0), 0);

        const validEngagementScores = sessions
          .filter(s => s.engagement_score !== null)
          .map(s => s.engagement_score);

        const averageEngagement = validEngagementScores.length > 0
          ? validEngagementScores.reduce((sum, score) => sum + score, 0) / validEngagementScores.length
          : 0;

        // 現在のストリーク計算
        const { data: profile } = await supabase
          .from('user_learning_profiles')
          .select('current_streak_days')
          .eq('user_id', user.id)
          .single();

        setSessionMetrics({
          totalTime,
          averageEngagement: Math.round(averageEngagement * 100) / 100,
          sessionCount: sessions.length,
          currentStreak: profile?.current_streak_days || 0
        });
      } else {
        setSessionMetrics({
          totalTime: 0,
          averageEngagement: 0,
          sessionCount: 0,
          currentStreak: 0
        });
      }
    } catch (error) {
      console.error('Metrics loading error:', error);
    }
  }, [user]);

  // セッション一時停止
  const pauseSession = useCallback(() => {
    setIsTracking(false);
    stopEngagementTracking();
  }, [stopEngagementTracking]);

  // セッション再開
  const resumeSession = useCallback(() => {
    if (currentSession) {
      setIsTracking(true);
      startEngagementTracking();
      lastActivityRef.current = new Date();
    }
  }, [currentSession, startEngagementTracking]);

  // 理解度スコア更新
  const updateComprehensionScore = useCallback((score: number) => {
    setCurrentSession(prev => prev ? {
      ...prev,
      comprehensionScore: Math.max(0, Math.min(1, score))
    } : null);
  }, []);

  // 難易度感想更新
  const updateDifficultyPerception = useCallback((difficulty: number) => {
    setCurrentSession(prev => prev ? {
      ...prev,
      difficultyPerceived: Math.max(1, Math.min(5, difficulty))
    } : null);
  }, []);

  // 満足度評価更新
  const updateSatisfactionRating = useCallback((rating: number) => {
    setCurrentSession(prev => prev ? {
      ...prev,
      satisfactionRating: Math.max(1, Math.min(5, rating))
    } : null);
  }, []);

  // 初期化時にメトリクス読み込み
  useEffect(() => {
    if (user) {
      loadSessionMetrics();
    }
  }, [user, loadSessionMetrics]);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      stopEngagementTracking();
    };
  }, [stopEngagementTracking]);

  return {
    // 状態
    currentSession,
    isTracking,
    sessionMetrics,

    // セッション制御
    startSession,
    endSession,
    pauseSession,
    resumeSession,

    // セッションデータ更新
    updateComprehensionScore,
    updateDifficultyPerception,
    updateSatisfactionRating,

    // メトリクス
    loadSessionMetrics
  };
};
