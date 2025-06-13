import React, { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '../../utils/supabase';
import { Database } from '../../types/database.types';
import { useAuthStore } from '../../stores/authStore';

type QuizQuestionRow = Database['public']['Tables']['quiz_questions']['Row'];
type UserQuizResultInsert = Database['public']['Tables']['user_quiz_results']['Insert'];

export interface AdaptedQuizQuestion {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizDatabaseAdapterProps {
  category?: string;
  questionCount?: number;
  onQuestionsLoaded: (questions: AdaptedQuizQuestion[]) => void;
  onError: (error: string) => void;
}

export interface QuizResultSubmission {
  questionId: number;
  isCorrect: boolean;
  selectedAnswer: number;
  timeSpent?: number;
}

export const QuizDatabaseAdapter: React.FC<QuizDatabaseAdapterProps> = ({
  category,
  questionCount = 10,
  onQuestionsLoaded,
  onError
}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const supabase = createBrowserSupabaseClient();
      
      let query = supabase
        .from('quiz_questions')
        .select('*');

      // カテゴリフィルター
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`問題の読み込みに失敗しました: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('問題が見つかりませんでした');
      }

      // データを適応
      const adaptedQuestions: AdaptedQuizQuestion[] = data
        .filter(q => q.question && q.answer1 && q.answer2 && q.answer3 && q.answer4 && q.correct !== null && q.correct >= 0 && q.correct <= 4)
        .map(q => ({
          id: q.id,
          category: q.category,
          question: q.question!,
          options: [q.answer1!, q.answer2!, q.answer3!, q.answer4!],
          correctAnswer: q.correct! > 3 ? q.correct! - 1 : q.correct!, // Handle both 0-based and 1-based
          explanation: q.explanation || '解説がありません'
        }))
        .sort(() => Math.random() - 0.5) // シャッフル
        .slice(0, questionCount); // 指定数に制限

      onQuestionsLoaded(adaptedQuestions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const submitQuizResults = async (results: QuizResultSubmission[]): Promise<boolean> => {
    if (!user) {
      console.warn('ユーザーがログインしていないため、結果を保存できません');
      return false;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const insertData: UserQuizResultInsert[] = results.map(result => ({
        user_id: user.id,
        question_id: result.questionId,
        category: undefined, // クエリで取得可能
        is_correct: result.isCorrect,
        answered_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('user_quiz_results')
        .insert(insertData);

      if (error) {
        console.error('クイズ結果の保存に失敗しました:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('クイズ結果の保存中にエラーが発生しました:', err);
      return false;
    }
  };

  const getAvailableCategories = async (): Promise<string[]> => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      const categories = [...new Set(data.map(item => item.category))].sort();
      return categories;
    } catch (err) {
      console.error('カテゴリの取得に失敗しました:', err);
      return [];
    }
  };

  const getUserQuizHistory = async () => {
    if (!user) return null;

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from('user_quiz_results')
        .select(`
          *,
          quiz_questions (
            category,
            question
          )
        `)
        .eq('user_id', user.id)
        .order('answered_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('ユーザーのクイズ履歴の取得に失敗しました:', err);
      return null;
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [category, questionCount]);

  // このコンポーネントは主にロジックを提供するため、UIは最小限
  return (
    <div className="quiz-database-adapter">
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span className="ml-2 text-gray-600">問題を読み込んでいます...</span>
        </div>
      )}
    </div>
  );
};

// カスタムフック版
export const useQuizDatabase = () => {
  const { user } = useAuthStore();

  // データ品質チェック機能を追加
  const getDataQualityReport = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // 全問題数
      const { data: allQuestions, error: allError } = await supabase
        .from('quiz_questions')
        .select('id, correct')
        .not('question', 'is', null);

      if (allError) throw allError;

      // 有効な問題数
      const { data: validQuestions, error: validError } = await supabase
        .from('quiz_questions')
        .select('id')
        .not('question', 'is', null)
        .not('answer1', 'is', null)
        .not('answer2', 'is', null)
        .not('answer3', 'is', null)
        .not('answer4', 'is', null)
        .gte('correct', 0)
        .lte('correct', 4);

      if (validError) throw validError;

      // 無効な正解値を持つ問題
      const invalidCorrectCount = allQuestions?.filter(q => q.correct === null || q.correct < 0 || q.correct > 4).length || 0;

      return {
        totalQuestions: allQuestions?.length || 0,
        validQuestions: validQuestions?.length || 0,
        invalidCorrectCount,
        dataQuality: validQuestions?.length ? (validQuestions.length / allQuestions!.length * 100).toFixed(1) : '0'
      };
    } catch (err) {
      console.error('データ品質レポートの取得に失敗しました:', err);
      return null;
    }
  };

  const loadQuestionsByCategory = async (category?: string, count: number = 10): Promise<AdaptedQuizQuestion[]> => {
    const supabase = createBrowserSupabaseClient();
    let query = supabase
      .from('quiz_questions')
      .select('*');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`問題の読み込みに失敗しました: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('問題が見つかりませんでした');
    }

    const validQuestions = data
      .filter(q => q.question && q.answer1 && q.answer2 && q.answer3 && q.answer4 && q.correct !== null && q.correct >= 0 && q.correct <= 4)
      .map(q => ({
        id: q.id,
        category: q.category,
        question: q.question!,
        options: [q.answer1!, q.answer2!, q.answer3!, q.answer4!],
        correctAnswer: q.correct! > 3 ? q.correct! - 1 : q.correct!, // Handle both 0-based and 1-based
        explanation: q.explanation || '解説がありません'
      }))
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    if (validQuestions.length === 0) {
      throw new Error('指定された条件に合う有効な問題が見つかりませんでした');
    }

    return validQuestions;
  };

  const saveQuizResults = async (results: QuizResultSubmission[]): Promise<boolean> => {
    if (!user) return false;

    try {
      const supabase = createBrowserSupabaseClient();
      const insertData: UserQuizResultInsert[] = results.map(result => ({
        user_id: user.id,
        question_id: result.questionId,
        is_correct: result.isCorrect,
        answered_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('user_quiz_results')
        .insert(insertData);

      return !error;
    } catch (err) {
      console.error('クイズ結果の保存中にエラーが発生しました:', err);
      return false;
    }
  };

  const getCategories = async (): Promise<string[]> => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      return [...new Set(data.map(item => item.category))].sort();
    } catch (err) {
      console.error('カテゴリの取得に失敗しました:', err);
      return [];
    }
  };

  const getUserStats = async () => {
    if (!user) return null;

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from('user_quiz_results')
        .select(`
          *,
          quiz_questions (
            category
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // 統計を計算
      const totalAnswered = data.length;
      const correctAnswers = data.filter(result => result.is_correct).length;
      const accuracy = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;

      // カテゴリ別統計
      const categoryStats = data.reduce((acc, result) => {
        const category = result.quiz_questions?.category || '不明';
        if (!acc[category]) {
          acc[category] = { total: 0, correct: 0 };
        }
        acc[category].total++;
        if (result.is_correct) {
          acc[category].correct++;
        }
        return acc;
      }, {} as Record<string, { total: number; correct: number }>);

      return {
        totalAnswered,
        correctAnswers,
        accuracy,
        categoryStats
      };
    } catch (err) {
      console.error('ユーザー統計の取得に失敗しました:', err);
      return null;
    }
  };

  return {
    loadQuestionsByCategory,
    saveQuizResults,
    getCategories,
    getUserStats,
    getDataQualityReport
  };
};

export default QuizDatabaseAdapter; 