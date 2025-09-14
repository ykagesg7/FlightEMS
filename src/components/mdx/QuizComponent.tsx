import React, { useState } from 'react';

type QuizType = 'single' | 'multiple';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizComponentProps {
  question: string;
  options: QuizOption[];
  type?: QuizType;
  explanation?: string;
}

/**
 * MDX内で使用できるインタラクティブなクイズコンポーネント
 * - 単一選択問題と複数選択問題をサポート
 * - 回答後にフィードバックを表示
 * - 解説を表示
 */
const QuizComponent: React.FC<QuizComponentProps> = ({
  question,
  options,
  type = 'single',
  explanation,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    if (isSubmitted) return;

    if (type === 'single') {
      setSelectedOptions([optionId]);
    } else {
      // 複数選択の場合、すでに選択されていれば削除、なければ追加
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    }
  };

  const checkAnswer = () => {
    if (type === 'single') {
      // 単一選択の場合は選択した選択肢が正解かどうかをチェック
      const selectedOption = options.find((option) => option.id === selectedOptions[0]);
      setIsCorrect(selectedOption?.isCorrect || false);
    } else {
      // 複数選択の場合は、正解の選択肢がすべて選択されており、
      // かつ不正解の選択肢が選択されていないかをチェック
      const correctOptionIds = options.filter((option) => option.isCorrect).map((option) => option.id);
      const allCorrectSelected = correctOptionIds.every((id) => selectedOptions.includes(id));
      const noIncorrectSelected = selectedOptions.every((id) => correctOptionIds.includes(id));
      setIsCorrect(allCorrectSelected && noIncorrectSelected);
    }
    setIsSubmitted(true);
  };

  const resetQuiz = () => {
    setSelectedOptions([]);
    setIsSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <div className="my-8 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="bg-indigo-700 text-white p-4">
        <h3 className="font-bold text-lg">問題</h3>
        <p className="mt-1">{question}</p>
      </div>

      <div className="p-4 space-y-3">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          let optionClass = 'border rounded-md p-3 flex items-start cursor-pointer hover:bg-gray-50';
          
          if (isSubmitted) {
            if (option.isCorrect) {
              optionClass += ' bg-green-50 border-green-500';
            } else if (isSelected && !option.isCorrect) {
              optionClass += ' bg-red-50 border-red-500';
            }
          } else if (isSelected) {
            optionClass += ' bg-indigo-50 border-indigo-500';
          }

          return (
            <div
              key={option.id}
              className={optionClass}
              onClick={() => handleOptionSelect(option.id)}
            >
              <div className="flex-shrink-0 mr-3">
                {type === 'single' ? (
                  <div className={`w-5 h-5 rounded-full border ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'} flex items-center justify-center`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                ) : (
                  <div className={`w-5 h-5 rounded border ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'} flex items-center justify-center`}>
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              <div>
                <div>{option.text}</div>
                {isSubmitted && option.explanation && (
                  <div className="mt-2 text-sm text-gray-600">
                    {option.explanation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-gray-50 border-t">
        {!isSubmitted ? (
          <button
            onClick={checkAnswer}
            disabled={selectedOptions.length === 0}
            className={`px-4 py-2 rounded-md ${
              selectedOptions.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            回答する
          </button>
        ) : (
          <div>
            <div className={`p-4 rounded-md ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} mb-4`}>
              {isCorrect ? '正解です！' : '不正解です。もう一度チャレンジしてみてください。'}
              {explanation && <div className="mt-2">{explanation}</div>}
            </div>
            <button
              onClick={resetQuiz}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              もう一度挑戦
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizComponent; 