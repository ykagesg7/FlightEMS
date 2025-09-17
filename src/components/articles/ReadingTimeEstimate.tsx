import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ReadingTimeEstimateProps {
  /** 記事の推定読了時間（分） */
  totalReadingTime?: number;
  /** スクロール進捗率（0-1） */
  progress?: number;
  /** コンパクト表示 */
  compact?: boolean;
}

const ReadingTimeEstimate: React.FC<ReadingTimeEstimateProps> = ({
  totalReadingTime = 5,
  progress = 0,
  compact = false
}) => {
  const { effectiveTheme } = useTheme();
  const [remainingTime, setRemainingTime] = useState(totalReadingTime);

  useEffect(() => {
    // 進捗に基づいて残り時間を計算
    const remaining = Math.max(0, Math.ceil(totalReadingTime * (1 - progress)));
    setRemainingTime(remaining);
  }, [totalReadingTime, progress]);

  const formatTime = (minutes: number) => {
    if (minutes === 0) return '完読';
    if (minutes < 1) return '1分未満';
    return `残り${minutes}分`;
  };

  const getProgressColor = () => {
    if (progress >= 0.9) {
      return effectiveTheme === 'dark' ? 'text-green-400' : 'text-green-600';
    }
    if (progress >= 0.5) {
      return effectiveTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
    }
    return effectiveTheme === 'dark' ? 'text-blue-400' : 'text-blue-600';
  };

  const getIcon = () => {
    if (remainingTime === 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1 text-sm ${getProgressColor()}`}>
        {getIcon()}
        <span>{formatTime(remainingTime)}</span>
      </div>
    );
  }

  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg border transition-all duration-300
      ${effectiveTheme === 'dark'
        ? 'hud-surface text-gray-200'
        : 'bg-white border-gray-200 text-gray-800'
      }
    `}>
      <div className={`flex items-center gap-2 ${getProgressColor()}`}>
        {getIcon()}
        <span className="font-medium">{formatTime(remainingTime)}</span>
      </div>

      {progress > 0 && (
        <div className="flex-1 min-w-0">
          <div className={`
            h-2 rounded-full overflow-hidden
            ${effectiveTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}
          `}>
            <div
              className={`
                h-full transition-all duration-300 ease-out rounded-full
                ${progress >= 0.9
                  ? (effectiveTheme === 'dark' ? 'bg-green-400' : 'bg-green-500')
                  : progress >= 0.5
                    ? (effectiveTheme === 'dark' ? 'bg-yellow-400' : 'bg-yellow-500')
                    : (effectiveTheme === 'dark' ? 'bg-blue-400' : 'bg-blue-500')
                }
              `}
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 text-[color:var(--text-primary)] opacity-70">
            <span>0%</span>
            <span>{Math.round(progress * 100)}%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingTimeEstimate;
