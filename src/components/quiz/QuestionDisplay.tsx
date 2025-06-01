import React from 'react';
import { Question } from '../../types/quiz';
import { useTheme } from '../../contexts/ThemeContext';

interface QuestionDisplayProps {
  question: Question;
  selectedOptionIndex: number | null;
  isAnswered: boolean;
  showExplanation: boolean;
  onOptionSelect: (index: number) => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  selectedOptionIndex,
  isAnswered,
  showExplanation,
  onOptionSelect
}) => {
  const { theme } = useTheme();

  const getOptionClass = (index: number) => {
    const baseClass = "p-4 rounded-lg border cursor-pointer transition-all duration-200 text-left";
    
    if (!isAnswered) {
      // 回答前の状態
      if (selectedOptionIndex === index) {
        return `${baseClass} bg-indigo-100 border-indigo-500 text-indigo-900 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-200`;
      }
      return `${baseClass} bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100`;
    }
    
    // 回答後の状態
    const isCorrectOption = index === question.correct_option_index;
    const isSelectedOption = index === selectedOptionIndex;
    
    if (isCorrectOption) {
      return `${baseClass} bg-green-100 border-green-500 text-green-900 dark:bg-green-900/30 dark:border-green-400 dark:text-green-200`;
    }
    
    if (isSelectedOption && !isCorrectOption) {
      return `${baseClass} bg-red-100 border-red-500 text-red-900 dark:bg-red-900/30 dark:border-red-400 dark:text-red-200`;
    }
    
    return `${baseClass} bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 opacity-60`;
  };

  const getOptionIcon = (index: number) => {
    if (!isAnswered) {
      return selectedOptionIndex === index ? (
        <div className="w-5 h-5 rounded-full bg-indigo-500 border-2 border-indigo-500 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white"></div>
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
      );
    }

    const isCorrectOption = index === question.correct_option_index;
    const isSelectedOption = index === selectedOptionIndex;

    if (isCorrectOption) {
      return (
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    if (isSelectedOption && !isCorrectOption) {
      return (
        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    return (
      <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 opacity-60"></div>
    );
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'easy':
        return '初級';
      case 'medium':
        return '中級';
      case 'hard':
        return '上級';
      default:
        return level;
    }
  };

  return (
    <div className={`${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    } rounded-lg shadow-lg p-6`}>
      {/* 問題ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty_level)}`}>
            {getDifficultyLabel(question.difficulty_level)}
          </span>
        </div>
        
        {/* 問題文 */}
        <h2 className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
          {question.question_text}
        </h2>

        {/* 問題画像（もしあれば） */}
        {question.explanation_image_url && (
          <div className="mt-4">
            <img 
              src={question.explanation_image_url} 
              alt="問題に関連する画像"
              className="max-w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}
      </div>

      {/* 選択肢 */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={getOptionClass(index)}
            onClick={() => !isAnswered && onOptionSelect(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isAnswered) {
                onOptionSelect(index);
              }
            }}
          >
            <div className="flex items-start space-x-3">
              {getOptionIcon(index)}
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                  選択肢 {String.fromCharCode(65 + index)}
                </span>
                <p className="text-base leading-relaxed">
                  {option}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 解説表示 */}
      {showExplanation && question.explanation && (
        <div className={`mt-6 p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
        } border-l-4 border-blue-400`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                解説
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                {question.explanation}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 回答状況の表示 */}
      {isAnswered && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            正解: <span className="font-medium text-green-600 dark:text-green-400">
              {String.fromCharCode(65 + question.correct_option_index)} - {question.options[question.correct_option_index]}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay; 