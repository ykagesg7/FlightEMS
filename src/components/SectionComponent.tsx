import React from 'react';
import { Section, Question } from '../types/quiz';
import { QuestionComponent } from './QuestionComponent';

interface SectionComponentProps {
  section: Section;
  currentStepIndex: number;
  onAnswerSubmit: (questionId: string, answer: string | number) => void;
  onNextStep: () => void;
  onPreviousStep: () => void; // New prop for going to previous step
  userAnswers: { [key: string]: string | number };
  feedback: { [key: string]: { isCorrect: boolean; explanation: string; userAnswer?: string | number } };
  showAnswers: { [key: string]: boolean };
  toggleShowAnswer: (questionId: string) => void;
  generalMessages: {
    nextStep: string;
    previousStep: string; // New message
    submitAnswer: string;
    correct: string;
    incorrect: string;
    showAnswer: string;
    hideAnswer: string;
  }
}

export const SectionComponent: React.FC<SectionComponentProps> = ({
  section,
  currentStepIndex,
  onAnswerSubmit,
  onNextStep,
  onPreviousStep,
  userAnswers,
  feedback,
  showAnswers,
  toggleShowAnswer,
  generalMessages
}) => {
  const step = section.steps[currentStepIndex];

  if (!step) return <p className="text-red-400">エラー: ステップが見つかりません。</p>;

  const renderContent = (contentItem: string | Question) => {
    if (typeof contentItem === 'string') {
      return <p className="whitespace-pre-line leading-relaxed text-slate-700">{contentItem}</p>;
    }
    // It's a Question
    const questionFeedback = feedback[contentItem.id];
    return (
      <QuestionComponent
        question={contentItem}
        onSubmit={(answer) => onAnswerSubmit(contentItem.id, answer)}
        userAnswer={userAnswers[contentItem.id]}
        feedback={questionFeedback}
        showAnswer={showAnswers[contentItem.id] || false}
        toggleShowAnswer={() => toggleShowAnswer(contentItem.id)}
        generalMessages={generalMessages}
      />
    );
  };

  const showPreviousButton = currentStepIndex > 0;
  const showNextButton = (typeof step.content === 'string' || (typeof step.content === 'object' && feedback[step.content.id]?.isCorrect !== undefined));

  return (
    <div className="p-6 md:p-8 rounded-xl shadow-xl mb-8 animate-fadeIn border bg-white border-gray-200">
      {section.introduction && currentStepIndex === 0 && (
         <div className="mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-sky-400 mb-2">このセクションの学習内容</h3>
            <p className="whitespace-pre-line leading-relaxed text-slate-700">{section.introduction}</p>
         </div>
      )}

      <div className="mb-6">
        {step.title && <h4 className="text-lg font-semibold mb-3 text-amber-600">{step.title}</h4>}
        {renderContent(step.content)}
        {step.imagePlaceholder && (
            <div className="mt-4 p-3 rounded text-center bg-gray-100">
                <p className="text-sm italic text-gray-600">[図示: {step.imagePlaceholder}]</p>
                <img src={`https://picsum.photos/seed/${step.id}/400/200`} alt={step.imagePlaceholder} className="mx-auto mt-2 rounded opacity-50"/>
            </div>
        )}
         {(typeof step.content === 'object' && step.content.reference) && (
          <p className="mt-3 text-xs italic text-gray-500">参照: {step.content.reference}</p>
        )}
         {(typeof step.content === 'string' && step.reference) && (
          <p className="mt-3 text-xs italic text-gray-500">参照: {step.reference}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {showPreviousButton && (
          <button
            onClick={onPreviousStep}
            className="w-full sm:w-auto flex-1 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75 bg-gray-600 hover:bg-gray-700 focus:ring-gray-400"
            aria-label={generalMessages.previousStep}
          >
            {generalMessages.previousStep}
          </button>
        )}
        {showNextButton && (
          <button
            onClick={onNextStep}
            className="w-full sm:w-auto flex-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
            aria-label={generalMessages.nextStep}
          >
            {generalMessages.nextStep}
          </button>
        )}
      </div>
    </div>
  );
};
// Removed local style definition for fadeIn as it's globally defined in App.tsx
