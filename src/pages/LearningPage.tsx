import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useFreemiumAccess } from '../hooks/useFreemiumAccess';
import LearningMenuSidebar from '../components/learning/LearningMenuSidebar';
import LearningTabMDX from '../components/mdx/LearningTabMDX';
import FreemiumUpgradePrompt from '../components/learning/FreemiumUpgradePrompt';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

function LearningPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { 
    learningContents, 
    isLoading,
    loadLearningContents
  } = useLearningProgress();
  
  const { 
    displayContents, 
    canAccessContent, 
    freemiumInfo,
    isPreviewMode
  } = useFreemiumAccess();
  
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // コンポーネントがマウントされたときのみコンテンツをロード（依存配列を空にして一度だけ実行）
  useEffect(() => {
    loadLearningContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // タブを選択
  useEffect(() => {
    // コンテンツがロードされたら最初のコンテンツを選択
    if (!isLoading && displayContents.length > 0 && !selectedTab) {
      setSelectedTab(displayContents[0].id);
    }
  }, [isLoading, displayContents, selectedTab]);

  // メニュー項目をクリックしたときの処理
  const handleMenuItemClick = (contentId: string) => {
    setSelectedTab(contentId);
    setSidebarOpen(false);
  };

  // サイドバー外クリックで閉じる（モバイル時のみ）
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 relative">
      {/* フリーミアム案内バナー */}
      {isPreviewMode && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 text-center sticky top-0 z-20">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm">
              🎓 厳選された{freemiumInfo.previewLimit}記事を無料でお試しいただけます（{freemiumInfo.availableContents}/{freemiumInfo.totalContents}記事表示中）</p>
            <p className="text-sm">
              <Link to="/auth" className="underline font-semibold ml-2 hover:text-indigo-200">
                ログイン/登録
              </Link>
              で全{freemiumInfo.totalContents}記事と進捗管理をご利用ください。登録は無料です。
            </p>
          </div>
        </div>
      )}
      
      {/* サイドバートグル（モバイル用） */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-indigo-500 text-white p-2 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        onClick={() => setSidebarOpen(true)}
        aria-label="メニューを開く"
        style={{ top: isPreviewMode ? '76px' : '16px' }}
      >
        {/* ハンバーガーアイコン */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* サイドバー（PC:常時表示, モバイル:ドロワー） */}
      {/* オーバーレイ（モバイル時のみ） */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden animate-fadeIn"
          onClick={handleOverlayClick}
        ></div>
      )}
      <div
        className={`
          fixed top-0 left-0 h-full w-4/5 max-w-xs bg-white shadow-lg z-50 transform transition-transform duration-300 md:static md:translate-x-0 md:w-1/4 md:max-w-none md:shadow-md md:p-4
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          p-4
        `}
        style={{ 
          minHeight: '100vh',
          marginTop: isPreviewMode && window.innerWidth >= 768 ? '60px' : '0px'
        }}
        tabIndex={-1}
        aria-label="学習メニュー"
      >
        {/* 閉じるボタン（モバイル用） */}
        <div className="flex justify-between items-center mb-2 md:hidden">
          <span className="text-lg font-bold text-indigo-700">
            メニュー
            {isPreviewMode && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (無料版)
              </span>
            )}
          </span>
          <button
            className="text-gray-600 hover:text-indigo-500 p-2 rounded focus:outline-none"
            onClick={() => setSidebarOpen(false)}
            aria-label="メニューを閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="ml-2">学習コンテンツを読み込んでいます...</p>
          </div>
        ) : (
          <>
            {/* インタラクティブ学習へのリンク */}
            <div className="mb-6 p-4 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-white mb-2">🎯 インタラクティブ学習</h3>
              <p className="text-sky-100 text-sm mb-3">
                TACAN進入方式を実際に操作しながら学べるインタラクティブな授業です。
              </p>
              <Link 
                to="/interactive-learning" 
                className="inline-block px-4 py-2 bg-white text-sky-600 font-semibold rounded-md hover:bg-sky-50 transition-colors duration-200 shadow-sm"
              >
                インタラクティブ学習を開始 →
              </Link>
            </div>

            {displayContents.length > 0 ? (
              <LearningMenuSidebar 
                contents={displayContents}
                selectedId={selectedTab}
                onSelectItem={handleMenuItemClick}
                showFreemiumBadges={isPreviewMode}
              />
            ) : (
              <div className="text-center p-4">
                {isPreviewMode ? (
                  <div>
                    <p className="text-gray-600 mb-4">無料公開コンテンツが読み込まれていません。</p>
                    <p className="text-sm text-gray-500 mb-4">
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
                    <p className="text-gray-600 mb-4">学習コンテンツがありません。</p>
                    <p className="text-sm text-gray-500 mb-2">
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
                      <p className="text-sm text-gray-500">
                        ログインして管理者権限を持つアカウントでアクセスしてください。
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* コンテンツ表示エリア */}
      <div className="w-full md:w-3/4 p-4" style={{ 
        marginTop: isPreviewMode && window.innerWidth >= 768 ? '60px' : '0px'
      }}>
        {selectedTab ? (
          canAccessContent(selectedTab) ? (
            <LearningTabMDX contentId={selectedTab} />
          ) : (
            <FreemiumUpgradePrompt contentId={selectedTab} />
          )
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-gray-500 mb-4">左側のメニューから学習コンテンツを選択してください。</p>
              {isPreviewMode && (
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-indigo-900' : 'bg-indigo-50'
                } border-l-4 border-indigo-500`}>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-indigo-200' : 'text-indigo-700'
                  }`}>
                    💡 現在は無料版です。厳選された{freemiumInfo.previewLimit}記事をお試しいただけます。
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LearningPage; 