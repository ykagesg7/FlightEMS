import React, { useEffect, useState, useMemo, useRef } from 'react';

interface HUDTimeDisplayProps {
  className?: string;
}

export const HUDTimeDisplay: React.FC<HUDTimeDisplayProps> = ({ className = '' }) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Tokyo',
    });
  });
  const lastDateStringRef = useRef(currentDate);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // 日付が変わった場合のみ更新（パフォーマンス最適化）
      const newDateString = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Tokyo',
      });
      if (newDateString !== lastDateStringRef.current) {
        setCurrentDate(newDateString);
        lastDateStringRef.current = newDateString;
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []); // 依存配列を空にして、マウント時のみ実行

  // 時刻フォーマットをメモ化（パフォーマンス最適化）
  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [currentTime]);

  return (
    <div className={`hud-time-display ${className}`}>
      <div className="text-center">
        <div className="text-lg font-bold text-whiskyPapa-yellow">
          {formattedTime}
        </div>
        <div className="text-sm mt-1 text-gray-400">
          {currentDate}
        </div>
      </div>
    </div>
  );
};
