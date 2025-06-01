import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { QuizSettings, Question } from '../../types/quiz';
import supabase from '../../lib/supabase';
import DeckSelector from '../quiz/DeckSelector';
import QuizSession from '../quiz/QuizSession';
import QuizResults from '../quiz/QuizResults';

interface ExamTabState {
  phase: 'selection' | 'quiz' | 'results';
  sessionId: string | null;
}

const ExamTab: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [state, setState] = useState<ExamTabState>({ phase: 'selection', sessionId: null });
  const [settings, setSettings] = useState<QuizSettings | null>(null);

  // 認証チェック
  useEffect(() => {
    if (!user) {
      setState({ phase: 'selection', sessionId: null });
    }
  }, [user]);

  const handleStartQuiz = (quizSettings: QuizSettings) => {
    setSettings(quizSettings);
    setState({ phase: 'quiz', sessionId: null });
  };

  const handleQuizComplete = (sessionId: string) => {
    setState({ phase: 'results', sessionId });
  };

  const handleBackToSelection = () => {
    setState({ phase: 'selection', sessionId: null });
    setSettings(null);
  };

  const handleStartNewQuiz = () => {
    setState({ phase: 'selection', sessionId: null });
    setSettings(null);
  };

  // 認証が必要な旨を表示
  if (!user) {
    return (
      <div className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      } flex items-center justify-center p-4`}>
        <div className={`${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow-lg p-8 max-w-md w-full text-center`}>
          <div className="mb-6">
            <svg className="mx-auto h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            実技試験問題
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            実技試験問題にアクセスするには、まずログインしてください。
          </p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ログインページへ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    } py-4 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            実技試験問題
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            航空実技試験対策のための4択問題演習システム
          </p>
        </div>

        {state.phase === 'selection' && (
          <DeckSelector onStartQuiz={handleStartQuiz} />
        )}

        {state.phase === 'quiz' && settings && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToSelection}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                問題選択に戻る
              </button>
            </div>
            <QuizSession
              settings={settings}
              onComplete={handleQuizComplete}
            />
          </div>
        )}

        {state.phase === 'results' && state.sessionId && (
          <QuizResults
            sessionId={state.sessionId}
            onStartNewQuiz={handleStartNewQuiz}
            onBackToSelection={handleBackToSelection}
          />
        )}
      </div>
    </div>
  );
};

export default ExamTab; 
