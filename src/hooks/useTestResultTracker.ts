import { useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import supabase from '../utils/supabase';

export interface TestAnswer {
  questionId: string;
  questionText: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  responseTime?: number;
  subjectCategory: string;
  difficultyLevel?: number;
}

export interface TestSession {
  sessionId: string;
  learningContentId?: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  totalTime: number;
  startTime: Date;
  endTime: Date;
}

export const useTestResultTracker = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  const startTestSession = useCallback((learningContentId?: string) => {
    const sessionId = crypto.randomUUID();
    setCurrentSession(sessionId);
    return sessionId;
  }, []);

  const recordTestResult = useCallback(async (
    answers: TestAnswer[],
    session: TestSession
  ) => {
    if (!user) {
      console.warn('User not authenticated, cannot record test results');
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    
    try {
      // 1. 個別の回答を記録
      const testResults = answers.map(answer => ({
        user_id: user.id,
        session_id: session.sessionId,
        learning_content_id: session.learningContentId,
        question_id: answer.questionId,
        question_text: answer.questionText,
        user_answer: answer.userAnswer,
        correct_answer: answer.correctAnswer,
        is_correct: answer.isCorrect,
        response_time_seconds: answer.responseTime,
        subject_category: answer.subjectCategory,
        difficulty_level: answer.difficultyLevel || 1
      }));

      const { error: resultsError } = await supabase
        .from('user_test_results')
        .insert(testResults);

      if (resultsError) {
        throw resultsError;
      }

      // 2. 科目別の正答率を計算して弱点分析を更新
      const subjectStats = answers.reduce((acc, answer) => {
        const category = answer.subjectCategory;
        if (!acc[category]) {
          acc[category] = { total: 0, correct: 0 };
        }
        acc[category].total++;
        if (answer.isCorrect) {
          acc[category].correct++;
        }
        return acc;
      }, {} as Record<string, { total: number; correct: number }>);

      // 弱点分析の更新（トリガーが自動実行されるため、手動更新は不要）
      // しかし、推奨コンテンツの更新は手動で行う
      for (const [category, stats] of Object.entries(subjectStats)) {
        const accuracy = (stats.correct / stats.total) * 100;
        
        if (accuracy < 70) { // 70%未満の場合は推奨コンテンツを設定
          const { data: mappings } = await supabase
            .from('learning_test_mapping')
            .select('learning_content_id')
            .eq('topic_category', category)
            .limit(3);

          const recommendedContentIds = mappings?.map(m => m.learning_content_id) || [];

          await supabase
            .from('user_weak_areas')
            .upsert({
              user_id: user.id,
              subject_category: category,
              sub_category: 'general',
              recommended_content_ids: recommendedContentIds,
              last_attempt_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,subject_category,sub_category'
            });
        }
      }

      return { success: true, sessionId: session.sessionId };
    } catch (error) {
      console.error('Error recording test results:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getWeakAreas = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('user_weak_areas')
        .select('*')
        .eq('user_id', user.id)
        .order('accuracy_rate', { ascending: true });

      if (error) {
        console.error('Error fetching weak areas:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching weak areas:', error);
      return [];
    }
  }, [user]);

  const getTestHistory = useCallback(async (limit = 10) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('user_test_results')
        .select(`
          session_id,
          learning_content_id,
          subject_category,
          created_at,
          is_correct
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit * 20); // セッション数を考慮して多めに取得

      if (error) {
        console.error('Error fetching test history:', error);
        return [];
      }

      // セッション別に集計
      const sessionStats = data?.reduce((acc, result) => {
        const sessionId = result.session_id;
        if (!acc[sessionId]) {
          acc[sessionId] = {
            sessionId,
            learningContentId: result.learning_content_id,
            subjectCategory: result.subject_category,
            totalQuestions: 0,
            correctAnswers: 0,
            date: result.created_at
          };
        }
        acc[sessionId].totalQuestions++;
        if (result.is_correct) {
          acc[sessionId].correctAnswers++;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      return Object.values(sessionStats)
        .map(session => ({
          ...session,
          accuracy: Math.round((session.correctAnswers / session.totalQuestions) * 100)
        }))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching test history:', error);
      return [];
    }
  }, [user]);

  const calculateProgress = useCallback(async (subjectCategory: string) => {
    if (!user) return { accuracy: 0, improvement: 0, totalAttempts: 0 };

    try {
      const { data, error } = await supabase
        .from('user_test_results')
        .select('is_correct, created_at')
        .eq('user_id', user.id)
        .eq('subject_category', subjectCategory)
        .order('created_at', { ascending: true });

      if (error || !data?.length) {
        return { accuracy: 0, improvement: 0, totalAttempts: 0 };
      }

      const totalCorrect = data.filter(r => r.is_correct).length;
      const overallAccuracy = (totalCorrect / data.length) * 100;

      // 最近の10問と最初の10問を比較して改善度を計算
      const recentResults = data.slice(-10);
      const earlyResults = data.slice(0, 10);

      const recentAccuracy = earlyResults.length >= 10 
        ? (recentResults.filter(r => r.is_correct).length / recentResults.length) * 100
        : overallAccuracy;
      
      const earlyAccuracy = earlyResults.length >= 10
        ? (earlyResults.filter(r => r.is_correct).length / earlyResults.length) * 100
        : overallAccuracy;

      const improvement = recentAccuracy - earlyAccuracy;

      return {
        accuracy: Math.round(overallAccuracy),
        improvement: Math.round(improvement),
        totalAttempts: data.length
      };
    } catch (error) {
      console.error('Error calculating progress:', error);
      return { accuracy: 0, improvement: 0, totalAttempts: 0 };
    }
  }, [user]);

  return {
    isLoading,
    currentSession,
    startTestSession,
    recordTestResult,
    getWeakAreas,
    getTestHistory,
    calculateProgress
  };
}; 