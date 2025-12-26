import React, { useState } from 'react';
import { useTableOfContents } from '../../hooks/useTableOfContents';

interface TableOfContentsProps {
  /** 表示モード */
  mode?: 'sidebar' | 'drawer' | 'inline';
  /** 最大表示レベル */
  maxLevel?: number;
  /** コンパクト表示 */
  compact?: boolean;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  mode = 'sidebar',
  maxLevel = 3,
  compact = false
}) => {
  const { tocItems, activeId, scrollToHeading } = useTableOfContents();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 指定レベル以下の見出しのみフィルタ
  const filteredItems = tocItems.filter(item => item.level <= maxLevel);

  if (filteredItems.length === 0) {
    return null;
  }

  const renderTocItem = (item: typeof filteredItems[0], index: number) => {
    const isActive = activeId === item.id;
    const indentLevel = Math.max(0, item.level - 1); // h1を基準(0)とする

    return (
      <li key={`${item.id}-${index}`} className={`toc-item level-${item.level}`}>
        <button
          onClick={() => scrollToHeading(item.id)}
          className={`block w-full text-left py-1 px-2 rounded text-sm transition-all duration-200 ${isActive
              ? 'font-semibold text-whiskyPapa-yellow bg-indigo-900 bg-opacity-30'
              : 'text-white opacity-80 hover:opacity-100 hover:text-whiskyPapa-yellow'
            } ${compact ? 'py-0.5 text-xs' : ''}`}
          style={{
            marginLeft: `${indentLevel * (compact ? 8 : 12)}px`,
            borderLeft: isActive ? '2px solid #FFD700' : '2px solid transparent'
          }}
          title={item.text}
        >
          <span className={`block ${compact ? '' : 'leading-5'} ${item.text.length > 50 ? 'truncate' : ''}`}>
            {item.text}
          </span>
        </button>
      </li>
    );
  };

  const tocContent = (
    <nav className="toc-nav">
      <div className={`flex items-center gap-2 mb-3 ${compact ? 'mb-2' : ''}`}>
        <svg className="w-4 h-4 text-whiskyPapa-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <h3 className={`font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>
          目次
        </h3>
        <span className={`text-xs text-white opacity-60 ${compact ? 'hidden' : ''}`}>
          ({filteredItems.length})
        </span>
      </div>
      <ul className="space-y-1 max-h-96 overflow-y-auto">
        {filteredItems.map(renderTocItem)}
      </ul>
    </nav>
  );

  // サイドバーモード
  if (mode === 'sidebar') {
    return (
      <div className={`toc-sidebar sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden ${compact ? 'w-48' : 'w-64'}`}>
        <div className="p-4 rounded-lg border border-whiskyPapa-yellow/20 bg-whiskyPapa-black-dark transition-colors duration-200">
          {tocContent}
        </div>
      </div>
    );
  }

  // ドロワーモード
  if (mode === 'drawer') {
    return (
      <>
        {/* ドロワー開閉ボタン */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="fixed top-20 right-4 z-50 p-2 rounded-full shadow-lg bg-whiskyPapa-black-dark text-white hover:bg-whiskyPapa-yellow/10 transition-all duration-200"
          title="目次を開く"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>

        {/* ドロワーオーバーレイ */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        {/* ドロワーコンテンツ */}
        <div className={`fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          } bg-whiskyPapa-black-dark border-l border-whiskyPapa-yellow/20 shadow-xl`}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">目次</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded hover:bg-whiskyPapa-black-light transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {tocContent}
          </div>
        </div>
      </>
    );
  }

  // インラインモード
  return (
    <div className="toc-inline mb-8 p-4 rounded-lg border border-whiskyPapa-yellow/20 bg-whiskyPapa-black-dark">
      {tocContent}
    </div>
  );
};

export default TableOfContents;
