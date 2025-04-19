import React from "react";
import { ExamQuestion } from "../../types";

interface QuestionCardProps {
  question: ExamQuestion;
  onSelectOption: (index: number) => void;
  disabled: boolean;
  selectedOption: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onSelectOption, disabled, selectedOption }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{question.question}</h3>
      <ul className="space-y-2">
        {question.options.map((option, index) => (
          <li key={index}>
            <button
              className={`p-2 border rounded w-full text-left ${selectedOption === index ? 'bg-blue-200' : ''}`}
              onClick={() => onSelectOption(index)}
              disabled={disabled}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionCard; 