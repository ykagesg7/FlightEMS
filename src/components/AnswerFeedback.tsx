import React from "react";

interface AnswerFeedbackProps {
  correctOption: string;
  isCorrect: boolean;
  explanation: string;
}

const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({ correctOption, isCorrect, explanation }) => {
  return (
    <div className={`mt-4 p-4 border rounded ${isCorrect ? "border-green-500" : "border-red-500"}` }>
      <p className="font-bold">{isCorrect ? "Correct!" : "Incorrect!"}</p>
      <p>Correct Answer: {correctOption}</p>
      <p className="mt-2">{explanation}</p>
    </div>
  );
};

export default AnswerFeedback; 