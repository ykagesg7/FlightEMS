import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggler: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = ['military', 'dark', 'auto'] as const;

  const nextTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'military':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L4 7v3c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-8-5zM12 11L8 9v2l4 2 4-2V9l-4 2z" />
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
      case 'military':
        return 'Day'; // MilitaryテーマをDayテーマとして表示
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
