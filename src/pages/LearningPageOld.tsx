import { useEffect, useState } from 'react';
import FreemiumUpgradePrompt from '../components/learning/FreemiumUpgradePrompt';
import LearningMenuSidebar from '../components/learning/LearningMenuSidebar';
import LearningTabMDX from '../components/mdx/LearningTabMDX';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useFreemiumAccess } from '../hooks/useFreemiumAccess';
import { useLearningProgress } from '../hooks/useLearningProgress';

function LearningPageOld() {
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
            fixed left-0 h-full w-4/5 max-w-xs ${theme === 'dark'
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

export default LearningPageOld;
