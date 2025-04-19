import React from "react";
import { useExam } from "../../hooks/useExam";
import QuestionCard from "../ui/QuestionCard";
import AnswerFeedback from "../ui/AnswerFeedback";

const ExamTab: React.FC = () => {
  const { questions, currentQuestionIndex, selectOption, isAnswered, selectedOption, nextQuestion } = useExam();

  if (!questions.length) return <div>Loading...</div>;

  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Exam</h2>
      <QuestionCard 
        question={currentQuestion} 
        onSelectOption={selectOption} 
        disabled={isAnswered} 
        selectedOption={selectedOption} 
      />
      {isAnswered && (
        <>
          <AnswerFeedback 
            correctOption={currentQuestion.options[currentQuestion.correctOptionIndex]} 
            isCorrect={selectedOption === currentQuestion.correctOptionIndex}
            explanation={currentQuestion.explanation} 
          />
          <div className="mt-4">
            <button
              onClick={nextQuestion}
              className="px-4 py-2 bg-indigo-500 text-white rounded"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamTab; 
