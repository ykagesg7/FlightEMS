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
          md:sticky md:top-16
          fixed left-0 h-full w-4/5 max-w-xs ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gray-50 border-gray-100'
          } rounded-xl shadow-md z-50 transform transition-transform duration-300
          md:static md:translate-x-0 md:w-1/4 md:max-w-none md:shadow-md md:p-4
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          p-4 border
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
        />
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