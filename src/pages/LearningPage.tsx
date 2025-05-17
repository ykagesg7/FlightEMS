import React from 'react';
import LearningTabMDX from '../components/mdx/LearningTabMDX';
import { useTheme } from '../contexts/ThemeContext';
import { useProgress } from '../contexts/ProgressContext';

function LearningPage() {
  const { theme } = useTheme();
  const { progress, getProgress, isCompleted, getLastReadInfo } = useProgress();
  
  // コンテンツIDを定数として定義
  const CONTENT_ID = '91801e15-cd20-4ba4-9ad3-6c755a6e08fa';
  
  // このコンテンツの進捗情報を取得
  const progressPercentage = getProgress(CONTENT_ID);
  const completed = isCompleted(CONTENT_ID);
  const lastReadInfo = getLastReadInfo(CONTENT_ID);
  
  return (
    <div className={`${
      theme === 'dark' 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-indigo-100 to-purple-100'
    } min-h-screen`}>
      <div className="container mx-auto px-1 sm:px-2 md:px-4 py-2 sm:py-4 md:py-6">
        {/* 進捗情報の表示 */}
        {lastReadInfo && (
          <div className={`mb-4 p-3 rounded-lg shadow-md ${
            theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">学習の進捗状況</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                completed 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                {completed ? '完了' : `${progressPercentage}%`}
              </span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm">
              <p>最終アクセス: {new Date(lastReadInfo.date).toLocaleString('ja-JP')}</p>
            </div>
          </div>
        )}
        
        <LearningTabMDX />
      </div>
    </div>
  );
}

export default LearningPage; 