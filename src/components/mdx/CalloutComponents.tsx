import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

type CalloutType = 'info' | 'warning' | 'error' | 'success' | 'tip' | 'note';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

interface FootnoteProps {
  id: string;
  children: React.ReactNode;
}

interface FootnoteRefProps {
  id: string;
  children?: React.ReactNode;
}

/**
 * Calloutコンポーネント
 * 重要な情報を目立たせるためのボックス
 */
export const Callout: React.FC<CalloutProps> = ({
  type = 'info',
  title,
  children,
  className = ''
}) => {
  const { theme } = useTheme();

  const getCalloutStyles = () => {
    const baseStyles = 'border-l-4 p-4 my-6 rounded-r-lg';

    switch (type) {
      case 'warning':
        return `${baseStyles} ${theme === 'dark'
            ? 'bg-yellow-900 bg-opacity-20 border-yellow-400 text-yellow-100'
            : 'bg-yellow-50 border-yellow-400 text-yellow-800'
          }`;
      case 'error':
        return `${baseStyles} ${theme === 'dark'
            ? 'bg-red-900 bg-opacity-20 border-red-400 text-red-100'
            : 'bg-red-50 border-red-400 text-red-800'
          }`;
      case 'success':
        return `${baseStyles} ${theme === 'dark'
            ? 'bg-green-900 bg-opacity-20 border-green-400 text-green-100'
            : 'bg-green-50 border-green-400 text-green-800'
          }`;
      case 'tip':
        return `${baseStyles} ${theme === 'dark'
            ? 'bg-purple-900 bg-opacity-20 border-purple-400 text-purple-100'
            : 'bg-purple-50 border-purple-400 text-purple-800'
          }`;
      case 'note':
        return `${baseStyles} ${theme === 'dark'
            ? 'bg-gray-800 bg-opacity-50 border-gray-400 text-gray-100'
            : 'bg-gray-50 border-gray-400 text-gray-700'
          }`;
      default: // info
        return `${baseStyles} ${theme === 'dark'
            ? 'bg-blue-900 bg-opacity-20 border-blue-400 text-blue-100'
            : 'bg-blue-50 border-blue-400 text-blue-800'
          }`;
    }
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5 flex-shrink-0 mr-2";

    switch (type) {
      case 'warning':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'error':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'tip':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'note':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default: // info
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'warning': return '注意';
      case 'error': return 'エラー';
      case 'success': return '成功';
      case 'tip': return 'ヒント';
      case 'note': return '注記';
      default: return '情報';
    }
  };

  return (
    <div className={`${getCalloutStyles()} ${className}`} role="alert">
      <div className="flex items-start">
        {getIcon()}
        <div className="flex-1">
          {title && (
            <div className="font-semibold mb-2 flex items-center">
              {title}
            </div>
          )}
          {!title && (
            <div className="font-semibold mb-2 flex items-center">
              {getTypeLabel()}
            </div>
          )}
          <div className="prose prose-sm max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 脚注コンポーネント
 */
export const Footnote: React.FC<FootnoteProps> = ({ id, children }) => {
  const { theme } = useTheme();

  return (
    <div
      id={`footnote-${id}`}
      className={`
        text-sm p-3 my-4 rounded border-l-2
        ${theme === 'dark'
          ? 'bg-gray-800 border-gray-600 text-gray-300'
          : 'bg-gray-50 border-gray-300 text-gray-700'
        }
      `}
    >
      <div className="flex items-start">
        <span className="font-mono text-xs bg-[color:var(--hud-primary)] text-white px-1.5 py-0.5 rounded mr-2 flex-shrink-0">
          {id}
        </span>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * 脚注参照コンポーネント
 */
export const FootnoteRef: React.FC<FootnoteRefProps> = ({ id, children }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const footnote = document.getElementById(`footnote-${id}`);
    if (footnote) {
      footnote.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      // 一時的にハイライト
      footnote.style.backgroundColor = 'var(--hud-primary)';
      footnote.style.color = 'white';
      setTimeout(() => {
        footnote.style.backgroundColor = '';
        footnote.style.color = '';
      }, 1000);
    }
  };

  return (
    <sup>
      <a
        href={`#footnote-${id}`}
        onClick={handleClick}
        className="inline-block px-1 py-0.5 text-xs font-mono bg-[color:var(--hud-primary)] text-white rounded hover:opacity-80 transition-opacity duration-200 no-underline"
        title={`脚注 ${id} を見る`}
      >
        {children || id}
      </a>
    </sup>
  );
};
