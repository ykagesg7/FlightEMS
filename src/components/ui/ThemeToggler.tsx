import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggler: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = ['day', 'dark', 'auto'] as const;

  const nextTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'day':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" />
          </svg>
        );
      case 'dark':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        );
      case 'auto':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2V7L9 4L12 2ZM18 6V9H13V6H18ZM20 12A8 8 0 1 1 4 12A8 8 0 0 1 20 12ZM6 18V15H11V18H6ZM15 20L12 17L15 20Z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'day':
        return 'Day';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'Auto';
      default:
        return '';
    }
  };

  return (
    <button
      onClick={nextTheme}
      className="relative flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700"
      title={`現在: ${getThemeLabel()}テーマ (クリックして切り替え)`}
    >
      <span className="flex items-center justify-center">
        {getThemeIcon()}
      </span>
      <span className="hidden sm:inline">
        {getThemeLabel()}
      </span>
    </button>
  );
};
