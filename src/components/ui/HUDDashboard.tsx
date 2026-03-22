import React, { useEffect, useState, useMemo, useRef } from 'react';

interface HUDTimeDisplayProps {
  className?: string;
  /** ヘッダー横並びなどで左揃えにしたいとき */
  textAlign?: 'center' | 'start';
  /** ヘッダー帯用の小さめタイポ */
  density?: 'default' | 'compact';
}

export const HUDTimeDisplay: React.FC<HUDTimeDisplayProps> = ({
  className = '',
  textAlign = 'center',
  density = 'default',
}) => {
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

  const alignCls = textAlign === 'start' ? 'text-left' : 'text-center';
  const compact = density === 'compact';

  return (
    <div className={`hud-time-display ${className}`}>
      <div className={alignCls}>
        <div
          className={`font-bold tabular-nums text-[color:var(--hud-primary)] ${
            compact ? 'text-sm md:text-base leading-none' : 'text-lg leading-tight'
          }`}
        >
          {formattedTime}
        </div>
        <div
          className={`text-[color:var(--semantic-text-muted)] ${
            compact ? 'mt-0.5 text-[10px] md:text-xs leading-tight' : 'mt-1 text-sm'
          }`}
        >
          {currentDate}
        </div>
      </div>
    </div>
  );
};
