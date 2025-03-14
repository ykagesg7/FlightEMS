import { useState, useEffect } from "react";
import { ExamQuestion } from "../types";

export const useExam = () => {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    fetch('/examQuestions.json')
      .then((response) => response.json())
      .then((data: ExamQuestion[]) => {
        setQuestions(data);
      })
      .catch((error) => {
        console.error('Failed to load exam questions:', error);
      });
  }, []);

  const selectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      alert('Exam finished!');
    }
  };

  return {
    questions,
    currentQuestionIndex,
    selectedOption: selectedOption === null ? -1 : selectedOption,
    isAnswered,
    selectOption,
    nextQuestion
  };
}; 