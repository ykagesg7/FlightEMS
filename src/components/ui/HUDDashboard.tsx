import React, { useEffect, useState } from 'react';

interface HUDTimeDisplayProps {
  className?: string;
}

export const HUDTimeDisplay: React.FC<HUDTimeDisplayProps> = ({ className = '' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '.');
  };

  return (
    <div className={`hud-time-display ${className}`}>
      <div className="text-center">
        <div className="text-lg font-bold">
          {formatTime(currentTime)}
        </div>
        <div className="text-xs opacity-80">
          {formatDate(currentTime)}
        </div>
      </div>
    </div>
  );
};
