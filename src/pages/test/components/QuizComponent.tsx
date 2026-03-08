import React, { useEffect, useRef, useState } from 'react';
import { QuestionType, QuizQuestion, UserQuizAnswer } from '../../../types/quiz';
import { QuestionComponent } from './QuestionComponent'; // Reusing for individual question rendering

interface QuizComponentProps {
  quizTitle: string;
  questions: QuizQuestion[];
  onSubmitQuiz: (answers: UserQuizAnswer[], flaggedIds?: string[]) => void;
  onBackToContents: () => void;
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
  examDurationSec?: number; // Examモード時の制限時間（秒！E
}

export const QuizComponent: React.FC<QuizComponentProps> = ({ quizTitle, questions, onSubmitQuiz, onBackToContents: _onBackToContents, generalMessages, mode = 'practice', showImmediateFeedback = true, showQuestionPalette = true, examDurationSec }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserQuizAnswer[]>([]);
  const [feedback, setFeedback] = useState<{ [key: string]: { isCorrect: boolean; explanation: string | null; userAnswer?: string | number } }>({});
  const [showTextAnswers, setShowTextAnswers] = useState<{ [key: string]: boolean }>({});
  const [flagged, setFlagged] = useState<{ [key: string]: boolean }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const questionStartedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    questionStartedAtRef.current = Date.now();
  }, [currentQuestionIndex]);

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

    const responseTimeMs = Date.now() - questionStartedAtRef.current;
    const answeredAt = new Date().toISOString();

    setUserAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(a => a.questionId === questionId);
      const newAnswer: UserQuizAnswer = {
        questionId,
        answer,
        isCorrect,
        answeredAt,
        responseTimeMs,
      };
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
      const flaggedIds = Object.entries(flagged)
        .filter(([, v]) => v)
        .map(([id]) => id);
      onSubmitQuiz(userAnswers, flaggedIds);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentFeedback = feedback[currentQuestion.id];
  const hasAnsweredCurrent = userAnswers.some(a => a.questionId === currentQuestion.id);
  const currentUserAnswer = userAnswers.find(a => a.questionId === currentQuestion.id)?.answer;

  // Examモードのタイマー設定（秒）
  React.useEffect(() => {
    if (mode !== 'exam') {
      setTimeLeft(null);
      return;
    }
    const total = typeof examDurationSec === 'number' && examDurationSec > 0
      ? examDurationSec
      : Math.max(questions.length * 60, 300); // デフォルト1問60秒、最小300秒
    setTimeLeft(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, questions.length]);

  React.useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      const flaggedIds = Object.entries(flagged)
        .filter(([, v]) => v)
        .map(([id]) => id);
      onSubmitQuiz(userAnswers, flaggedIds);
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

  // exam モード: 解答したら即次問へ（解説なしのため別ボタン不要）
  React.useEffect(() => {
    if (mode !== 'exam' || !hasAnsweredCurrent) return;
    const t = setTimeout(handleNextQuestion, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, hasAnsweredCurrent, currentQuestionIndex]);

  return (
    <div className="p-6 md:p-8 rounded-xl shadow-xl animate-fadeIn bg-[var(--panel)] border border-brand-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-brand-primary">{quizTitle}</h2>
        {mode === 'exam' && timeLeft !== null && (
          <div className="px-3 py-1 rounded-lg border border-brand-primary/30 text-sm font-semibold text-brand-primary">
            残り時間: {formatTime(timeLeft)}
          </div>
        )}
      </div>
      <p className={`text-center mb-4 text-[color:var(--text-muted)]`}>問題 {currentQuestionIndex + 1} / {questions.length}</p>

      {showQuestionPalette && (
        <div role="navigation" aria-label="Question palette" className="flex flex-wrap gap-2 justify-center mb-4">
          {questions.map((q, idx) => {
            const answered = userAnswers.some(a => a.questionId === q.id);
            const isCurrent = idx === currentQuestionIndex;
            const isFlagged = !!flagged[q.id];
            const fb = feedback[q.id];
            const status = fb !== undefined
              ? fb.isCorrect ? 'correct' : 'incorrect'
              : answered ? 'answered' : 'unanswered';
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-9 h-9 rounded-lg border-2 text-sm font-semibold transition-colors
                  ${isCurrent
                    ? 'bg-brand-primary text-[var(--bg)] border-brand-primary ring-2 ring-brand-primary/50'
                    : status === 'correct'
                      ? 'bg-hud-green/30 text-hud-green border-hud-green'
                      : status === 'incorrect'
                        ? 'bg-hud-red/30 text-hud-red border-hud-red'
                        : status === 'answered'
                          ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/50'
                          : 'bg-[var(--panel)] text-[var(--text-muted)] border-brand-primary/30 hover:border-brand-primary/50'}
                `}
                aria-current={isCurrent ? 'true' : undefined}
                title={`Q${idx + 1}${isFlagged ? ' (フラグ)' : ''}${status === 'correct' ? ' 正解' : status === 'incorrect' ? ' 不正解' : ''}`}
              >
                {isFlagged ? (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 mx-auto" fill="currentColor" aria-hidden="true">
                    <path d="M6 2a1 1 0 00-1 1v18a1 1 0 102 0v-5h7l1 2h3V5h-3l-1-2H6z" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </button>
            );
          })}
        </div>
      )}

      <QuestionComponent
        question={currentQuestion}
        onSubmit={(answer) => handleAnswerSubmit(currentQuestion.id, answer)}
        userAnswer={currentUserAnswer}
        feedback={showImmediateFeedback && currentFeedback ? {
          ...currentFeedback,
          explanation: currentFeedback.explanation ?? ''
        } : undefined}
        showAnswer={showTextAnswers[currentQuestion.id] || false}
        toggleShowAnswer={() => toggleShowTextAnswer(currentQuestion.id)}
        generalMessages={generalMessages}
      />

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <button
            onClick={() => toggleFlag(currentQuestion.id)}
            className={`px-3 py-2 rounded-lg border text-sm font-semibold ${flagged[currentQuestion.id] ? 'border-amber-400 text-amber-500 bg-amber-500/10' : 'border-brand-primary/40 text-[var(--text-primary)] hover:bg-brand-primary/10'}`}
            aria-pressed={!!flagged[currentQuestion.id]}
          >
            {flagged[currentQuestion.id] ? 'フラグ解除' : 'フラグ'}
          </button>
          <p className="max-w-md text-xs leading-5 text-[var(--text-muted)]">
            このセッション内で見返したい問題に印を付けます。結果保存や Review モードにはまだ反映されません。
          </p>
        </div>
        {!showImmediateFeedback && hasAnsweredCurrent && mode !== 'exam' && (
          <button
            onClick={() => setCurrentQuestionIndex((i) => Math.min(i + 1, questions.length - 1))}
            className="px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-[var(--bg)] font-semibold shadow"
          >次へ</button>
        )}
      </div>

      {(showImmediateFeedback ? !!currentFeedback : hasAnsweredCurrent) && mode !== 'exam' && (
        <button
          onClick={handleNextQuestion}
          className="mt-6 w-full bg-brand-primary hover:bg-brand-primary-dark text-[var(--bg)] font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
        >
          {currentQuestionIndex < questions.length - 1
            ? generalMessages.nextQuestion
            : generalMessages.finishQuiz}
        </button>
      )}
    </div>
  );
};
