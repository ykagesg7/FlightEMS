import type { Database } from './database.types';
import type { QuizQuestion } from './quiz';

// 学習コンテンツ関連型
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];

// クイズ関連型
export interface QuizAnswer {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  startTime: Date;
  endTime?: Date;
  score?: number;
  settings: QuizSettings;
}

export interface QuizSettings {
  category?: string;
  questionCount: number;
  timeLimit?: number;
  randomOrder: boolean;
}

// CPL試験関連型
export interface CPLExamQuestion extends QuizQuestion {
  exam_date: string;
  subject: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
}

export interface CPLExamSession extends QuizSession {
  examDate: string;
  subject: string;
  questionCount: number;
}

export interface CPLExamResult {
  sessionId: string;
  examDate: string;
  subject: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: QuizAnswer[];
  completedAt: Date;
}

// 学習分析関連型
export interface LearningAnalytics {
  totalStudyTime: number;
  averageScore: number;
  completedContents: number;
  totalContents: number;
  weakAreas: string[];
  strongAreas: string[];
  progressTrend: 'improving' | 'stable' | 'declining';
  recommendedActions: string[];
}

export interface ContentEffectiveness {
  contentId: string;
  title: string;
  category: string;
  viewCount: number;
  completionRate: number;
  averageRating: number;
  lastUpdated: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  contentId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  progress: number;
  metadata?: SessionMetadata;
}

// 学習セッション メタデータ型定義
export interface SessionMetadata {
  userAgent?: string;
  screenResolution?: string;
  timezone?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  studyMode?: 'focused' | 'casual' | 'review';
  contentLanguage?: 'ja' | 'en';
  difficultyPreference?: number; // 1-5
  customNotes?: string;
  [key: string]: string | number | boolean | undefined;
}

// 進捗追跡関連型
export interface ProgressStats {
  totalProgress: number;
  weeklyProgress: number;
  completedUnits: string[];
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  contents: LearningContent[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
}

// テスト結果統計型定義
export interface TestSessionStats {
  sessionId: string;
  learningContentId?: string;
  subjectCategory: string;
  totalQuestions: number;
  correctAnswers: number;
  date: string;
  accuracy: number;
}

// 科目別統計型定義
export interface SubjectStats {
  total: number;
  correct: number;
}

export interface LearningContent {
  id: string;
  title: string;
  category: string;
  sub_category: string | null;
  description: string | null;
  order_index: number;
  parent_id: string | null;
  content_type: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}
