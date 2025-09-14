import React from 'react';

type CalloutType = 'info' | 'warning' | 'danger' | 'tip' | 'note' | 'important';

interface CalloutBoxProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  icon?: boolean;
}

/**
 * MDX内で使用できる強調表示用のボックスコンポーネント
 * - 情報(info)、警告(warning)、危険(danger)、ヒント(tip)、メモ(note)、重要(important)の6種類
 * - タイトルとアイコンをオプションで表示可能
 */
const CalloutBox: React.FC<CalloutBoxProps> = ({
  type = 'info',
  title,
  children,
  icon = true,
}) => {
  // 種類ごとの表示設定
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-900',
      title: title || '情報',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-500',
      text: 'text-amber-900',
      title: title || '注意',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-900',
      title: title || '危険',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    tip: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-900',
      title: title || 'ヒント',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    note: {
      bg: 'bg-purple-50',
      border: 'border-purple-500',
      text: 'text-purple-900',
      title: title || 'メモ',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    important: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-500',
      text: 'text-indigo-900',
      title: title || '重要',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} border-l-4 ${style.border} p-4 my-6 rounded-r-md`}>
      <div className={`flex items-center font-bold mb-2 ${style.text}`}>
        {icon && <span className="mr-2">{style.icon}</span>}
        {style.title}
      </div>
      <div className={style.text}>{children}</div>
    </div>
  );
};

export default CalloutBox; 