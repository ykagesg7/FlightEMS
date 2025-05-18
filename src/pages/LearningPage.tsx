import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLearningProgress } from '../hooks/useLearningProgress';
import LearningMenuSidebar from '../components/learning/LearningMenuSidebar';
import LearningTabMDX from '../components/mdx/LearningTabMDX';
import { Link } from 'react-router-dom';

function LearningPage() {
  const { user } = useAuth();
  const { 
    learningContents, 
    isLoading,
    loadLearningContents
  } = useLearningProgress();
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
    if (!isLoading && learningContents.length > 0 && !selectedTab) {
      setSelectedTab(learningContents[0].id);
    }
  }, [isLoading, learningContents, selectedTab]);

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
        style={{ minHeight: '100vh' }}
        tabIndex={-1}
        aria-label="学習メニュー"
      >
        {/* 閉じるボタン（モバイル用） */}
        <div className="flex justify-between items-center mb-2 md:hidden">
          <span className="text-lg font-bold text-indigo-700">メニュー</span>
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
            {learningContents.length > 0 ? (
              <LearningMenuSidebar 
                contents={learningContents}
                selectedId={selectedTab}
                onSelectItem={handleMenuItemClick}
              />
            ) : (
              <div className="text-center p-4">
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
          </>
        )}
      </div>

      {/* コンテンツ表示エリア */}
      <div className="w-full md:w-3/4 p-4">
        {selectedTab ? (
          <LearningTabMDX contentId={selectedTab} />
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">左側のメニューから学習コンテンツを選択してください。</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LearningPage; 