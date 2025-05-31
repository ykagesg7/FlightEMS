import React from 'react';
import { Link } from 'react-router-dom';
import { useLearningProgress } from '../../hooks/useLearningProgress';
import { useFreemiumAccess } from '../../hooks/useFreemiumAccess';

interface LearningContent {
  id: string;
  title: string;
  category: string;
  description: string | null;
  order_index: number;
}

interface LearningMenuSidebarProps {
  contents: LearningContent[];
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  onClose?: () => void;
  showFreemiumBadges?: boolean;
  isLoading?: boolean;
  user?: any;
  theme?: any;
  freemiumInfo?: any;
  isPreviewMode?: boolean;
  onBackToList?: () => void;
}

const LearningMenuSidebar: React.FC<LearningMenuSidebarProps> = ({
  contents,
  selectedId,
  onSelectItem,
  onClose,
  showFreemiumBadges = false,
  isLoading = false,
  user,
  theme,
  freemiumInfo,
  isPreviewMode = false,
  onBackToList
}) => {
  const { getProgress, isCompleted } = useLearningProgress();
  const { canAccessContent, isFreemiumContent } = useFreemiumAccess();
  
  // カテゴリーでグループ化
  const groupedContents: Record<string, LearningContent[]> = {};
  contents.forEach(content => {
    if (!groupedContents[content.category]) {
      groupedContents[content.category] = [];
    }
    groupedContents[content.category].push(content);
  });
  
  // カテゴリーの順序を保持
  const categories = Object.keys(groupedContents).sort();
  
  return (
    <>
      {/* メニュータイトル + Freeバッジ */}
      <div className="flex items-center mb-6">
        <span className={`text-lg font-semibold tracking-tight ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
        }`}>メニュー</span>
        <span className="ml-2 bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm">Free</span>
      </div>

      {/* 閉じるボタン（モバイル用） */}
      {onClose && (
        <button
          className={`p-2 rounded focus:outline-none md:hidden mb-4 ${
            theme === 'dark' 
              ? 'text-gray-300 hover:text-indigo-400' 
              : 'text-gray-600 hover:text-indigo-500'
          }`}
          onClick={onClose}
          aria-label="メニューを閉じる"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <p className={`ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>学習コンテンツを読み込んでいます...</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* インタラクティブ学習へのリンク */}
          <div className="mb-6 p-4 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-lg shadow-md flex-shrink-0">
            <h3 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}>インタラクティブ学習</h3>
            <Link 
              to="/interactive-learning" 
              className="inline-block px-4 py-2 bg-white text-sky-600 font-semibold rounded-md hover:bg-sky-50 transition-colors duration-200 shadow-sm"
            >
              インタラクティブ学習を開始 →
            </Link>
          </div>

          {contents.length > 0 ? (
            <div className="flex-1 min-h-0">
              <h2 className={`text-xl font-semibold mb-4 flex-shrink-0 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}>学習コンテンツ</h2>
              
              {/* スクロール可能なコンテンツエリア */}
              <div className="overflow-y-auto flex-1 pr-2 space-y-4" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                {categories.map(category => (
                  <div key={category} className="mb-4">
                    <h3 className={`text-md font-medium mb-2 border-b pb-1 sticky top-0 z-10 ${
                      theme === 'dark' 
                        ? 'text-gray-200 border-gray-600 bg-gray-800' 
                        : 'text-gray-700 border-gray-200 bg-gray-50'
                    }`}>{category}</h3>
                    <ul className="space-y-1">
                      {groupedContents[category]
                        .sort((a, b) => a.order_index - b.order_index)
                        .map(content => {
                          const progress = getProgress(content.id);
                          const completed = isCompleted(content.id);
                          const hasAccess = canAccessContent(content.id);
                          
                          return (
                            <li
                              key={content.id}
                              className={`
                                py-2 px-3 rounded-lg cursor-pointer text-sm relative transition
                                ${selectedId === content.id
                                  ? theme === 'dark'
                                    ? 'bg-indigo-900 border border-indigo-700 text-indigo-200'
                                    : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                                  : hasAccess
                                    ? theme === 'dark'
                                      ? 'hover:bg-gray-700 bg-gray-750 text-gray-200'
                                      : 'hover:bg-gray-100 bg-white text-gray-800'
                                    : theme === 'dark'
                                      ? 'bg-gray-750 text-gray-500 cursor-not-allowed'
                                      : 'bg-white text-gray-300 cursor-not-allowed'}
                              `}
                              onClick={() => onSelectItem(content.id)}
                            >
                              <div className="flex justify-between items-center">
                                <span className={!hasAccess && showFreemiumBadges ? 'line-through' : ''}>
                                  {content.title}
                                </span>
                                
                                <div className="flex items-center space-x-1">
                                  {/* フリーミアムバッジ */}
                                  {showFreemiumBadges && isFreemiumContent(content.id) && (
                                    <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm">Free</span>
                                  )}
                                  {showFreemiumBadges && !hasAccess && !isFreemiumContent(content.id) && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm ${
                                      theme === 'dark'
                                        ? 'border border-gray-600 bg-gray-700 text-gray-400'
                                        : 'border border-gray-100 bg-gray-100 text-gray-400'
                                    }`}>🔒</span>
                                  )}
                                  
                                  {/* 進捗表示（アクセス可能な場合のみ） */}
                                  {hasAccess && progress > 0 && (
                                    <span className={`
                                      text-xs px-1.5 py-0.5 rounded-full ml-2 
                                      ${completed 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-blue-600 text-white'}
                                    `}>
                                      {completed ? '完了' : `${progress}%`}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* 進捗バー（アクセス可能でログイン時のみ） */}
                              {hasAccess && progress > 0 && (
                                <div className={`w-full rounded-full h-1 mt-2 ${
                                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                                }`}>
                                  <div 
                                    className={`${completed ? 'bg-green-500' : 'bg-blue-500'} h-1 rounded-full`}
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              )}
                            </li>
                          );
                        })
                      }
                    </ul>
                  </div>
                ))}
                
                {categories.length === 0 && (
                  <p className={`text-center p-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>カテゴリーがありません</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              {isPreviewMode ? (
                <div>
                  <p className={`mb-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>無料公開コンテンツが読み込まれていません。</p>
                  <p className={`text-sm mb-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    管理者がコンテンツを公開するか、ログインして全コンテンツにアクセスしてください。
                  </p>
                  <Link 
                    to="/auth" 
                    className="inline-block px-4 py-2 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 transition-colors"
                  >
                    ログイン/登録
                  </Link>
                </div>
              ) : (
                <div>
                  <p className={`mb-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>学習コンテンツがありません。</p>
                  <p className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    MDXファイルを管理者ページからSupabaseに同期する必要があります。
                  </p>
                  {user && user.email ? (
                    <Link 
                      to="/admin" 
                      className="inline-block px-4 py-2 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 transition-colors"
                    >
                      管理者ページへ
                    </Link>
                  ) : (
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      ログインして管理者権限を持つアカウントでアクセスしてください。
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default LearningMenuSidebar; 