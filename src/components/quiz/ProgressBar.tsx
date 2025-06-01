import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ProgressBarProps {
  progress: number; // 0-100のパーセンテージ
  showPercentage?: boolean;
  height?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'indigo' | 'purple';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  showPercentage = false,
  height = 'md',
  color = 'indigo'
}) => {
  const { theme } = useTheme();

  const getHeightClass = () => {
    switch (height) {
      case 'sm':
        return 'h-1';
      case 'md':
        return 'h-2';
      case 'lg':
        return 'h-3';
      default:
        return 'h-2';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'indigo':
        return 'bg-indigo-500';
      case 'purple':
        return 'bg-purple-500';
      default:
        return 'bg-indigo-500';
    }
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      <div className={`w-full ${getHeightClass()} rounded-full ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div
          className={`${getHeightClass()} rounded-full transition-all duration-300 ease-out ${getColorClass()}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">0%</span>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {Math.round(clampedProgress)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">100%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar; 