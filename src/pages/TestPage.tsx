import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { QuestionCategory, CardDeck, QuizSettings } from '../types/quiz';
import DeckSelector from '../components/quiz/DeckSelector';
import QuizSession from '../components/quiz/QuizSession';
import QuizResults from '../components/quiz/QuizResults';
import { useTheme } from '../contexts/ThemeContext';
import { useQuizDatabase, AdaptedQuizQuestion, QuizResultSubmission } from '../components/quiz/QuizDatabaseAdapter';

type TestPageState = 'selection' | 'quiz' | 'results' | 'enhanced-quiz';

interface EnhancedQuizState {
  currentQuestionIndex: number;
  selectedAnswers: number[];
  isAnswered: boolean;
  showExplanation: boolean;
  startTime: Date;
  questionStartTime: Date;
}

const TestPage: React.FC = () => {
  const { theme } = useTheme();
  const { user, profile } = useAuthStore();
  const { loadQuestionsByCategory, saveQuizResults, getCategories, getUserStats, getDataQualityReport } = useQuizDatabase();
  
  // 既存のstate
  const [currentState, setCurrentState] = useState<TestPageState>('selection');
  const [selectedSettings, setSelectedSettings] = useState<QuizSettings | null>(null);
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null);

  // 新しいクイズ機能のstate
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [enhancedQuestions, setEnhancedQuestions] = useState<AdaptedQuizQuestion[]>([]);
  const [enhancedQuizState, setEnhancedQuizState] = useState<EnhancedQuizState>({
    currentQuestionIndex: 0,
    selectedAnswers: [],
    isAnswered: false,
    showExplanation: false,
    startTime: new Date(),
    questionStartTime: new Date()
  });
  const [enhancedQuizResults, setEnhancedQuizResults] = useState<QuizResultSubmission[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 認証確認
  useEffect(() => {
    if (!user) {
      console.warn('User not authenticated');
    }
  }, [user]);

  // 新しいクイズ機能の初期化
  useEffect(() => {
    const initializeEnhancedQuiz = async () => {
      try {
        setLoading(true);
        const [categories, stats, quality] = await Promise.all([
          getCategories(),
          getUserStats(),
          getDataQualityReport()
        ]);
        setAvailableCategories(categories);
        setUserStats(stats);
        setDataQuality(quality);
      } catch (err) {
        setError('データの初期化に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializeEnhancedQuiz();
    }
  }, [user]);

  // 既存のクイズ機能
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
    setError('');
  };

  const handleRestartQuiz = () => {
    if (selectedSettings) {
      setCurrentState('quiz');
      setQuizSessionId(null);
    }
  };

  // 新しいクイズ機能
  const startEnhancedQuiz = async () => {
    try {
      setLoading(true);
      setError('');
      
      const loadedQuestions = await loadQuestionsByCategory(
        selectedCategory || undefined, 
        questionCount
      );
      
      if (loadedQuestions.length === 0) {
        throw new Error('指定された条件に合う問題が見つかりませんでした');
      }

      setEnhancedQuestions(loadedQuestions);
      setEnhancedQuizState({
        currentQuestionIndex: 0,
        selectedAnswers: new Array(loadedQuestions.length).fill(-1),
        isAnswered: false,
        showExplanation: false,
        startTime: new Date(),
        questionStartTime: new Date()
      });
      setEnhancedQuizResults([]);
      setCurrentState('enhanced-quiz');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'クイズの開始に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (answerIndex: number) => {
    if (enhancedQuizState.isAnswered) return;

    const newSelectedAnswers = [...enhancedQuizState.selectedAnswers];
    newSelectedAnswers[enhancedQuizState.currentQuestionIndex] = answerIndex;
    
    setEnhancedQuizState(prev => ({
      ...prev,
      selectedAnswers: newSelectedAnswers
    }));
  };

  const submitAnswer = () => {
    if (enhancedQuizState.isAnswered) return;

    const currentQuestion = enhancedQuestions[enhancedQuizState.currentQuestionIndex];
    const selectedAnswer = enhancedQuizState.selectedAnswers[enhancedQuizState.currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const timeSpent = Date.now() - enhancedQuizState.questionStartTime.getTime();

    const result: QuizResultSubmission = {
      questionId: currentQuestion.id,
      isCorrect,
      selectedAnswer,
      timeSpent
    };

    setEnhancedQuizResults(prev => [...prev, result]);
    setEnhancedQuizState(prev => ({
      ...prev,
      isAnswered: true,
      showExplanation: true
    }));
  };

  const nextQuestion = () => {
    if (enhancedQuizState.currentQuestionIndex < enhancedQuestions.length - 1) {
      setEnhancedQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        isAnswered: false,
        showExplanation: false,
        questionStartTime: new Date()
      }));
    } else {
      finishEnhancedQuiz();
    }
  };

  const finishEnhancedQuiz = async () => {
    try {
      await saveQuizResults(enhancedQuizResults);
      const updatedStats = await getUserStats();
      setUserStats(updatedStats);
      setCurrentState('results');
    } catch (err) {
      console.error('結果の保存に失敗しました:', err);
      setCurrentState('results');
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
                🛩️ 航空知識クイズ
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

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="max-w-4xl mx-auto">
          {currentState === 'selection' && (
            <div className="space-y-8">
              {/* ユーザー統計 */}
              {userStats && (
                <div className={`${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } rounded-lg shadow-lg p-6`}>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    📊 あなたの学習統計
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                        {userStats.totalAnswered}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">総回答数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {userStats.correctAnswers}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">正解数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {userStats.accuracy.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">正答率</div>
                    </div>
                  </div>
                </div>
              )}

              {/* クイズタイプ選択 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 新しいクイズ機能 */}
                <div className={`${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } rounded-lg shadow-lg p-6`}>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    🚀 515問クイズ（推奨）
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    データベースの515問から出題される本格的なクイズです。カテゴリ別学習や進捗管理が可能です。
                  </p>
                  
                  <div className="space-y-4">
                    {/* カテゴリ選択 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        📚 カテゴリ選択
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">すべてのカテゴリ</option>
                        {availableCategories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 問題数設定 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        📝 問題数: {questionCount}問
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>5問</span>
                        <span>50問</span>
                      </div>
                    </div>

                    <button
                      onClick={startEnhancedQuiz}
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {loading ? '✈️ 準備中...' : '🚀 クイズを開始'}
                    </button>
                  </div>
                </div>

                {/* 既存のクイズ機能 */}
                <div className={`${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } rounded-lg shadow-lg p-6`}>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    📋 従来のクイズ
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    デッキベースのクイズシステムです。詳細な設定とタイマー機能が利用できます。
                  </p>
                  <DeckSelector onStartQuiz={handleStartQuiz} />
                </div>
              </div>
            </div>
          )}

          {/* 新しいクイズ画面 */}
          {currentState === 'enhanced-quiz' && enhancedQuestions.length > 0 && (
            <div className="space-y-6">
              {/* プログレスバー */}
              <div className={`${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } rounded-lg shadow p-4`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    問題 {enhancedQuizState.currentQuestionIndex + 1} / {enhancedQuestions.length}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {enhancedQuestions[enhancedQuizState.currentQuestionIndex].category}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${((enhancedQuizState.currentQuestionIndex + 1) / enhancedQuestions.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* 問題カード */}
              <div className={`${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } rounded-lg shadow-lg p-8`}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-relaxed">
                    {enhancedQuestions[enhancedQuizState.currentQuestionIndex].question}
                  </h2>
                </div>

                {/* 選択肢 */}
                <div className="space-y-3 mb-6">
                  {enhancedQuestions[enhancedQuizState.currentQuestionIndex].options.map((option, index) => {
                    const isSelected = enhancedQuizState.selectedAnswers[enhancedQuizState.currentQuestionIndex] === index;
                    const isCorrect = index === enhancedQuestions[enhancedQuizState.currentQuestionIndex].correctAnswer;
                    const isWrongSelection = enhancedQuizState.isAnswered && isSelected && !isCorrect;
                    
                    let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ";
                    
                    if (enhancedQuizState.isAnswered) {
                      if (isCorrect) {
                        buttonClass += "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300 shadow-md";
                      } else if (isWrongSelection) {
                        buttonClass += "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300 shadow-md";
                      } else {
                        buttonClass += "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300";
                      }
                    } else {
                      if (isSelected) {
                        buttonClass += "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-md transform scale-[1.02]";
                      } else {
                        buttonClass += "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-indigo-300 hover:shadow-md";
                      }
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => selectAnswer(index)}
                        disabled={enhancedQuizState.isAnswered}
                        className={buttonClass}
                      >
                        <div className="flex items-center">
                          <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-4 font-bold text-sm">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="flex-1 text-left">{option}</span>
                          {enhancedQuizState.isAnswered && isCorrect && (
                            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {isWrongSelection && (
                            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 解説表示 */}
                {enhancedQuizState.showExplanation && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 解説</h3>
                    <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                      {enhancedQuestions[enhancedQuizState.currentQuestionIndex].explanation}
                    </p>
                  </div>
                )}

                {/* アクションボタン */}
                <div className="flex justify-between">
                  <button
                    onClick={handleBackToSelection}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    ❌ クイズを終了
                  </button>
                  
                  <div className="space-x-3">
                    {!enhancedQuizState.isAnswered ? (
                      <button
                        onClick={submitAnswer}
                        disabled={enhancedQuizState.selectedAnswers[enhancedQuizState.currentQuestionIndex] === -1}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed"
                      >
                        ✅ 回答する
                      </button>
                    ) : (
                      <button
                        onClick={nextQuestion}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:scale-105"
                      >
                        {enhancedQuizState.currentQuestionIndex < enhancedQuestions.length - 1 ? '➡️ 次の問題' : '🏁 結果を見る'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 既存のクイズ画面 */}
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

          {/* 結果画面 */}
          {currentState === 'results' && (
            <div className="space-y-6">
              {/* 新しいクイズの結果 */}
              {enhancedQuizResults.length > 0 ? (
                <>
                  {/* 総合結果 */}
                  <div className={`${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } rounded-lg shadow-lg p-8 text-center`}>
                    <div className="mb-6">
                      <div className="text-6xl mb-4">
                        {enhancedQuizResults.filter(r => r.isCorrect).length / enhancedQuizResults.length >= 0.8 ? '🎉' : 
                         enhancedQuizResults.filter(r => r.isCorrect).length / enhancedQuizResults.length >= 0.6 ? '👏' : '📚'}
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        クイズ完了！
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        お疲れ様でした
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                        <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                          {enhancedQuizResults.filter(r => r.isCorrect).length}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">正解数</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <div className="text-4xl font-bold text-gray-600 dark:text-gray-300">
                          {enhancedQuizResults.length}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">総問題数</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                          {Math.round((enhancedQuizResults.filter(r => r.isCorrect).length / enhancedQuizResults.length) * 100)}%
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">正答率</div>
                      </div>
                    </div>

                    <div className="space-x-4">
                      <button
                        onClick={startEnhancedQuiz}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        🔄 もう一度挑戦
                      </button>
                      <button
                        onClick={handleBackToSelection}
                        className="px-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        ⚙️ 設定を変更
                      </button>
                    </div>
                  </div>

                  {/* 詳細結果 */}
                  <div className={`${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } rounded-lg shadow-lg p-6`}>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      📋 問題別結果
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {enhancedQuestions.map((question, index) => {
                        const result = enhancedQuizResults[index];
                        return (
                          <div 
                            key={question.id}
                            className={`p-4 rounded-lg border ${
                              result?.isCorrect 
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                問題 {index + 1}: {question.question}
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                result?.isCorrect 
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                              }`}>
                                {result?.isCorrect ? '✅ 正解' : '❌ 不正解'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              <strong>あなたの回答:</strong> {question.options[result?.selectedAnswer || 0]}
                            </p>
                            {!result?.isCorrect && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                <strong>正解:</strong> {question.options[question.correctAnswer]}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                              💡 {question.explanation}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                /* 既存のクイズ結果 */
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
          )}
        </div>

        {/* フッター情報 */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              FlightAcademy クイズシステム - あなたの航空知識向上をサポートします
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