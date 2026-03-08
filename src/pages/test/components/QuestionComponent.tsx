import React, { useCallback, useEffect, useState } from 'react';
import { Option, Question, QuestionType } from '../../../types/quiz';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'] as const;
const RESPONSE_FIELD_CLASS =
  'w-full rounded-xl border border-brand-primary/20 bg-[var(--panel)]/70 p-3 text-[var(--text-primary)] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)]/75 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-60';

interface QuestionComponentProps {
  question: Question;
  onSubmit: (answer: string | number) => void;
  userAnswer?: string | number; // Previously submitted answer
  feedback?: { isCorrect: boolean; explanation: string; userAnswer?: string | number };
  showAnswer: boolean;
  toggleShowAnswer: () => void;
  generalMessages: {
    submitAnswer: string;
    correct: string;
    incorrect: string;
    showAnswer: string;
    hideAnswer: string;
  }
}

export const QuestionComponent: React.FC<QuestionComponentProps> = ({
  question,
  onSubmit,
  userAnswer: initialUserAnswer,
  feedback,
  showAnswer,
  toggleShowAnswer,
  generalMessages
}) => {
  const [currentAnswer, setCurrentAnswer] = useState<number | string>('');
  const questionTextId = `question-text-${question.id}`;

  useEffect(() => {
    if (initialUserAnswer !== undefined) {
      setCurrentAnswer(initialUserAnswer);
    } else {
      setCurrentAnswer(''); // Reset for new questions
    }
  }, [initialUserAnswer, question.id]);

  // Keyboard shortcuts: 1-4 for choices, Enter to submit
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (feedback !== undefined) return;
    if (e.key >= '1' && e.key <= '4') {
      const idx = Number(e.key) - 1;
      const opts = question.options ?? [];
      if (idx < opts.length) {
        e.preventDefault();
        setCurrentAnswer(idx);
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = currentAnswer;
      if (question.type === QuestionType.MULTIPLE_CHOICE) {
        if (val !== '' && val !== undefined) onSubmit(val);
      } else {
        onSubmit(val);
      }
    }
  }, [feedback, question.type, question.options, currentAnswer, onSubmit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.type === QuestionType.MULTIPLE_CHOICE) {
      if (currentAnswer === '' || currentAnswer === undefined) return;
    } else if (currentAnswer === '') {
      return;
    }
    onSubmit(currentAnswer);
  };

  const getChoiceStyle = (index: number) => {
    const correctIdx = typeof question.correctAnswer === 'number' ? question.correctAnswer : question.correct_option_index ?? 0;
    const userIdx = typeof feedback?.userAnswer === 'number' ? feedback.userAnswer : -1;
    const selected = currentAnswer === index;
    const isCorrect = index === correctIdx;
    const isUserChoice = index === userIdx;

    if (feedback === undefined) {
      return selected
        ? 'bg-brand-primary text-[var(--bg)] border-brand-primary'
        : 'bg-[var(--panel)] border-brand-primary/30 hover:bg-brand-primary/10 text-[var(--text-primary)]';
    }
    if (isCorrect) return 'bg-hud-green/20 border-hud-green text-hud-green';
    if (isUserChoice && !feedback.isCorrect) return 'bg-hud-red/20 border-hud-red text-hud-red-light';
    return 'bg-[var(--panel)]/60 border-brand-primary/20 text-[var(--text-muted)] opacity-70';
  };

  const renderInput = () => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <fieldset className="space-y-3">
            <legend className="sr-only">{question.text}</legend>
            {(question.options ?? []).map((option: string | Option, index: number) => {
              const optionText = typeof option === 'string' ? option : (option as Option).text;
              const selected = currentAnswer === index;
              const label = CHOICE_LABELS[index] ?? String(index + 1);
              const disabled = feedback !== undefined;
              return (
                <label
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-base font-medium
                    ${getChoiceStyle(index)}
                    ${disabled ? 'cursor-default' : 'cursor-pointer hover:border-brand-primary/50'}
                  `}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-current font-bold text-lg"
                    aria-hidden
                  >
                    {label}
                  </span>
                  <input
                    type="radio"
                    name={question.id}
                    value={index}
                    checked={selected}
                    onChange={() => !disabled && setCurrentAnswer(index)}
                    className="sr-only"
                    disabled={disabled}
                    aria-labelledby={`${questionTextId} option-text-${index}`}
                  />
                  <span id={`option-text-${index}`} className="flex-1">{optionText}</span>
                </label>
              );
            })}
          </fieldset>
        );
      case QuestionType.NUMBER_INPUT:
        return (
          <input
            type="number"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className={RESPONSE_FIELD_CLASS}
            placeholder="数値を入力"
            disabled={feedback !== undefined}
            aria-labelledby={questionTextId}
          />
        );
      case QuestionType.TEXT_INPUT:
        return (
          <textarea
            value={currentAnswer as string}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            rows={3}
            className={RESPONSE_FIELD_CLASS}
            placeholder="回答を入力してください..."
            disabled={feedback !== undefined}
            aria-labelledby={questionTextId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p id={questionTextId} className={`whitespace-pre-line leading-relaxed mb-3 hud-text`}>{question.text}</p>
      {question.imagePlaceholder && (
        <div className={`my-3 p-2 rounded text-center hud-surface`}>
          <p className={`text-sm italic text-[color:var(--text-muted)]`}>[図示: {question.imagePlaceholder}]</p>
          <img src={`https://picsum.photos/seed/${question.id}/300/150`} alt={question.imagePlaceholder} className="mx-auto mt-1 rounded opacity-50" />
        </div>
      )}
      {(!feedback || question.type === QuestionType.MULTIPLE_CHOICE) && renderInput()}

      {feedback && (
        <div
          className={`p-4 rounded-xl mt-4 border ${feedback.isCorrect
            ? 'bg-green-500/10 border-green-400'
            : 'bg-red-500/10 border-red-400'
            }`}
        >
          <p className={`font-semibold ${feedback.isCorrect ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
            {feedback.isCorrect ? generalMessages.correct : generalMessages.incorrect}
          </p>
          {question.type === QuestionType.TEXT_INPUT && !feedback.isCorrect && feedback.userAnswer && (
            <p className={`text-sm mt-1 text-[color:var(--text-muted)]`}>あなたの回答: 「{feedback.userAnswer.toString()}」</p>
          )}
          <p className={`mt-2 whitespace-pre-line leading-relaxed text-[color:var(--text-primary)]`}>{feedback.explanation}</p>
        </div>
      )}

      {!feedback && (
        <button
          type="submit"
          disabled={question.type === QuestionType.MULTIPLE_CHOICE && (currentAnswer === '' || currentAnswer === undefined)}
          className="w-full bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-primary text-[var(--bg)] font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-75"
        >
          {generalMessages.submitAnswer} {question.type === QuestionType.MULTIPLE_CHOICE && '(1-4 / Enter)'}
        </button>
      )}
      {feedback && question.type === QuestionType.TEXT_INPUT && !feedback.isCorrect && (
        <button
          type="button"
          onClick={toggleShowAnswer}
          className="w-full mt-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-4 rounded-xl text-sm shadow-md transition-all duration-200"
        >
          {showAnswer ? generalMessages.hideAnswer : generalMessages.showAnswer}
        </button>
      )}
      {showAnswer && question.type === QuestionType.TEXT_INPUT && !feedback?.isCorrect && (
        <div className="mt-2 rounded-xl border border-brand-primary/20 bg-[var(--panel)]/55 p-3">
          <p className="mb-1 text-xs text-[var(--text-muted)]">模範解答:</p>
          <p className="text-sm text-brand-primary">{question.correctAnswer.toString()}</p>
        </div>
      )}
    </form>
  );
};
