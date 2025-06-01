import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { QuestionCategory, CardDeck, QuizSettings } from '../types/quiz';
import DeckSelector from '../components/quiz/DeckSelector';
import QuizSession from '../components/quiz/QuizSession';
import QuizResults from '../components/quiz/QuizResults';
import { useTheme } from '../contexts/ThemeContext';

type TestPageState = 'selection' | 'quiz' | 'results';

const TestPage: React.FC = () => {
  const { theme } = useTheme();
  const { user, profile } = useAuthStore();
  const [currentState, setCurrentState] = useState<TestPageState>('selection');
  const [selectedSettings, setSelectedSettings] = useState<QuizSettings | null>(null);
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null);

  // 認証確認
  useEffect(() => {
    if (!user) {
      // 未認証の場合は認証ページにリダイレクトする処理を追加可能
      console.warn('User not authenticated');
    }
  }, [user]);

  const handleStartQuiz = (settings: QuizSettings) => {
    setSelectedSettings(settings);
    setCurrentState('quiz');
  };

  const handleQuizComplete = (sessionId: string) => {
    setQuizSessionId(sessionId);
    setCurrentState('results');
  };

  const handleBackToSelection = () => {
    setCurrentState('selection');
    setSelectedSettings(null);
    setQuizSessionId(null);
  };

  const handleRestartQuiz = () => {
    if (selectedSettings) {
      setCurrentState('quiz');
      setQuizSessionId(null);
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">ログインが必要です</h3>
          <p className="text-gray-500 mb-4">クイズを開始するにはログインしてください。</p>
          <a 
            href="/auth" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ログインページへ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                4択問題クイズ
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                航空知識をテストして、学習効果を高めましょう
              </p>
            </div>
            
            {/* ユーザー情報表示 */}
            <div className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } rounded-lg shadow p-4`}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {profile?.full_name || profile?.username || 'ユーザー'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {profile?.roll || 'Student'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="max-w-4xl mx-auto">
          {currentState === 'selection' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  クイズ設定
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  学習したいカテゴリとデッキを選択してください
                </p>
              </div>
              <DeckSelector onStartQuiz={handleStartQuiz} />
            </div>
          )}

          {currentState === 'quiz' && selectedSettings && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  クイズ実行中
                </h2>
                <button
                  onClick={handleBackToSelection}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  戻る
                </button>
              </div>
              <QuizSession 
                settings={selectedSettings} 
                onComplete={handleQuizComplete} 
              />
            </div>
          )}

          {currentState === 'results' && quizSessionId && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  クイズ結果
                </h2>
                <div className="space-x-2">
                  <button
                    onClick={handleRestartQuiz}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    もう一度
                  </button>
                  <button
                    onClick={handleBackToSelection}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    別のクイズを選択
                  </button>
                </div>
              </div>
              <QuizResults 
                sessionId={quizSessionId} 
                onBackToSelection={handleBackToSelection}
                onRestartQuiz={handleRestartQuiz}
              />
            </div>
          )}
        </div>

        {/* フッター情報 */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              FlightAcademy 4択問題システム - あなたの航空知識向上をサポートします
            </p>
            <div className="mt-2 flex justify-center space-x-4">
              <span>📚 学習</span>
              <span>🎯 復習</span>
              <span>📊 分析</span>
              <span>🏆 成長</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 