import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import supabase from '../../utils/supabase';
import { useGamification } from '../../hooks/useGamification';

interface CPLQuestion {
  id: string;
  main_subject: string;
  sub_subject: string;
  question_text: string;
  options: { number: number; text: string }[];
  correct_answer: number;
  explanation?: string;
  difficulty_level?: number;
  importance_score?: number;
}

interface CPLExamSettings {
  subjects: string[];
  questionCount: number;
  timeLimitMinutes: number;
  shuffleQuestions: boolean;
  reviewMode: boolean;
}

interface CPLExamSessionProps {
  settings: CPLExamSettings;
  onComplete: (sessionId: string) => void;
  onBack: () => void;
}

interface UserAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

const CPLExamSession: React.FC<CPLExamSessionProps> = ({ settings, onComplete, onBack }) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { completeMissionByAction } = useGamification();

  const [questions, setQuestions] = useState<CPLQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [examStartTime] = useState<Date>(new Date());

  // 問題を読み込み
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);

        // 科目フィルターを作成
        const subjectFilters = settings.subjects.map(subject => {
          const [main_subject, sub_subject] = subject.split('::');
          return { main_subject, sub_subject };
        });

        let query = supabase
          .from('unified_cpl_questions')
          .select('*')
          .eq('verification_status', 'verified');

        // 複数科目の条件をORで結合
        if (subjectFilters.length > 0) {
          const orConditions = subjectFilters.map(filter =>
            `and(main_subject.eq.${filter.main_subject},sub_subject.eq.${filter.sub_subject})`
          ).join(',');
          query = query.or(orConditions);
        }

        const { data, error } = await query.limit(settings.questionCount * 2); // 余裕を持って取得

        if (error) throw error;

        let selectedQuestions = data || [];

        // 問題数を調整
        if (selectedQuestions.length > settings.questionCount) {
          if (settings.shuffleQuestions) {
            selectedQuestions = selectedQuestions
              .sort(() => Math.random() - 0.5)
              .slice(0, settings.questionCount);
          } else {
            selectedQuestions = selectedQuestions.slice(0, settings.questionCount);
          }
        }

        // 選択肢をパース
        const parsedQuestions: CPLQuestion[] = selectedQuestions.map(q => ({
          ...q,
          options: Array.isArray(q.options)
            ? q.options.map((opt: string | { text: string } | { number: number; text: string }, idx: number) => ({
                number: idx + 1,
                text: typeof opt === 'string' ? opt : ('text' in opt ? opt.text : String(opt))
              }))
            : []
        }));

        setQuestions(parsedQuestions);
        setTimeRemaining(settings.timeLimitMinutes * 60);
        setQuestionStartTime(new Date());
      } catch (err) {
        console.error('Failed to load questions:', err);
        setError('問題の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [settings]);

  // タイマー
  useEffect(() => {
    if (timeRemaining <= 0 || loading) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, loading]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || isAnswered) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer - 1; // correct_answer is 1-based, convert to 0-based
    const timeSpent = Date.now() - questionStartTime.getTime();

    const answer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeSpent
    };

    setUserAnswers(prev => [...prev, answer]);
    setIsAnswered(true);

    if (settings.reviewMode) {
      setShowExplanation(true);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
      setQuestionStartTime(new Date());
    } else {
      finishExam();
    }
  };

  const finishExam = useCallback(async () => {
    try {
      if (!user) return;

      // 科目別結果を計算
      const subjectBreakdown = settings.subjects.reduce((acc, subject) => {
        const subjectAnswers = userAnswers.filter(answer => {
          const question = questions.find(q => q.id === answer.questionId);
          return question && `${question.main_subject}::${question.sub_subject}` === subject;
        });
        acc[subject] = {
          attempted: subjectAnswers.length,
          correct: subjectAnswers.filter(a => a.isCorrect).length,
          percentage: subjectAnswers.length > 0 ? (subjectAnswers.filter(a => a.isCorrect).length / subjectAnswers.length) * 100 : 0
        };
        return acc;
      }, {} as Record<string, { attempted: number; correct: number; percentage: number }>);

      const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
      const scorePercentage = userAnswers.length > 0 ? (correctAnswers / userAnswers.length) * 100 : 0;

      // 試験結果をデータベースに保存
      const examResult = {
        user_id: user.id,
        session_type: 'cpl_exam',
        questions_attempted: userAnswers.length,
        questions_correct: correctAnswers,
        total_time_spent: Math.floor((Date.now() - examStartTime.getTime()) / 1000), // 秒単位
        settings: settings,
        answers: userAnswers,
        completed_at: new Date().toISOString(),
        is_completed: true,
        score_percentage: scorePercentage,
        subject_breakdown: subjectBreakdown
      };

      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert(examResult)
        .select()
        .single();

      if (error) throw error;

      // ミッション達成をチェック
      try {
        await completeMissionByAction('quiz_pass');
      } catch (missionError) {
        // ミッション達成の失敗は致命的ではないためログのみ
        console.warn('Mission completion check failed:', missionError);
      }

      onComplete(data.id);
    } catch (err) {
      console.error('Failed to save exam results:', err);
      // エラーでも結果画面に進む
      onComplete('temp-session-id');
    }
  }, [user, userAnswers, examStartTime, settings, onComplete, completeMissionByAction]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">選択した条件に合う問題が見つかりませんでした</div>
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              問題 {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {currentQuestion.main_subject} - {currentQuestion.sub_subject}
            </span>
          </div>
          <div className="text-lg font-mono text-gray-900 dark:text-white">
            残り時間: {formatTime(timeRemaining)}
          </div>
        </div>

        {/* プログレスバー */}
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* 問題文 */}
      <div className="mb-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
          {currentQuestion.question_text}
        </h2>
      </div>

      {/* 選択肢 */}
      <div className="mb-6 space-y-3">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            disabled={isAnswered}
            className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
              selectedAnswer === index
                ? isAnswered
                  ? index === currentQuestion.correct_answer - 1
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : isAnswered && index === currentQuestion.correct_answer - 1
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
            } ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center">
              <span className="font-medium text-gray-900 dark:text-white mr-3">
                ({option.number})
              </span>
              <span className="text-gray-900 dark:text-white">
                {option.text}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 解説 */}
      {showExplanation && currentQuestion.explanation && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">解説</h3>
          <p className="text-blue-800 dark:text-blue-200">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* ボタン */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          試験を終了
        </button>

        <div className="space-x-3">
          {!isAnswered && selectedAnswer !== null && (
            <button
              onClick={submitAnswer}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              解答する
            </button>
          )}

          {isAnswered && (
            <button
              onClick={nextQuestion}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {currentQuestionIndex < questions.length - 1 ? '次の問題' : '試験終了'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CPLExamSession;
