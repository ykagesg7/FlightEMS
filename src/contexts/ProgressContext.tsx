import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLearningProgress } from '../hooks/useLearningProgress';

interface Progress {
  [contentId: string]: {
    completed: boolean;
    lastReadPosition: number; // スクロール位置
    lastReadDate: string; // 最後に読んだ日時
    readCount: number; // 読んだ回数
  };
}

interface ProgressContextType {
  progress: any;
  updateProgress: (contentId: string, position: number) => void;
  markAsCompleted: (contentId: string) => void;
  getProgress: (contentId: string) => number; // 0-100の%で進捗を返す
  isCompleted: (contentId: string) => boolean;
  getLastReadInfo: (contentId: string) => { position: number, date: string } | null;
  resetProgress: (contentId: string) => void;
  // 新しい機能
  learningContents: any[];
  isLoading: boolean;
  error: Error | null;
  loadUserProgress: () => Promise<void>;
  loadLearningContents: () => Promise<void>;
  getContentsByCategory: (category?: string) => any[];
  getAllCategories: () => string[];
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