import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface HUDTimeDisplayProps {
  className?: string;
}

export const HUDTimeDisplay: React.FC<HUDTimeDisplayProps> = ({ className = '' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { effectiveTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`hud-time-display ${className}`}>
      <div className="text-center">
        <div className="text-lg font-bold" style={effectiveTheme === 'day' ? { color: '#39FF14' } : effectiveTheme === 'dark' ? { color: '#FF3B3B' } : {}}>
          {formatTime(currentTime)}
        </div>
        <div className="text-sm mt-1" style={effectiveTheme === 'day' ? { color: '#39FF14' } : effectiveTheme === 'dark' ? { color: '#FF3B3B' } : {}}>
          {currentTime.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Tokyo',
          })}
        </div>
      </div>
    </div>
  );
};
