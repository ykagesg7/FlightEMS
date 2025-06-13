import React, { useState } from 'react';
import { QuizQuestion, QuestionType, UserQuizAnswer } from '../types/quiz';
import { QuestionComponent } from './QuestionComponent'; // Reusing for individual question rendering
import { useTheme } from '../contexts/ThemeContext';

interface QuizComponentProps {
  quizTitle: string;
  questions: QuizQuestion[];
  onSubmitQuiz: (answers: UserQuizAnswer[]) => void;
  generalMessages: {
    submitAnswer: string;
    correct: string;
    incorrect: string;
    startQuiz: string; 
    quizSummary: string; 
    showAnswer: string;
    hideAnswer: string;
    // Added from parent (App.tsx -> constants.ts)
    nextQuestion: string;
    finishQuiz: string;
  }
}

export const QuizComponent: React.FC<QuizComponentProps> = ({ quizTitle, questions, onSubmitQuiz, generalMessages }) => {
  const { theme } = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserQuizAnswer[]>([]);
  const [feedback, setFeedback] = useState<{ [key: string]: { isCorrect: boolean; explanation: string; userAnswer?: string | number } }>({});
  const [showTextAnswers, setShowTextAnswers] = useState<{ [key: string]: boolean }>({});


  const handleAnswerSubmit = (questionId: string, answer: string | number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    let isCorrect = false;
    if (question.type === QuestionType.NUMBER_INPUT) {
      isCorrect = parseFloat(answer as string) === question.correctAnswer;
    } else if (question.type === QuestionType.TEXT_INPUT) {
       isCorrect = (answer as string).trim().toLowerCase() === (question.correctAnswer as string).trim().toLowerCase();
    }
    else {
      isCorrect = answer === question.correctAnswer;
    }
    
    setFeedback(prev => ({
        ...prev,
        [questionId]: { isCorrect, explanation: question.explanation, userAnswer: answer }
    }));

    setUserAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(a => a.questionId === questionId);
      const newAnswer = { questionId, answer, isCorrect };
      if (existingAnswerIndex > -1) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
        return updatedAnswers;
      }
      return [...prevAnswers, newAnswer];
    });
  };

  const toggleShowTextAnswer = (questionId: string) => {
    setShowTextAnswers(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // All questions answered, submit quiz
      onSubmitQuiz(userAnswers);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentFeedback = feedback[currentQuestion.id];

  return (
    <div className={`p-6 md:p-8 rounded-xl shadow-xl animate-fadeIn border ${
      theme === 'dark' 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h2 className="text-2xl font-bold text-center text-sky-400 mb-6">{quizTitle}</h2>
      <p className={`text-center mb-6 ${
        theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
      }`}>質問 {currentQuestionIndex + 1} / {questions.length}</p>
      
      <QuestionComponent
        question={currentQuestion}
        onSubmit={(answer) => handleAnswerSubmit(currentQuestion.id, answer)}
        feedback={currentFeedback}
        showAnswer={showTextAnswers[currentQuestion.id] || false}
        toggleShowAnswer={() => toggleShowTextAnswer(currentQuestion.id)}
        generalMessages={generalMessages}
      />

      {currentFeedback && (
        <button
          onClick={handleNextQuestion}
          className="mt-6 w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
        >
          {currentQuestionIndex < questions.length - 1 ? generalMessages.nextQuestion : generalMessages.finishQuiz}
        </button>
      )}
    </div>
  );
};