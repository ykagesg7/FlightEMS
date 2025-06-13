import React, { useState, useCallback } from 'react';
import { APP_CONTENT } from '../constants';
import { Question as QuestionTypeData, UserQuizAnswer, QuestionType } from '../types/quiz';
import { SectionComponent } from './components/SectionComponent';
import { QuizComponent } from './components/QuizComponent';

enum AppState {
  INTRODUCTION, // Now serves as Table of Contents
  LEARNING,
  QUIZ,
  QUIZ_RESULTS
}

const App: React.FC = () => {
  const { appName, sections, quizTitle, quizQuestions, generalMessages } = APP_CONTENT;

  const [appState, setAppState] = useState<AppState>(AppState.INTRODUCTION);
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
    setAppState(AppState.LEARNING);
  };
  
  const handleAnswerSubmitInSection = useCallback((questionId: string, answer: string | number) => {
    if (!currentStep || typeof currentStep.content === 'string') return;
    const question = currentStep.content as QuestionTypeData;

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
      [questionId]: { isCorrect, explanation: question.explanation || '', userAnswer: answer }
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
        setAppState(AppState.QUIZ);
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
    setAppState(AppState.QUIZ_RESULTS);
  };

  const handleRetakeQuiz = () => {
    setQuizUserAnswers([]);
    setAppState(AppState.QUIZ);
  };

  const handleBackToContents = () => {
    if (appState === AppState.QUIZ_RESULTS) {
        resetLearningState(); 
    } else {
         setCurrentStepIndex(0); 
         setUserSectionAnswers({}); 
         setSectionFeedback({}); 
    }
    setAppState(AppState.INTRODUCTION);
  };


  const renderContent = () => {
    switch (appState) {
      case AppState.INTRODUCTION:
        return (
          <div className="bg-slate-800 p-6 md:p-8 rounded-lg shadow-2xl animate-fadeIn">
            <h2 className="text-3xl font-bold text-center text-sky-400 mb-4">{generalMessages.tableOfContents}</h2>
            <p className="text-slate-300 whitespace-pre-line leading-relaxed mb-8 text-center">{generalMessages.appOverview}</p>
            <div className="space-y-4">
              {sections.map((section: any, index: number) => {
                const isCompleted = completedSections.includes(section.id);
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSelectSection(index)}
                    className="w-full text-left p-4 bg-slate-700 hover:bg-slate-600 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75"
                    aria-label={`セクション ${section.title} ${isCompleted ? '(完了)' : ''} を開始`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-sky-300">{section.title}</h3>
                      {isCompleted && (
                        <span className="text-green-400 text-xs font-semibold ml-2 px-2 py-0.5 bg-green-700/30 rounded-full ring-1 ring-green-500" role="status" aria-label="完了">
                          ✔ 完了
                        </span>
                      )}
                    </div>
                    {section.introduction && <p className="text-sm text-slate-400 mt-1">{section.introduction}</p>}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case AppState.LEARNING: {
        if (!currentSection) return <p className="text-center text-red-400">エラー: 学習セクションが見つかりません。</p>;
        
        const totalSteps = currentSection.steps.length;
        const progressPercentage = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

        return (
          <>
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-sky-400 flex-grow text-center sm:text-left">{currentSection.title}</h2>
                <button 
                    onClick={handleBackToContents}
                    className="w-full sm:w-auto bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition duration-150 ease-in-out"
                    aria-label={generalMessages.backToContents}
                >
                    {generalMessages.backToContents}
                </button>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span role="status" aria-live="polite">ステップ {currentStepIndex + 1} / {totalSteps}</span>
                <span aria-hidden="true">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5 shadow-inner">
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
          </>
        );
      }
      
      case AppState.QUIZ:
        return (
          <>
            <div className="mb-4 flex justify-end items-center">
                 <button 
                    onClick={handleBackToContents}
                    className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition duration-150 ease-in-out"
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

      case AppState.QUIZ_RESULTS: {
        const score = quizUserAnswers.filter(ans => ans.isCorrect).length;
        const totalQuizQuestions = quizQuestions.length;
        return (
          <div className="bg-slate-800 p-6 md:p-8 rounded-lg shadow-2xl text-center animate-fadeIn">
            <h2 className="text-3xl font-bold text-sky-400 mb-6">{generalMessages.quizSummary}</h2>
            <p className="text-2xl text-slate-200 mb-4">
              {generalMessages.yourScore}: <span className="font-bold text-amber-400">{score}</span> / {totalQuizQuestions}
            </p>
            <div className="space-y-4 my-6 text-left max-h-96 overflow-y-auto p-3 bg-slate-900/50 rounded-md border border-slate-700">
              {quizQuestions.map((q: any, index: number) => {
                const userAnswer = quizUserAnswers.find(a => a.questionId === q.id);
                return (
                  <div key={q.id} className={`p-3 rounded-md border ${userAnswer?.isCorrect ? 'border-green-600 bg-green-700/20' : 'border-red-600 bg-red-700/20'}`}>
                    <p className="font-semibold text-slate-200">問題 {index + 1}: {q.text}</p>
                    <p className={`text-sm ${userAnswer?.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                      あなたの回答: 「{userAnswer?.answer?.toString() || generalMessages.unanswered}」 - {userAnswer?.isCorrect ? "正解" : "不正解"}
                    </p>
                    {!userAnswer?.isCorrect && (
                       <p className="text-xs text-slate-400 mt-1">正しい答え: 「{q.correctAnswer.toString()}」</p>
                    )}
                     <p className="text-xs text-slate-400 mt-1 whitespace-pre-line">解説: {q.explanation}</p>
                  </div>
                );
              })}
            </div>
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
                  className="w-full sm:w-auto bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  aria-label={generalMessages.backToContents}
                >
                  {generalMessages.backToContents}
                </button>
            </div>
            <p className="mt-8 text-slate-300">{generalMessages.finalThoughts}</p>
          </div>
        );
      }
      default:
        return <p className="text-center text-red-400">不明な状態です。</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 flex flex-col items-center p-4 selection:bg-sky-500 selection:text-white">
      <header className="w-full max-w-3xl mx-auto my-6 md:my-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 py-2">
          {appName}
        </h1>
      </header>
      <main className="w-full max-w-3xl mx-auto">
        {renderContent()}
      </main>
      <footer className="w-full max-w-3xl mx-auto mt-10 mb-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Flight Academy. All rights reserved.</p>
         <p>This is an educational tool. Always refer to official flight publications for actual flight operations.</p>
      </footer>
    </div>
  );
};

export default App;

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