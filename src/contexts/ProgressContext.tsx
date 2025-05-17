import React, { createContext, useState, useContext, useEffect } from 'react';

interface Progress {
  [contentId: string]: {
    completed: boolean;
    lastReadPosition: number; // スクロール位置
    lastReadDate: string; // 最後に読んだ日時
    readCount: number; // 読んだ回数
  };
}

interface ProgressContextType {
  progress: Progress;
  updateProgress: (contentId: string, position: number) => void;
  markAsCompleted: (contentId: string) => void;
  getProgress: (contentId: string) => number; // 0-100の%で進捗を返す
  isCompleted: (contentId: string) => boolean;
  getLastReadInfo: (contentId: string) => { position: number, date: string } | null;
  resetProgress: (contentId: string) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const STORAGE_KEY = 'flightacademy_reading_progress';

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ローカルストレージから進捗データを読み込む
  const [progress, setProgress] = useState<Progress>(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        return JSON.parse(savedProgress);
      } catch (e) {
        console.error('進捗データの解析に失敗しました', e);
      }
    }
    return {};
  });

  // 進捗データが変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // 進捗を更新する関数
  const updateProgress = (contentId: string, position: number) => {
    setProgress(prevProgress => {
      const contentProgress = prevProgress[contentId] || { 
        completed: false, 
        lastReadPosition: 0, 
        lastReadDate: new Date().toISOString(),
        readCount: 0
      };
      
      return {
        ...prevProgress,
        [contentId]: {
          ...contentProgress,
          lastReadPosition: position,
          lastReadDate: new Date().toISOString(),
          readCount: contentProgress.readCount + 1
        }
      };
    });
  };

  // コンテンツを完了としてマークする関数
  const markAsCompleted = (contentId: string) => {
    setProgress(prevProgress => {
      const contentProgress = prevProgress[contentId] || { 
        completed: false, 
        lastReadPosition: 0, 
        lastReadDate: new Date().toISOString(),
        readCount: 0
      };
      
      return {
        ...prevProgress,
        [contentId]: {
          ...contentProgress,
          completed: true,
          lastReadDate: new Date().toISOString()
        }
      };
    });
  };

  // 進捗率を取得する関数 (0-100%)
  const getProgress = (contentId: string): number => {
    const contentProgress = progress[contentId];
    
    if (!contentProgress) {
      return 0;
    }
    
    if (contentProgress.completed) {
      return 100;
    }

    // スクロール位置ベースの進捗計算（簡易的な実装）
    // ここでは仮に、全体の高さを100%とした場合の相対位置を返す
    // 実際には、コンテンツの総行数や高さに応じた計算が必要
    const position = contentProgress.lastReadPosition;
    // 仮の計算 - 実際のアプリケーションでは調整が必要
    return Math.min(Math.round(position / 10), 99);
  };

  // コンテンツが完了しているかどうかを確認する関数
  const isCompleted = (contentId: string): boolean => {
    return progress[contentId]?.completed || false;
  };

  // 最後に読んだ位置と日時を取得する関数
  const getLastReadInfo = (contentId: string) => {
    const contentProgress = progress[contentId];
    
    if (!contentProgress) {
      return null;
    }
    
    return {
      position: contentProgress.lastReadPosition,
      date: contentProgress.lastReadDate
    };
  };

  // 進捗をリセットする関数
  const resetProgress = (contentId: string) => {
    setProgress(prevProgress => {
      const newProgress = { ...prevProgress };
      delete newProgress[contentId];
      return newProgress;
    });
  };

  return (
    <ProgressContext.Provider value={{ 
      progress, 
      updateProgress, 
      markAsCompleted, 
      getProgress, 
      isCompleted,
      getLastReadInfo,
      resetProgress
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