import React, { useState, useEffect, useCallback } from 'react';
import { QuizSettings, Question, QuizAnswer, QuizResult } from '../../types/quiz';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import supabase from '../../lib/supabase';
import QuestionDisplay from './QuestionDisplay';
import Timer from './Timer';
import ProgressBar from './ProgressBar';

interface QuizSessionProps {
  settings: QuizSettings;
  onComplete: (sessionId: string) => void;
}

const QuizSession: React.FC<QuizSessionProps> = ({ settings, onComplete }) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  
  // セッション状態
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState(new Date());
  const [questionStartTime, setQuestionStartTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState(settings.time_limit_minutes ? settings.time_limit_minutes * 60 : 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 問題を読み込み
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        // デッキから問題を取得
        let query = supabase
          .from('questions')
          .select('*')
          .eq('deck_id', settings.deck_id);

        // 難易度フィルター
        if (settings.difficulty_levels && settings.difficulty_levels.length > 0) {
          query = query.in('difficulty_level', settings.difficulty_levels);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (!data || data.length === 0) {
          throw new Error('選択したデッキに問題が見つかりません');
        }

        let selectedQuestions = [...data];

        // 問題をシャッフル
        if (settings.shuffle_questions) {
          selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
        }

        // 問題数制限
        if (settings.question_count && settings.question_count < selectedQuestions.length) {
          selectedQuestions = selectedQuestions.slice(0, settings.question_count);
        }

        // 選択肢をシャッフル（オプション）
        if (settings.shuffle_options) {
          selectedQuestions = selectedQuestions.map(q => {
            const shuffledOptions = [...q.options];
            const correctOption = q.options[q.correct_option_index];
            
            // Fisher-Yates shuffle
            for (let i = shuffledOptions.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
            }
            
            return {
              ...q,
              options: shuffledOptions,
              correct_option_index: shuffledOptions.indexOf(correctOption)
            };
          });
        }

        setQuestions(selectedQuestions);
        setQuestionStartTime(new Date());
      } catch (err) {
        console.error('Failed to load questions:', err);
        setError(err instanceof Error ? err.message : '問題の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [settings]);

  // タイマー処理
  useEffect(() => {
    if (!settings.time_limit_minutes || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, settings.time_limit_minutes]);

  const handleTimeUp = useCallback(() => {
    // 時間切れの場合、現在の問題を不正解として処理
    if (!isAnswered) {
      const currentQuestion = questions[currentQuestionIndex];
      const responseTime = Date.now() - questionStartTime.getTime();
      
      const answer: QuizAnswer = {
        question_id: currentQuestion.id,
        selected_option_index: -1, // 未選択
        is_correct: false,
        response_time_ms: responseTime,
        marked_for_review: false
      };

      setAnswers(prev => [...prev, answer]);
      setIsAnswered(true);
      
      // 最終問題の場合はクイズ終了
      if (currentQuestionIndex === questions.length - 1) {
        setTimeout(() => finishQuiz(), 2000);
      }
    }
  }, [isAnswered, questions, currentQuestionIndex, questionStartTime]);

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOptionIndex(optionIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedOptionIndex === null || isAnswered) return;

    const currentQuestion = questions[currentQuestionIndex];
    const responseTime = Date.now() - questionStartTime.getTime();
    const isCorrect = selectedOptionIndex === currentQuestion.correct_option_index;

    const answer: QuizAnswer = {
      question_id: currentQuestion.id,
      selected_option_index: selectedOptionIndex,
      is_correct: isCorrect,
      response_time_ms: responseTime,
      marked_for_review: false
    };

    setAnswers(prev => [...prev, answer]);
    setIsAnswered(true);
    setShowExplanation(true);

    // 学習記録をデータベースに保存
    if (user) {
      try {
        await supabase
          .from('learning_records')
          .insert({
            user_id: user.id,
            question_id: currentQuestion.id,
            attempt_number: 1, // 簡単のため1固定
            is_correct: isCorrect,
            response_time_ms: responseTime
          });
      } catch (err) {
        console.error('Failed to save learning record:', err);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
      setShowExplanation(false);
      setQuestionStartTime(new Date());
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    onComplete(sessionId);
  };

  const markForReview = () => {
    if (answers.length > 0) {
      const updatedAnswers = [...answers];
      updatedAnswers[updatedAnswers.length - 1].marked_for_review = true;
      setAnswers(updatedAnswers);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">問題を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-lg p-6`}>
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">エラーが発生しました</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-lg p-6`}>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">問題が見つかりませんでした。</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* ヘッダー情報 */}
      <div className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              問題 {currentQuestionIndex + 1} / {questions.length}
            </span>
            {settings.time_limit_minutes && (
              <Timer 
                timeRemaining={timeRemaining} 
                totalTime={settings.time_limit_minutes * 60}
              />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isAnswered && (
              <button
                onClick={markForReview}
                className="px-3 py-1 text-sm border border-yellow-300 text-yellow-700 rounded hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
              >
                復習マーク
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-2">
          <ProgressBar progress={progress} />
        </div>
      </div>

      {/* 問題表示 */}
      <QuestionDisplay
        question={currentQuestion}
        selectedOptionIndex={selectedOptionIndex}
        isAnswered={isAnswered}
        showExplanation={showExplanation}
        onOptionSelect={handleOptionSelect}
      />

      {/* アクションボタン */}
      <div className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow p-4`}>
        <div className="flex justify-between items-center">
          <div>
            {showExplanation && (
              <p className={`text-sm ${
                answers[answers.length - 1]?.is_correct 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {answers[answers.length - 1]?.is_correct ? '正解！' : '不正解'}
              </p>
            )}
          </div>
          
          <div className="space-x-3">
            {!isAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOptionIndex === null}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                解答する
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {currentQuestionIndex < questions.length - 1 ? '次の問題' : '結果を見る'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSession; 