import React, { createContext, useContext, useMemo } from 'react';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { LearningContent } from '../types';

interface LearningProgress {
  id: string;
  user_id: string;
  content_id: string;
  completed: boolean;
  progress_percentage: number;
  last_position: number;
  last_read_at: string;
  read_count: number;
  created_at: string;
  updated_at: string;
}

interface ProgressContextType {
  userProgress: Record<string, LearningProgress>;
  learningContents: LearningContent[];
  isLoading: boolean;
  error: Error | null;
  updateProgress: (contentId: string, position: number) => Promise<void>;
  markAsCompleted: (contentId: string) => Promise<void>;
  getProgress: (contentId: string) => number;
  isCompleted: (contentId: string) => boolean;
  getLastReadInfo: (contentId: string) => { position: number; date: string } | null;
  resetProgress: (contentId: string) => Promise<void>;
  loadUserProgress: () => Promise<void>;
  loadLearningContents: () => Promise<void>;
  getContentsByCategory: (category?: string) => LearningContent[];
  getAllCategories: () => string[];
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const progressData = useLearningProgress();

  // Context値をuseMemoでラップ
  const contextValue = useMemo<ProgressContextType>(() => ({
    userProgress: progressData.userProgress,
    learningContents: progressData.learningContents,
    isLoading: progressData.isLoading,
    error: progressData.error,
    updateProgress: progressData.updateProgress,
    markAsCompleted: progressData.markAsCompleted,
    getProgress: progressData.getProgress,
    isCompleted: progressData.isCompleted,
    getLastReadInfo: progressData.getLastReadInfo,
    resetProgress: progressData.resetProgress,
    loadUserProgress: progressData.loadUserProgress,
    loadLearningContents: progressData.loadLearningContents,
    getContentsByCategory: progressData.getContentsByCategory,
    getAllCategories: progressData.getAllCategories,
  }), [
    progressData.userProgress,
    progressData.learningContents,
    progressData.isLoading,
    progressData.error,
    progressData.updateProgress,
    progressData.markAsCompleted,
    progressData.getProgress,
    progressData.isCompleted,
    progressData.getLastReadInfo,
    progressData.resetProgress,
    progressData.loadUserProgress,
    progressData.loadLearningContents,
    progressData.getContentsByCategory,
    progressData.getAllCategories,
  ]);

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
};

// 進捗コンテキストを使用するためのカスタムフック
export const useProgress = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
