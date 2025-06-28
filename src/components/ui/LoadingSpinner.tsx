import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const LoadingSpinner: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
          theme === 'dark' ? 'border-indigo-400' : 'border-indigo-600'
        }`}></div>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          ページを読み込んでいます...
        </p>
      </div>
    </div>
  );
}; 