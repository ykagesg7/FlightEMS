import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { QuestionType, QuizQuestion, UserQuizAnswer } from '../types/quiz';
import { QuestionComponent } from './QuestionComponent'; // Reusing for individual question rendering

interface QuizComponentProps {
  quizTitle: string;
  questions: QuizQuestion[];
  onSubmitQuiz: (answers: UserQuizAnswer[]) => void;
  onBackToContents: () => void;
  theme: Theme;
  generalMessages: {
    submitAnswer: string;
    correct: string;
    incorrect: string;
    startQuiz: string;
    quizSummary: string;
    showAnswer: string;
    hideAnswer: string;
    // Added from parent (App.tsx -> constants.ts)
    nextQuestion: string;
    finishQuiz: string;
  };
  mode?: 'practice' | 'exam' | 'review';
  showImmediateFeedback?: boolean;
  showQuestionPalette?: boolean;
  examDurationSec?: number; // Examモード時の制限時間（秒）
}

export const QuizComponent: React.FC<QuizComponentProps> = ({ quizTitle, questions, onSubmitQuiz, onBackToContents, theme, generalMessages, mode = 'practice', showImmediateFeedback = true, showQuestionPalette = true, examDurationSec }) => {
  const { theme: contextTheme } = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserQuizAnswer[]>([]);
  const [feedback, setFeedback] = useState<{ [key: string]: { isCorrect: boolean; explanation: string; userAnswer?: string | number } }>({});
  const [showTextAnswers, setShowTextAnswers] = useState<{ [key: string]: boolean }>({});
  const [flagged, setFlagged] = useState<{ [key: string]: boolean }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);


  const handleAnswerSubmit = (questionId: string, answer: string | number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    let isCorrect = false;
    if (question.type === QuestionType.NUMBER_INPUT) {
      isCorrect = parseFloat(answer as string) === question.correctAnswer;
    } else if (question.type === QuestionType.TEXT_INPUT) {
      isCorrect = (answer as string).trim().toLowerCase() === (question.correctAnswer as string).trim().toLowerCase();
    }
    else {
      isCorrect = answer === question.correctAnswer;
    }

    if (showImmediateFeedback) {
      setFeedback(prev => ({
        ...prev,
        [questionId]: { isCorrect, explanation: question.explanation, userAnswer: answer }
      }));
    }

    setUserAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(a => a.questionId === questionId);
      const newAnswer = { questionId, answer, isCorrect };
      if (existingAnswerIndex > -1) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
        return updatedAnswers;
      }
      return [...prevAnswers, newAnswer];
    });
  };

  const toggleShowTextAnswer = (questionId: string) => {
    setShowTextAnswers(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // All questions answered, submit quiz
      onSubmitQuiz(userAnswers);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentFeedback = feedback[currentQuestion.id];
  const hasAnsweredCurrent = userAnswers.some(a => a.questionId === currentQuestion.id);

  // Examモードのタイマー（秒）
  React.useEffect(() => {
    if (mode !== 'exam') {
      setTimeLeft(null);
      return;
    }
    const total = typeof examDurationSec === 'number' && examDurationSec > 0
      ? examDurationSec
      : Math.max(questions.length * 60, 300); // デフォルト: 1問60秒、最小5分
    setTimeLeft(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, questions.length]);

  React.useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      onSubmitQuiz(userAnswers);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => (t === null ? t : t - 1)), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, onSubmitQuiz, userAnswers]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFlag = (questionId: string) => {
    setFlagged(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  return (
    <div className={`p-6 md:p-8 rounded-xl shadow-xl animate-fadeIn border ${theme === 'dark'
      ? 'bg-slate-800 border-slate-700'
      : 'bg-white border-gray-200'
      }`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-sky-400">{quizTitle}</h2>
        {mode === 'exam' && timeLeft !== null && (
          <div className="px-3 py-1 rounded-lg border hud-border text-sm font-semibold">
            残り時間: {formatTime(timeLeft)}
          </div>
        )}
      </div>
      <p className={`text-center mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>質問 {currentQuestionIndex + 1} / {questions.length}</p>

      {showQuestionPalette && (
        <div role="navigation" aria-label="Question palette" className="flex flex-wrap gap-2 justify-center mb-4">
          {questions.map((q, idx) => {
            const answered = userAnswers.some(a => a.questionId === q.id);
            const isCurrent = idx === currentQuestionIndex;
            const isFlagged = !!flagged[q.id];
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded-md border text-sm font-semibold
                  ${isCurrent ? 'bg-sky-600 text-white border-sky-500' : answered ? 'bg-emerald-600/80 text-white border-emerald-500' : 'bg-[color:var(--panel)] text-[color:var(--text-primary)] border-slate-500'}
                `}
                aria-current={isCurrent ? 'true' : undefined}
                title={`Q${idx + 1}${isFlagged ? '（フラグ）' : ''}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      )}

      <QuestionComponent
        question={currentQuestion}
        onSubmit={(answer) => handleAnswerSubmit(currentQuestion.id, answer)}
        feedback={showImmediateFeedback ? currentFeedback : undefined}
        showAnswer={showTextAnswers[currentQuestion.id] || false}
        toggleShowAnswer={() => toggleShowTextAnswer(currentQuestion.id)}
        generalMessages={generalMessages}
      />

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => toggleFlag(currentQuestion.id)}
          className={`px-3 py-2 rounded-lg border text-sm font-semibold ${flagged[currentQuestion.id] ? 'border-amber-400 text-amber-500' : 'hud-border text-[color:var(--text-primary)] hover:bg-[color:var(--panel)]/50'}`}
          aria-pressed={!!flagged[currentQuestion.id]}
        >
          {flagged[currentQuestion.id] ? 'フラグ解除' : 'フラグ'}
        </button>
        {!showImmediateFeedback && hasAnsweredCurrent && (
          <button
            onClick={() => setCurrentQuestionIndex((i) => Math.min(i + 1, questions.length - 1))}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow"
          >次へ</button>
        )}
      </div>

      {(showImmediateFeedback ? !!currentFeedback : hasAnsweredCurrent) && (
        <button
          onClick={handleNextQuestion}
          className="mt-6 w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
        >
          {currentQuestionIndex < questions.length - 1 ? generalMessages.nextQuestion : generalMessages.finishQuiz}
        </button>
      )}
    </div>
  );
};
