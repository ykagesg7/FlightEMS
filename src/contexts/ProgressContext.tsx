import React, { createContext, useContext, useMemo } from 'react';
import { useLearningProgress } from '../hooks/useLearningProgress';
// import { useAuth } from './AuthContext';
// ProgressContextで認証情報が必要な場合はuseAuthStoreやuseAuthを直接使ってください。
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
  const progressData = useLearningProgress();

  // Context値をuseMemoでラップ
  const contextValue = useMemo(() => ({
    ...progressData
  }), [
    progressData.userProgress,
    progressData.learningContents,
    progressData.isLoading,
    progressData.error
    // 必要に応じて他の依存も追加
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
