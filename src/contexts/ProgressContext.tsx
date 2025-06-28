import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { LearningContent, ProgressStats } from '../types';

interface Progress {
  [contentId: string]: {
    completed: boolean;
    lastReadPosition: number; // スクロール位置
    lastReadDate: string; // 最後に読んだ日時
    readCount: number; // 読んだ回数
  };
}

interface ProgressContextType {
  progress: ProgressStats | null;
  updateProgress: (unitId: string) => void;
  getProgress: () => number;
  isUnitCompleted: (unitId: string) => boolean;
  completedUnits: string[];
  userStats: {
    totalLessons: number;
    completedLessons: number;
  };
  learningContents: LearningContent[];
  loading: boolean;
  error: string | null;
  getContentsByCategory: (category?: string) => LearningContent[];
  refreshContents: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Supabaseベースの進捗管理フックを使用
  const {
    userProgress,
    learningContents,
    isLoading,
    error,
    updateProgress,
    markAsCompleted,
    getProgress,
    isCompleted,
    getLastReadInfo,
    resetProgress,
    loadUserProgress,
    loadLearningContents,
    getContentsByCategory,
    getAllCategories
  } = useLearningProgress();

  return (
    <ProgressContext.Provider value={{ 
      progress: userProgress, 
      updateProgress, 
      markAsCompleted, 
      getProgress, 
      isCompleted,
      getLastReadInfo,
      resetProgress,
      // 新しい機能
      learningContents,
      isLoading,
      error,
      loadUserProgress,
      loadLearningContents,
      getContentsByCategory,
      getAllCategories
    }}>
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