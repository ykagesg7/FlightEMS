import React, { useState, useEffect } from 'react';
import { Question, QuestionType } from '../types/quiz';

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
  const [currentAnswer, setCurrentAnswer] = useState<string | number>('');
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
            <legend className="sr-only">{question.text}</legend> {/* For screen readers, associating options with the question */}
            {question.options?.map((option) => (
              <label
                key={option.id}
                className={`block p-3 rounded-lg border transition-all duration-150 cursor-pointer ${
                  currentAnswer === option.id
                    ? 'bg-sky-500 border-sky-400 ring-2 ring-sky-300'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={currentAnswer === option.id}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="opacity-0 w-0 h-0 absolute" // Hidden, label is clickable
                  disabled={feedback !== undefined}
                  aria-labelledby={`${questionTextId} option-text-${option.id}`}
                />
                <span id={`option-text-${option.id}`}>{option.text}</span>
              </label>
            ))}
          </fieldset>
        );
      case QuestionType.NUMBER_INPUT:
        return (
          <input
            type="number"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-slate-400"
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
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-slate-400"
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
      <p id={questionTextId} className="text-slate-200 whitespace-pre-line leading-relaxed mb-3">{question.text}</p>
      {question.imagePlaceholder && (
        <div className="my-3 p-2 bg-slate-700/50 rounded text-center">
            <p className="text-sm text-slate-400 italic">[図示: {question.imagePlaceholder}]</p>
            <img src={`https://picsum.photos/seed/${question.id}/300/150`} alt={question.imagePlaceholder} className="mx-auto mt-1 rounded opacity-50"/>
        </div>
      )}
      {!feedback && renderInput()}
      
      {feedback && (
        <div
          className={`p-4 rounded-lg mt-4 border ${
            feedback.isCorrect ? 'bg-green-700/30 border-green-500' : 'bg-red-700/30 border-red-500'
          }`}
        >
          <p className={`font-semibold ${feedback.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
            {feedback.isCorrect ? generalMessages.correct : generalMessages.incorrect}
          </p>
          {question.type === QuestionType.TEXT_INPUT && !feedback.isCorrect && feedback.userAnswer && (
            <p className="text-sm text-slate-400 mt-1">あなたの回答: 「{feedback.userAnswer.toString()}」</p>
          )}
          <p className="mt-2 text-slate-300 whitespace-pre-line leading-relaxed">{feedback.explanation}</p>
        </div>
      )}

      {!feedback && (
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          {generalMessages.submitAnswer}
        </button>
      )}
      {feedback && question.type === QuestionType.TEXT_INPUT && !feedback.isCorrect && (
         <button
          type="button"
          onClick={toggleShowAnswer}
          className="w-full mt-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg text-sm"
        >
          {showAnswer ? generalMessages.hideAnswer : generalMessages.showAnswer}
        </button>
      )}
      {showAnswer && question.type === QuestionType.TEXT_INPUT && !feedback?.isCorrect && (
        <div className="mt-2 p-3 bg-slate-700 rounded-md">
          <p className="text-xs text-slate-400 mb-1">模範解答:</p>
          <p className="text-sm text-amber-300">{question.correctAnswer.toString()}</p>
        </div>
      )}
    </form>
  );
};