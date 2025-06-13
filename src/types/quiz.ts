// 4択問題システム用の型定義
// FlightAcademy Quiz System Types

// ===============================
// データベース対応型
// ===============================

export interface QuestionCategory {
  id: string;
  name: string;
  user_id: string | null; // nullの場合はシステム定義カテゴリ
  created_at: string;
  updated_at: string;
}

export interface CardDeck {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  // リレーション
  category?: QuestionCategory;
  questions?: Question[];
  question_count?: number;
}

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
  deck_id: string;
  question_text: string;
  options: string[]; // 4つの選択肢
  correct_option_index: number; // 0-3
  explanation: string | null;
  explanation_image_url: string | null;
  difficulty_level: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
  // リレーション
  deck?: CardDeck;
  type: QuestionType;
  correctAnswer: string | number;
  reference?: string;
  imagePlaceholder?: string;
  // フロントエンド互換フィールド（旧版コンポーネント用）
  text?: string;            // = question_text
  options?: Option[];       // 詳細型オプション（id,text）
}

export interface LearningRecord {
  id: string;
  user_id: string;
  question_id: string;
  attempt_number: number;
  attempt_date: string;
  is_correct: boolean;
  response_time_ms: number | null;
  marked_status: 'checked' | 'unknown' | null;
  created_at: string;
  // リレーション
  question?: Question;
}

export interface UserQuestionSRSStatus {
  user_id: string;
  question_id: string;
  next_review_date: string | null;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  last_attempt_record_id: string | null;
  updated_at: string;
  // リレーション
  question?: Question;
  last_attempt_record?: LearningRecord;
}

// ===============================
// フロントエンド用型
// ===============================

export interface QuizSession {
  id: string;
  deck_id: string;
  questions: Question[];
  current_question_index: number;
  total_questions: number;
  start_time: Date;
  end_time?: Date;
  score?: number;
  time_limit_minutes?: number;
}

export interface QuizAnswer {
  question_id: string;
  selected_option_index: number;
  is_correct: boolean;
  response_time_ms: number;
  marked_for_review?: boolean;
}

export interface QuizResult {
  session_id: string;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  score_percentage: number;
  total_time_ms: number;
  average_time_per_question: number;
  answers: QuizAnswer[];
  difficulty_breakdown: {
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
  category_breakdown: {
    [category_name: string]: { correct: number; total: number };
  };
}

export interface QuizSettings {
  deck_id: string;
  question_count?: number; // 全問題数または指定数
  difficulty_levels?: ('easy' | 'medium' | 'hard')[];
  time_limit_minutes?: number;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  review_mode?: boolean; // SRSで復習対象の問題のみ
}

// ===============================
// UI状態管理用型
// ===============================

export interface QuizUIState {
  currentQuestion: Question | null;
  selectedOptionIndex: number | null;
  isAnswered: boolean;
  showExplanation: boolean;
  timeRemaining?: number;
  isLoading: boolean;
  error?: string;
}

export interface DeckSelectorState {
  categories: QuestionCategory[];
  decks: CardDeck[];
  selectedCategoryId: string | null;
  selectedDeckId: string | null;
  loading: boolean;
  error?: string;
}

// ===============================
// RPC関数用型
// ===============================

export interface GetQuizSessionParams {
  deck_id: string;
  question_count?: number;
  difficulty_levels?: string[];
  review_mode?: boolean;
}

export interface GetQuizSessionResult {
  session_id: string;
  questions: Question[];
}

export interface SubmitAnswerParams {
  session_id: string;
  question_id: string;
  selected_option_index: number;
  response_time_ms: number;
  marked_for_review?: boolean;
}

export interface SubmitAnswerResult {
  is_correct: boolean;
  correct_option_index: number;
  explanation?: string;
  srs_updated: boolean;
}

export interface GetReviewQuestionsParams {
  user_id: string;
  limit?: number;
  categories?: string[];
}

export interface CategoryPerformanceStats {
  category_id: string;
  category_name: string;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  accuracy_percentage: number;
  average_response_time_ms: number;
  last_attempt_date?: string;
}

// ===============================
// Zustand Store用型
// ===============================

export interface QuizStore {
  // 現在のセッション状態
  currentSession: QuizSession | null;
  currentAnswer: QuizAnswer | null;
  uiState: QuizUIState;
  
  // 利用可能なデッキ・カテゴリ
  categories: QuestionCategory[];
  decks: CardDeck[];
  
  // アクション
  startQuizSession: (settings: QuizSettings) => Promise<void>;
  submitAnswer: (answer: Omit<QuizAnswer, 'is_correct'>) => Promise<SubmitAnswerResult>;
  nextQuestion: () => void;
  markForReview: (questionId: string) => void;
  endSession: () => Promise<QuizResult>;
  
  // データ取得
  loadCategories: () => Promise<void>;
  loadDecks: (categoryId?: string) => Promise<void>;
  loadReviewQuestions: (limit?: number) => Promise<Question[]>;
  
  // UI状態管理
  setSelectedOption: (index: number) => void;
  showExplanation: () => void;
  resetUIState: () => void;
}

// ===============================
// 既存ExamTab統合用型
// ===============================

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

// 既存ExamQuestionから新しいQuestion型への変換関数用の型
export interface QuestionConverter {
  fromExamQuestion: (examQ: ExamQuestion) => Question;
  toExamQuestion: (question: Question) => ExamQuestion;
}

// ===============================
// エラー処理用型
// ===============================

export interface QuizError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type QuizErrorCode = 
  | 'DECK_NOT_FOUND'
  | 'INSUFFICIENT_QUESTIONS'
  | 'SESSION_EXPIRED'
  | 'NETWORK_ERROR'
  | 'PERMISSION_DENIED'
  | 'INVALID_ANSWER'
  | 'DATABASE_ERROR';

// ===============================
// CSV インポート用型
// ===============================

export interface QuestionImportData {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  category_name?: string;
}

export interface ImportResult {
  success_count: number;
  error_count: number;
  errors: Array<{
    row: number;
    message: string;
    data: QuestionImportData;
  }>;
}

// ===============================
// 学習統計用型
// ===============================

export interface LearningStats {
  total_sessions: number;
  total_questions_answered: number;
  overall_accuracy: number;
  average_session_time_minutes: number;
  current_streak_days: number;
  longest_streak_days: number;
  categories_mastered: number;
  total_study_time_hours: number;
  recent_performance: Array<{
    date: string;
    accuracy: number;
    questions_answered: number;
  }>;
}

export interface Step {
  id: string;
  type: 'text' | 'question';
  title?: string;
  content: string | Question;
  imagePlaceholder?: string;
  reference?: string;
}

export interface Section {
  id: string;
  title: string;
  introduction?: string;
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
    nextQuestion: string;
    finishQuiz: string;
    unanswered: string;
  };
}

export interface UserQuizAnswer {
  questionId: string;
  answer: string | number;
  isCorrect: boolean;
}

// 空のインターフェースを削除し、必要に応じて適切な型を定義
export interface EmptyInterface {
  // 将来的に拡張される可能性がある場合のプレースホルダー
  [key: string]: never;
}