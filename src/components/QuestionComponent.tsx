import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Option, Question, QuestionType } from '../types/quiz';

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
  useTheme();
  const [currentAnswer, setCurrentAnswer] = useState<number | string>('');
  const questionTextId = `question-text-${question.id}`;

  useEffect(() => {
    if (initialUserAnswer !== undefined) {
      setCurrentAnswer(initialUserAnswer);
    } else {
      setCurrentAnswer(''); // Reset for new questions
    }
  }, [initialUserAnswer, question.id]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAnswer === '' && question.type !== QuestionType.MULTIPLE_CHOICE) {
      return;
    }
    onSubmit(currentAnswer);
  };

  const renderInput = () => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <fieldset className="space-y-3">
            <legend className="sr-only">{question.text}</legend>
            {question.options?.map((option, index) => {
              const optionId = index;
              const optionText = typeof option === 'string' ? option : (option as Option).text;
              const selected = currentAnswer === optionId;
              return (
                <label
                  key={optionId}
                  className={`block p-3 rounded-xl border transition-all duration-200 cursor-pointer text-base font-medium
                    ${selected
                      ? 'bg-[color:var(--hud-primary)] text-black border-[color:var(--hud-primary)]'
                      : 'hud-surface hud-border hover:bg-[color:var(--panel)]/60 text-[color:var(--text-primary)]'}
                    ${feedback !== undefined ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={optionId}
                    checked={selected}
                    onChange={() => setCurrentAnswer(optionId)}
                    className="opacity-0 w-0 h-0 absolute"
                    disabled={feedback !== undefined}
                    aria-labelledby={`${questionTextId} option-text-${optionId}`}
                  />
                  <span id={`option-text-${optionId}`}>{optionText}</span>
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
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-[color:var(--hud-primary)] focus:border-[color:var(--hud-primary)] outline-none transition-all duration-200 hud-surface hud-border text-[color:var(--text-primary)]`}
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
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-[color:var(--hud-primary)] focus:border-[color:var(--hud-primary)] outline-none transition-all duration-200 hud-surface hud-border text-[color:var(--text-primary)]`}
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
      {!feedback && renderInput()}

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
          className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          {generalMessages.submitAnswer}
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
        <div className={`mt-2 p-3 rounded-xl hud-surface hud-border`}>
          <p className={`text-xs mb-1 text-[color:var(--text-muted)]`}>模範解答:</p>
          <p className={`text-sm text-amber-600 dark:text-amber-300`}>{question.correctAnswer.toString()}</p>
        </div>
      )}
    </form>
  );
};
