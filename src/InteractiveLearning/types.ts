export enum QuestionType {
  MULTIPLE_CHOICE,
  NUMBER_INPUT,
  TEXT_INPUT,
}

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: Option[];
  correctAnswer: string | number; // For MC (option id), number input, or specific text for TEXT_INPUT validation
  explanation: string;
  reference?: string;
  imagePlaceholder?: string; // e.g., "HSI図：コース090、CDB中央"
}

export interface Step {
  id: string;
  type: 'text' | 'question';
  title?: string;
  content: string | Question; // Text content or a Question object
  imagePlaceholder?: string; // For general step images
  reference?: string; // For references applicable to the step itself, especially text steps
}

export interface Section {
  id: string;
  title: string;
  introduction?: string; // Optional introduction for the section
  steps: Step[];
}

export interface QuizQuestion extends Question {}

export interface AppContentData {
  appName: string;
  sections: Section[];
  quizTitle: string;
  quizQuestions: QuizQuestion[];
  generalMessages: {
    startLearning: string;
    nextStep: string;
    previousStep: string;
    submitAnswer: string;
    correct: string;
    incorrect: string;
    viewExplanation: string;
    nextSection: string;
    backToSections: string;
    backToContents: string;
    startQuiz: string;
    quizSummary: string;
    yourScore: string;
    retakeQuiz: string;
    finalThoughts: string;
    showAnswer: string;
    hideAnswer: string;
    tableOfContents: string;
    appOverview: string;
    selectSectionToStart: string;
    // Added for QuizComponent button texts
    nextQuestion: string;
    finishQuiz: string;
    // Added for App.tsx quiz results
    unanswered: string;
  };
}

// For user answers in the quiz
export interface UserQuizAnswer {
  questionId: string;
  answer: string | number;
  isCorrect: boolean;
}