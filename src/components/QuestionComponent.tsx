import React, { useState, useEffect } from 'react';
import { Question, QuestionType, Option } from '../types/quiz';
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme } = useTheme();
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
            {question.options?.map((option, index) => {
              const optionId = typeof option === 'string' ? index.toString() : (option as Option).id;
              const optionText = typeof option === 'string' ? option : (option as Option).text;
              return (
                <label
                  key={optionId}
                  className={`block p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                    currentAnswer === optionId
                      ? 'bg-sky-500 border-sky-400 ring-2 ring-sky-300'
                      : theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                        : 'bg-gray-50 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={optionId}
                    checked={currentAnswer === optionId}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    className="opacity-0 w-0 h-0 absolute" // Hidden, label is clickable
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
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-slate-700 border-slate-600 placeholder-slate-400 text-white'
                : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900'
            }`}
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
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-slate-700 border-slate-600 placeholder-slate-400 text-white'
                : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900'
            }`}
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
      <p id={questionTextId} className={`whitespace-pre-line leading-relaxed mb-3 ${
        theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
      }`}>{question.text}</p>
      {question.imagePlaceholder && (
        <div className={`my-3 p-2 rounded text-center ${
          theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'
        }`}>
            <p className={`text-sm italic ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
            }`}>[図示: {question.imagePlaceholder}]</p>
            <img src={`https://picsum.photos/seed/${question.id}/300/150`} alt={question.imagePlaceholder} className="mx-auto mt-1 rounded opacity-50"/>
        </div>
      )}
      {!feedback && renderInput()}
      
      {feedback && (
        <div
          className={`p-4 rounded-xl mt-4 border ${
            feedback.isCorrect 
              ? theme === 'dark' 
                ? 'bg-green-700/30 border-green-500' 
                : 'bg-green-50 border-green-300'
              : theme === 'dark'
                ? 'bg-red-700/30 border-red-500'
                : 'bg-red-50 border-red-300'
          }`}
        >
          <p className={`font-semibold ${
            feedback.isCorrect 
              ? theme === 'dark' ? 'text-green-300' : 'text-green-700'
              : theme === 'dark' ? 'text-red-300' : 'text-red-700'
          }`}>
            {feedback.isCorrect ? generalMessages.correct : generalMessages.incorrect}
          </p>
          {question.type === QuestionType.TEXT_INPUT && !feedback.isCorrect && feedback.userAnswer && (
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
            }`}>あなたの回答: 「{feedback.userAnswer.toString()}」</p>
          )}
          <p className={`mt-2 whitespace-pre-line leading-relaxed ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
          }`}>{feedback.explanation}</p>
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
        <div className={`mt-2 p-3 rounded-xl ${
          theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
        }`}>
          <p className={`text-xs mb-1 ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>模範解答:</p>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-amber-300' : 'text-amber-700'
          }`}>{question.correctAnswer.toString()}</p>
        </div>
      )}
    </form>
  );
};