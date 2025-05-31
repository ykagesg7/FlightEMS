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
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // コンポーネントがマウントされたときのみコンテンツをロード（依存配列を空にして一度だけ実行）
  useEffect(() => {
    loadLearningContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // タブを選択
  useEffect(() => {
    // 初期状態では記事一覧を表示するため、selectedTabは設定しない
    // コンテンツがロードされても自動選択はしない
  }, [isLoading, displayContents, selectedTab]);

  // メニュー項目をクリックしたときの処理
  const handleMenuItemClick = (contentId: string) => {
    setSelectedTab(contentId);
    setSidebarOpen(false);
    setSidebarVisible(true);
  };

  // 記事一覧に戻る処理
  const handleBackToList = () => {
    setSelectedTab(null);
    setSidebarOpen(false);
    setSidebarVisible(false);
  };

  // サイドバーの表示/非表示を切り替える
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // サイドバー外クリックで閉じる（モバイル時のみ）
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  // 記事が選択されたときの処理
  const handleContentSelect = (contentId: string) => {
    setSelectedTab(contentId);
    setSidebarVisible(true);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 relative">     
      {/* サイドバー表示/非表示切り替えボタン（記事詳細表示時のみ） */}
      {selectedTab && (
        <button
          className={`fixed top-20 left-4 z-50 p-2 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 ${
            sidebarVisible 
              ? theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-700'
              : 'bg-indigo-500 text-white'
          }`}
          onClick={toggleSidebar}
          aria-label={sidebarVisible ? 'サイドバーを隠す' : 'サイドバーを表示'}
          style={{ top: isPreviewMode ? '100px' : '80px' }}
        >
          {sidebarVisible ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
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
      {sidebarOpen && selectedTab && sidebarVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden animate-fadeIn"
          onClick={handleOverlayClick}
        ></div>
      )}
      {selectedTab && sidebarVisible && (
        <div
          className={`
            md:sticky md:top-16
            fixed left-0 h-full w-4/5 max-w-xs ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-gray-50 border-gray-100'
            } rounded-xl shadow-md z-50 transform transition-transform duration-300
            md:static md:translate-x-0 md:w-1/4 md:max-w-none md:shadow-md md:p-4
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            p-4 border flex flex-col
          `}
          style={{
            minHeight: '100vh',
            top: isPreviewMode ? '76px' : '64px',
            marginTop: 0
          }}
          tabIndex={-1}
          aria-label="学習メニュー"
        >
          <LearningMenuSidebar 
            contents={displayContents}
            selectedId={selectedTab}
            onSelectItem={handleMenuItemClick}
            onClose={() => setSidebarOpen(false)}
            showFreemiumBadges={isPreviewMode}
            isLoading={isLoading}
            user={user}
            theme={theme}
            freemiumInfo={freemiumInfo}
            isPreviewMode={isPreviewMode}
            onBackToList={handleBackToList}
          />
        </div>
      )}

      {/* コンテンツ表示エリア */}
      <div className={`p-4 ${selectedTab && sidebarVisible ? 'w-full md:w-3/4' : 'w-full'}`}>
        {selectedTab ? (
          canAccessContent(selectedTab) ? (
            <LearningTabMDX contentId={selectedTab} onBackToList={handleBackToList} onContentSelect={handleContentSelect} />
          ) : (
            <FreemiumUpgradePrompt contentId={selectedTab} />
          )
        ) : (
          <LearningTabMDX contentId="" onContentSelect={handleContentSelect} />
        )}
      </div>
    </div>
  );
}

export default LearningPage; 