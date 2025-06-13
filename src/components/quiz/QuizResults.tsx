import React, { useState, useEffect } from 'react';
import { QuizResult, QuizAnswer } from '../../types/quiz';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import supabase from '../../utils/supabase';

interface QuizResultsProps {
  sessionId: string;
  onBackToSelection: () => void;
  onRestartQuiz: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  sessionId,
  onBackToSelection,
  onRestartQuiz
}) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [results, setResults] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateResults = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error('ユーザー情報が見つかりません');
        }

        // 最近の学習記録を取得（セッションIDの代わりに時間ベースで取得）
        const recentTime = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10分前

        const { data: learningRecords, error: recordsError } = await supabase
          .from('learning_records')
          .select(`
            *,
            question:questions(
              *,
              deck:card_decks(
                *,
                category:question_categories(*)
              )
            )
          `)
          .eq('user_id', user.id)
          .gte('created_at', recentTime)
          .order('created_at', { ascending: false });

        if (recordsError) throw recordsError;

        if (!learningRecords || learningRecords.length === 0) {
          throw new Error('学習記録が見つかりません');
        }

        // 結果を計算
        const totalQuestions = learningRecords.length;
        const correctAnswers = learningRecords.filter(record => record.is_correct).length;
        const incorrectAnswers = totalQuestions - correctAnswers;
        const scorePercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

        // 回答時間の計算
        const totalTime = learningRecords.reduce((sum, record) => 
          sum + (record.response_time_ms || 0), 0);
        const averageTime = totalQuestions > 0 ? totalTime / totalQuestions : 0;

        // 難易度別統計
        const difficultyBreakdown = {
          easy: { correct: 0, total: 0 },
          medium: { correct: 0, total: 0 },
          hard: { correct: 0, total: 0 }
        };

        // カテゴリ別統計
        const categoryBreakdown: { [key: string]: { correct: number; total: number } } = {};

        learningRecords.forEach(record => {
          if (record.question?.difficulty_level) {
            const difficulty = record.question.difficulty_level as 'easy' | 'medium' | 'hard';
            difficultyBreakdown[difficulty].total++;
            if (record.is_correct) {
              difficultyBreakdown[difficulty].correct++;
            }
          }

          const categoryName = record.question?.deck?.category?.name;
          if (categoryName) {
            if (!categoryBreakdown[categoryName]) {
              categoryBreakdown[categoryName] = { correct: 0, total: 0 };
            }
            categoryBreakdown[categoryName].total++;
            if (record.is_correct) {
              categoryBreakdown[categoryName].correct++;
            }
          }
        });

        // QuizAnswerに変換
        const answers: QuizAnswer[] = learningRecords.map((record) => ({
          question_id: record.question_id,
          selected_option_index: record.is_correct ? record.question?.correct_option_index || 0 : -1,
          is_correct: record.is_correct,
          response_time_ms: record.response_time_ms || 0,
          marked_for_review: record.marked_status === 'checked'
        }));

        const calculatedResults: QuizResult = {
          session_id: sessionId,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          incorrect_answers: incorrectAnswers,
          score_percentage: scorePercentage,
          total_time_ms: totalTime,
          average_time_per_question: averageTime,
          answers,
          difficulty_breakdown: difficultyBreakdown,
          category_breakdown: categoryBreakdown
        };

        setResults(calculatedResults);
      } catch (err) {
        console.error('Failed to calculate results:', err);
        setError(err instanceof Error ? err.message : '結果の計算に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    calculateResults();
  }, [sessionId, user]);

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`;
    }
    return `${remainingSeconds}秒`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'S';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    return 'D';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">結果を計算しています...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-lg p-6`}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            エラーが発生しました
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={onBackToSelection}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* メイン結果カード */}
      <div className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-lg p-8 text-center`}>
        <div className="mb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl font-bold ${
            results.score_percentage >= 80 
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : results.score_percentage >= 60
              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {getGrade(results.score_percentage)}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          クイズ完了！
        </h2>
        
        <p className={`text-4xl font-bold mb-4 ${getScoreColor(results.score_percentage)}`}>
          {Math.round(results.score_percentage)}%
        </p>
        
        <p className="text-gray-600 dark:text-gray-300">
          {results.correct_answers} / {results.total_questions} 問正解
        </p>
      </div>

      {/* 詳細統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本統計 */}
        <div className={`${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow p-6`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            基本統計
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">総問題数:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {results.total_questions}問
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">正解数:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {results.correct_answers}問
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">不正解数:</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {results.incorrect_answers}問
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">総時間:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatTime(results.total_time_ms)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">平均時間:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatTime(results.average_time_per_question)}
              </span>
            </div>
          </div>
        </div>

        {/* 難易度別統計 */}
        <div className={`${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow p-6`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            難易度別成績
          </h3>
          <div className="space-y-3">
            {Object.entries(results.difficulty_breakdown).map(([level, stats]) => {
              if (stats.total === 0) return null;
              const percentage = (stats.correct / stats.total) * 100;
              const levelLabel = level === 'easy' ? '初級' : level === 'medium' ? '中級' : '上級';
              
              return (
                <div key={level}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {levelLabel}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.correct}/{stats.total} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className={`h-2 rounded-full ${
                        percentage >= 80 ? 'bg-green-500' :
                        percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* カテゴリ別統計 */}
      {Object.keys(results.category_breakdown).length > 0 && (
        <div className={`${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow p-6`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            カテゴリ別成績
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(results.category_breakdown).map(([category, stats]) => {
              const percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {stats.correct}/{stats.total}
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className={`h-2 rounded-full ${
                        percentage >= 80 ? 'bg-green-500' :
                        percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                    {Math.round(percentage)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onRestartQuiz}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          もう一度挑戦
        </button>
        <button
          onClick={onBackToSelection}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          別のクイズを選択
        </button>
      </div>
    </div>
  );
};

export default QuizResults; 