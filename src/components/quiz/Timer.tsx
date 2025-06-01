import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface TimerProps {
  timeRemaining: number; // 秒単位
  totalTime: number; // 秒単位
}

const Timer: React.FC<TimerProps> = ({ timeRemaining, totalTime }) => {
  const { theme } = useTheme();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentage = (timeRemaining / totalTime) * 100;
    
    if (percentage > 50) {
      return 'text-green-600 dark:text-green-400';
    } else if (percentage > 20) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  };

  const getProgressColor = () => {
    const percentage = (timeRemaining / totalTime) * 100;
    
    if (percentage > 50) {
      return 'bg-green-500';
    } else if (percentage > 20) {
      return 'bg-yellow-500';
    } else {
      return 'bg-red-500';
    }
  };

  const progressPercentage = Math.max(0, (timeRemaining / totalTime) * 100);

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <svg className={`w-4 h-4 ${getTimerColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={`text-sm font-medium ${getTimerColor()}`}>
          {formatTime(timeRemaining)}
        </span>
      </div>
      
      {/* プログレスバー */}
      <div className={`w-20 h-2 rounded-full ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default Timer; 