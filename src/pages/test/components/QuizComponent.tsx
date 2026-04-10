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
  examDurationSec?: number; // Examモード時の制限時間（秒）
}

export const QuizComponent: React.FC<QuizComponentProps> = ({ quizTitle, questions, onSubmitQuiz, onBackToContents: _onBackToContents, generalMessages, mode = 'practice', showImmediateFeedback = true, showQuestionPalette = true, examDurationSec }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserQuizAnswer[]>([]);
  const [feedback, setFeedback] = useState<{ [key: string]: { isCorrect: boolean; explanation: string | null; userAnswer?: string | number } }>({});
  const [showTextAnswers, setShowTextAnswers] = useState<{ [key: string]: boolean }>({});
  const [flagged, setFlagged] = useState<{ [key: string]: boolean }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerLiveMessage, setTimerLiveMessage] = useState('');
  const questionStartedAtRef = useRef<number>(Date.now());
  const userAnswersRef = useRef<UserQuizAnswer[]>([]);
  const flaggedRef = useRef<{ [key: string]: boolean }>({});
  const lastTimerThresholdAnnouncedRef = useRef<number | null>(null);
  const examTimeExpiredSubmittedRef = useRef(false);
  const quizProgressAnchorRef = useRef<HTMLDivElement>(null);
  const questionsIdentityRef = useRef<string>('');
  /** null = この問題セットではまだ「基準インデックス」を確定していない（初回はスクロールしない） */
  const prevQuestionIndexForScrollRef = useRef<number | null>(null);

  useEffect(() => {
    const key = questions.map((q) => String(q.id)).join('|');
    if (key !== questionsIdentityRef.current) {
      questionsIdentityRef.current = key;
      prevQuestionIndexForScrollRef.current = null;
    }
  }, [questions]);

  useEffect(() => {
    if (questions.length === 0) return;
    const prev = prevQuestionIndexForScrollRef.current;
    const cur = currentQuestionIndex;

    if (prev === null) {
      prevQuestionIndexForScrollRef.current = cur;
      return;
    }
    if (prev === cur) {
      return;
    }

    prevQuestionIndexForScrollRef.current = cur;

    const el = quizProgressAnchorRef.current;
    if (!el) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth';
    const raf = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        el.scrollIntoView({ behavior, block: 'start' });
      });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [currentQuestionIndex, questions.length]);

  useEffect(() => {
    questionStartedAtRef.current = Date.now();
  }, [currentQuestionIndex]);

  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  useEffect(() => {
    flaggedRef.current = flagged;
  }, [flagged]);

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
      const flaggedIds = Object.entries(flaggedRef.current)
        .filter(([, v]) => v)
        .map(([id]) => id);
      onSubmitQuiz(userAnswersRef.current, flaggedIds);
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
      lastTimerThresholdAnnouncedRef.current = null;
      examTimeExpiredSubmittedRef.current = false;
      setTimerLiveMessage('');
      return;
    }
    const total = typeof examDurationSec === 'number' && examDurationSec > 0
      ? examDurationSec
      : Math.max(questions.length * 60, 300); // デフォルト1問60秒、最小300秒
    lastTimerThresholdAnnouncedRef.current = null;
    examTimeExpiredSubmittedRef.current = false;
    setTimerLiveMessage('');
    setTimeLeft(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, questions.length]);

  React.useEffect(() => {
    if (timeLeft === null || mode !== 'exam') return;

    const announceThreshold = (seconds: number, message: string) => {
      if (timeLeft === seconds && lastTimerThresholdAnnouncedRef.current !== seconds) {
        lastTimerThresholdAnnouncedRef.current = seconds;
        setTimerLiveMessage(message);
        window.setTimeout(() => setTimerLiveMessage(''), 3000);
      }
    };

    announceThreshold(60, '残り1分です');
    announceThreshold(30, '残り30秒です');
    announceThreshold(10, '残り10秒です');
    if (timeLeft === 0 && lastTimerThresholdAnnouncedRef.current !== 0) {
      lastTimerThresholdAnnouncedRef.current = 0;
      setTimerLiveMessage('時間終了です');
      window.setTimeout(() => setTimerLiveMessage(''), 4000);
    }
  }, [timeLeft, mode]);

  React.useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      if (mode === 'exam' && !examTimeExpiredSubmittedRef.current) {
        examTimeExpiredSubmittedRef.current = true;
        const flaggedIds = Object.entries(flaggedRef.current)
          .filter(([, v]) => v)
          .map(([id]) => id);
        onSubmitQuiz(userAnswersRef.current, flaggedIds);
      }
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => (t === null ? t : t - 1)), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, mode, onSubmitQuiz]);

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

  const examTimerLow = mode === 'exam' && timeLeft !== null && timeLeft > 0 && timeLeft <= 60;
  const examTimerCritical = mode === 'exam' && timeLeft !== null && timeLeft > 0 && timeLeft <= 30;

  return (
    <div className="p-6 md:p-8 rounded-xl shadow-xl animate-fadeIn bg-[var(--panel)] border border-brand-primary/20">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {timerLiveMessage}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-2xl font-bold text-brand-primary">{quizTitle}</h2>
        {mode === 'exam' && timeLeft !== null && (
          <div
            aria-label={`試験の残り時間 ${formatTime(Math.max(0, timeLeft))}`}
            className={`self-end sm:self-auto px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors
              ${timeLeft <= 0
                ? 'border-hud-red/60 text-hud-red bg-hud-red/10'
                : examTimerCritical
                  ? 'border-hud-red/70 text-hud-red bg-hud-red/15 animate-pulse'
                  : examTimerLow
                    ? 'border-amber-500/70 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                    : 'border-brand-primary/30 text-brand-primary'}
            `}
          >
            残り時間: {formatTime(Math.max(0, timeLeft))}
          </div>
        )}
      </div>
      <div
        ref={quizProgressAnchorRef}
        className="scroll-mt-20 md:scroll-mt-24"
      >
        <p className={`text-center mb-2 text-[color:var(--text-muted)]`}>問題 {currentQuestionIndex + 1} / {questions.length}</p>
        <div
          className="mb-4 h-2 w-full overflow-hidden rounded-full bg-brand-primary/15"
          role="progressbar"
          aria-valuenow={currentQuestionIndex + 1}
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-label={`問題の進捗、${questions.length}問中${currentQuestionIndex + 1}問目`}
        >
          <div
            className="h-full rounded-full bg-brand-primary transition-[width] duration-300 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {showQuestionPalette && (
          <div role="navigation" aria-label="問題一覧" className="flex flex-wrap gap-2 justify-center mb-4">
            {questions.map((q, idx) => {
              const answered = userAnswers.some(a => a.questionId === q.id);
              const isCurrent = idx === currentQuestionIndex;
              const isFlagged = !!flagged[q.id];
              const fb = feedback[q.id];
              const status = fb !== undefined
                ? fb.isCorrect ? 'correct' : 'incorrect'
                : answered ? 'answered' : 'unanswered';
              const statusMark = status === 'correct' ? '○' : status === 'incorrect' ? '×' : '';
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`relative flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border-2 px-1 text-sm font-semibold transition-colors
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
                  aria-label={`問題${idx + 1}${isFlagged ? '、フラグ付き' : ''}${status === 'correct' ? '、正解' : status === 'incorrect' ? '、不正解' : status === 'answered' ? '、解答済み' : ''}`}
                  title={`Q${idx + 1}${isFlagged ? ' (フラグ)' : ''}${status === 'correct' ? ' 正解' : status === 'incorrect' ? ' 不正解' : ''}`}
                >
                  {statusMark !== '' && (
                    <span className="absolute left-0.5 top-0.5 text-[9px] font-bold leading-none" aria-hidden>
                      {statusMark}
                    </span>
                  )}
                  <span className="tabular-nums">{idx + 1}</span>
                  {isFlagged && (
                    <span className="absolute -right-0.5 -top-0.5 text-amber-500" aria-hidden>
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                        <path d="M6 2a1 1 0 00-1 1v18a1 1 0 102 0v-5h7l1 2h3V5h-3l-1-2H6z" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div key={`${currentQuestion.id}-${currentQuestionIndex}`} className="animate-fadeIn">
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
      </div>

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
            このセッション内で見返したい問題に印を付けます。テスト終了後、結果画面からフラグ付き問題だけを再挑戦できます。結果保存や Review モードへの自動反映はまだありません。
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
