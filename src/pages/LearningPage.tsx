import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { APP_CONTENT } from '../constants';
import { UserQuizAnswer, QuestionType } from '../types/quiz';
import { SectionComponent } from '../components/SectionComponent';
import { QuizComponent } from '../components/QuizComponent';
import { Link } from 'react-router-dom';
import RelatedTestButton from '../components/learning/RelatedTestButton';
import ReviewContentLink from '../components/learning/ReviewContentLink';
import { QuizQuestion, LearningContent } from '../types';

enum LearningState {
  INTRODUCTION, // 目次・概要
  LEARNING,     // 学習セクション
  QUIZ,         // 小テスト
  QUIZ_RESULTS  // 結果
}

// QuestionContent型定義
interface QuestionContent {
  type: 'question';
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

// StepContent型定義
interface StepContent {
  type: 'text' | 'image' | 'video' | 'question' | 'quiz';
  content: string | QuestionContent | QuizQuestion;
  title?: string;
  description?: string;
}

function LearningPage() {
  const { theme } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuthStore();
  const { appName, sections, quizTitle, quizQuestions, generalMessages } = APP_CONTENT;

  const [learningState, setLearningState] = useState<LearningState>(LearningState.INTRODUCTION);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const [userSectionAnswers, setUserSectionAnswers] = useState<{ [key: string]: string | number }>({});
  const [sectionFeedback, setSectionFeedback] = useState<{ [key: string]: { isCorrect: boolean; explanation: string; userAnswer?: string | number } }>({});
  const [showSectionTextAnswers, setShowSectionTextAnswers] = useState<{ [key: string]: boolean }>({});

  const [quizUserAnswers, setQuizUserAnswers] = useState<UserQuizAnswer[]>([]);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const currentSection = sections[currentSectionIndex];
  const currentStep = currentSection?.steps[currentStepIndex];

  const resetLearningState = useCallback(() => {
    setCurrentSectionIndex(0); 
    setCurrentStepIndex(0);
    setUserSectionAnswers({});
    setSectionFeedback({});
    setShowSectionTextAnswers({});
    setQuizUserAnswers([]);
  }, []);
  
  const handleSelectSection = (sectionIdx: number) => {
    setCurrentSectionIndex(sectionIdx);
    setCurrentStepIndex(0);
    setUserSectionAnswers({});
    setSectionFeedback({});
    setShowSectionTextAnswers({});
    setLearningState(LearningState.LEARNING);
  };
  
  const handleAnswerSubmitInSection = useCallback((questionId: string, answer: string | number) => {
    if (!currentStep || typeof currentStep.content === 'string') return;
    const question = currentStep.content as any;

    let isCorrect = false;
    if (question.type === QuestionType.NUMBER_INPUT) {
        isCorrect = parseFloat(answer as string) === question.correctAnswer;
    } else if (question.type === QuestionType.TEXT_INPUT) {
        isCorrect = (answer as string).trim() !== ''; 
    } else { // MULTIPLE_CHOICE
        isCorrect = answer === question.correctAnswer;
    }
    
    setUserSectionAnswers(prev => ({ ...prev, [questionId]: answer }));
    setSectionFeedback(prev => ({
      ...prev,
      [questionId]: { isCorrect, explanation: question.explanation, userAnswer: answer }
    }));
  }, [currentStep]);

  const toggleShowSectionTextAnswer = useCallback((questionId: string) => {
    setShowSectionTextAnswers(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  }, []);

  const handleNextStepInSection = () => {
    if (!currentSection) return; 

    if (currentStepIndex < currentSection.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else { 
      if (!completedSections.includes(currentSection.id)) {
        setCompletedSections(prev => [...prev, currentSection.id]);
      }
      if (currentSectionIndex < sections.length - 1) {
        handleSelectSection(currentSectionIndex + 1); 
      } else {
        setLearningState(LearningState.QUIZ);
      }
    }
  };

  const handlePreviousStepInSection = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = (answers: UserQuizAnswer[]) => {
    setQuizUserAnswers(answers);
    setLearningState(LearningState.QUIZ_RESULTS);
  };

  const handleRetakeQuiz = () => {
    setQuizUserAnswers([]);
    setLearningState(LearningState.QUIZ);
  };

  const handleBackToContents = () => {
    if (learningState === LearningState.QUIZ_RESULTS) {
        resetLearningState(); 
    } else {
         setCurrentStepIndex(0); 
         setUserSectionAnswers({}); 
         setSectionFeedback({}); 
    }
    setLearningState(LearningState.INTRODUCTION);
  };

  const renderContent = () => {
    switch (learningState) {
      case LearningState.INTRODUCTION:
        return (
          <div className={`${
            theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'
          } p-6 md:p-8 rounded-xl shadow-xl border ${
            theme === 'dark' ? 'border-slate-700/50' : 'border-blue-200'
          } animate-fadeIn`}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-sky-400 mb-4">
                🛩️ {generalMessages.tableOfContents}
              </h2>
              <p className={`text-lg leading-relaxed mb-6 ${
                theme === 'dark' ? 'text-gray-300' : 'text-slate-700'
              }`}>
                {generalMessages.appOverview}
              </p>
              
              {/* Learning → Test フロー説明 */}
              <div className={`p-5 rounded-xl mb-6 ${
                theme === 'dark' ? 'bg-blue-900/20 border border-blue-800' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm'
              }`}>
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  📚 学習フロー
                </h3>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full font-semibold">
                      1. Learning
                    </span>
                    <span className={`ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                      知識インプット
                    </span>
                  </div>
                  <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="flex items-center">
                    <Link 
                      to="/test"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      2. Test
                    </Link>
                    <span className={`ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                      知識確認
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {sections.map((section, index) => {
                const isCompleted = completedSections.includes(section.id);
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSelectSection(index)}
                    className={`w-full text-left p-6 rounded-xl shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' 
                        : 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 hover:shadow-xl'
                    }`}
                    aria-label={`セクション ${section.title} ${isCompleted ? '(完了)' : ''} を開始`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-sky-400">
                        {section.title}
                      </h3>
                      {isCompleted && (
                        <span className="text-green-400 text-xs font-semibold ml-2 px-3 py-1 bg-green-700/30 rounded-full ring-1 ring-green-500" role="status" aria-label="完了">
                          ✔ 完了
                        </span>
                      )}
                    </div>
                    {section.introduction && (
                      <p className={`text-sm mt-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-slate-600'
                      }`}>
                        {section.introduction}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Articles と Test ページへのリンク */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              {/* Articles ページへのリンク */}
              <div className={`p-6 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-purple-900/20 border border-purple-800' : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
              }`}>
                <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-3">
                  📚 学習記事も読もう
                </h3>
                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                  より詳細な航空知識を学ぶために、専門記事コレクションもご覧ください。
                </p>
                <Link 
                  to="/articles"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  記事を読む
                </Link>
              </div>

              {/* Test ページへのリンク */}
              <div className={`p-6 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gradient-to-r from-violet-900/50 to-purple-900/50 border border-violet-600/30' : 'bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200'
              }`}>
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
                  🎯 学習後は知識確認へ
                </h3>
                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                  インタラクティブ学習で知識をインプットした後は、Testページで515問のクイズデータベースから出題される本格的なテストに挑戦しましょう。
                </p>
                <Link 
                  to="/test"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  テストページへ移動
                </Link>
              </div>
            </div>
          </div>
        );

      case LearningState.LEARNING:
        if (!currentSection) return (
          <p className="text-center text-red-400">エラー: 学習セクションが見つかりません。</p>
        );
        
        const totalSteps = currentSection.steps.length;
        const progressPercentage = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

        return (
          <>
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-sky-400 flex-grow text-center sm:text-left">
                  {currentSection.title}
                </h2>
                <button 
                    onClick={handleBackToContents}
                    className={`w-full sm:w-auto font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition duration-150 ease-in-out ${
                      theme === 'dark' 
                        ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                    aria-label={generalMessages.backToContents}
                >
                    {generalMessages.backToContents}
                </button>
            </div>
            
            <div className="mb-6">
              <div className={`flex justify-between text-sm mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <span role="status" aria-live="polite">
                  ステップ {currentStepIndex + 1} / {totalSteps}
                </span>
                <span aria-hidden="true">{Math.round(progressPercentage)}%</span>
              </div>
              <div className={`w-full rounded-full h-2.5 shadow-inner ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
              }`}>
                <div 
                  className="bg-sky-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${progressPercentage}%` }}
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`学習進捗 ${Math.round(progressPercentage)}パーセント`}
                ></div>
              </div>
            </div>

            <SectionComponent
              section={currentSection}
              currentStepIndex={currentStepIndex}
              onAnswerSubmit={handleAnswerSubmitInSection}
              onNextStep={handleNextStepInSection}
              onPreviousStep={handlePreviousStepInSection}
              userAnswers={userSectionAnswers}
              feedback={sectionFeedback}
              showAnswers={showSectionTextAnswers}
              toggleShowAnswer={toggleShowSectionTextAnswer}
              generalMessages={generalMessages}
            />
            
            {/* セクション完了時に関連テストボタンを表示 */}
            {currentStepIndex === totalSteps - 1 && (
              <RelatedTestButton 
                contentId={currentSection.id}
                contentTitle={currentSection.title}
              />
            )}
          </>
        );
      
      case LearningState.QUIZ:
        return (
          <>
            <div className="mb-4 flex justify-end items-center">
                 <button 
                    onClick={handleBackToContents}
                    className={`font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition duration-150 ease-in-out ${
                      theme === 'dark' 
                        ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                    aria-label={generalMessages.backToContents}
                >
                    {generalMessages.backToContents}
                </button>
            </div>
            <QuizComponent
              quizTitle={quizTitle}
              questions={quizQuestions}
              onSubmitQuiz={handleSubmitQuiz}
              generalMessages={generalMessages}
            />
          </>
        );

      case LearningState.QUIZ_RESULTS: {
        const score = quizUserAnswers.filter(ans => ans.isCorrect).length;
        const totalQuizQuestions = quizQuestions.length;
        return (
          <div className={`p-6 md:p-8 rounded-lg shadow-2xl text-center animate-fadeIn ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className="text-3xl font-bold text-sky-400 mb-6">
              {generalMessages.quizSummary}
            </h2>
            <p className={`text-2xl mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              {generalMessages.yourScore}: <span className="font-bold text-amber-400">{score}</span> / {totalQuizQuestions}
            </p>
            
            {/* Test ページへの誘導 */}
            <div className={`my-6 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-indigo-900/20 border border-indigo-800' : 'bg-indigo-50 border border-indigo-200'
            }`}>
              <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                🎯 さらなる挑戦へ
              </h3>
              <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                学習内容をより深く定着させるために、515問のクイズデータベースから出題される本格的なテストに挑戦してみましょう。
              </p>
              <Link 
                to="/test"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                テストページで本格テスト
              </Link>
            </div>
            
            <div className={`space-y-4 my-6 text-left max-h-96 overflow-y-auto p-3 rounded-md border ${
              theme === 'dark' 
                ? 'bg-gray-900/50 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              {quizQuestions.map((q: any, index: number) => {
                const userAnswer = quizUserAnswers.find(a => a.questionId === q.id);
                return (
                  <div key={q.id} className={`p-3 rounded-md border ${
                    userAnswer?.isCorrect 
                      ? 'border-green-600 bg-green-700/20' 
                      : 'border-red-600 bg-red-700/20'
                  }`}>
                    <p className={`font-semibold ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      問題 {index + 1}: {q.text}
                    </p>
                    <p className={`text-sm ${
                      userAnswer?.isCorrect ? 'text-green-300' : 'text-red-300'
                    }`}>
                      あなたの回答: 「{userAnswer?.answer?.toString() || generalMessages.unanswered}」 - {userAnswer?.isCorrect ? "正解" : "不正解"}
                    </p>
                    {!userAnswer?.isCorrect && (
                       <p className={`text-xs mt-1 ${
                         theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                       }`}>
                         正しい答え: 「{q.correctAnswer.toString()}」
                       </p>
                    )}
                     <p className={`text-xs mt-1 whitespace-pre-line ${
                       theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                     }`}>
                       解説: {q.explanation}
                     </p>
                  </div>
                );
              })}
            </div>
            
            {/* 復習コンテンツリンクの表示 */}
            <ReviewContentLink 
              subjectCategory="基礎知識"
              accuracy={Math.round((score / totalQuizQuestions) * 100)}
              questionIds={quizQuestions.map(q => q.id)}
            />
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleRetakeQuiz}
                  className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  aria-label={generalMessages.retakeQuiz}
                >
                  {generalMessages.retakeQuiz}
                </button>
                <button
                  onClick={handleBackToContents}
                  className={`w-full sm:w-auto font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 ${
                    theme === 'dark' 
                      ? 'bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-400' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400'
                  }`}
                  aria-label={generalMessages.backToContents}
                >
                  {generalMessages.backToContents}
                </button>
            </div>
            <p className={`mt-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {generalMessages.finalThoughts}
            </p>
          </div>
        );
      }
      default:
        return <p className="text-center text-red-400">不明な状態です。</p>;
    }
  };

  // CSSアニメーションを追加
  useEffect(() => {
    const styleCheck = document.getElementById('fadeInAnimation');
    if (!styleCheck) {
      const style = document.createElement('style');
      style.id = 'fadeInAnimation';
      style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.5s ease-out forwards;
      }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-800 text-gray-100' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50 text-gray-900'
    }`}>
      <header className="w-full max-w-4xl mx-auto my-6 md:my-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 py-2">
          {appName}
        </h1>
        <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
          インタラクティブ学習で航空知識を身につけよう
        </p>
      </header>
      <main className="w-full max-w-4xl mx-auto">
        {renderContent()}
      </main>
      <footer className={`w-full max-w-4xl mx-auto mt-10 mb-6 text-center text-xs ${
        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
      }`}>
        <p>&copy; {new Date().getFullYear()} Flight Academy. All rights reserved.</p>
         <p>This is an educational tool. Always refer to official flight publications for actual flight operations.</p>
      </footer>
    </div>
  );
}

export default LearningPage; 