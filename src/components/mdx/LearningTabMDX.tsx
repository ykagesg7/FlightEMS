import React, { useState, useEffect, useRef, useMemo } from 'react';
import MDXLoader, { MDX_CONTENT_LOADED_EVENT } from './MDXLoader';
import { useTheme } from '../../contexts/ThemeContext';
import { useLearningProgress } from '../../hooks/useLearningProgress';
import { useFreemiumAccess } from '../../hooks/useFreemiumAccess';
import { useArticleStats } from '../../hooks/useArticleStats';
import LearningContentInteraction from '../learning/LearningContentInteraction';
import { useLearningContentStats } from '../../hooks/useLearningContentStats';

// MDXコンテンツの型定義
interface MDXContent {
  id: string;
  title: string;
  category: string;
  directHtml?: boolean;
  htmlUrl?: string;
}

interface LearningTabMDXProps {
  contentId: string;
  onBackToList?: () => void;
  onContentSelect?: (contentId: string) => void;
}

const LearningTabMDX: React.FC<LearningTabMDXProps> = ({ contentId, onBackToList, onContentSelect }) => {
  // contentIdが空文字の場合は必ずnullに設定
  const [selectedContent, setSelectedContent] = useState<string | null>(contentId && contentId.trim() !== '' ? contentId : null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showHtmlDialog, setShowHtmlDialog] = useState(false);
  const [pendingHtmlContent, setPendingHtmlContent] = useState<MDXContent | null>(null);
  const [showBackToTopButton, setShowBackToTopButton] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { theme } = useTheme();

  const { 
    updateProgress, 
    getProgress, 
    isCompleted, 
    markAsCompleted, 
    getLastReadInfo,
    loadLearningContents
  } = useLearningProgress();

  const { 
    displayContents, 
    canAccessContent, 
    isFreemiumContent,
    isLoading
  } = useFreemiumAccess();

  // 記事統計フック
  const { recordView } = useArticleStats();

  // いいね・コメント統計を取得 - contentIds配列をuseMemoで最適化
  const contentIds = useMemo(() => {
    return displayContents.map(content => content.id);
  }, [displayContents]);
  
  // 修正したuseLearningContentStatsを使用
  const { getStatsForContent } = useLearningContentStats(contentIds);
  
  // コンポーネントのマウント時にコンテンツをロード
  useEffect(() => {
    loadLearningContents();
  }, []);

  // contentId（props）が変わったらselectedContentも同期する
  useEffect(() => {
    // contentIdが空文字または空白の場合は必ずnullに設定
    setSelectedContent(contentId && contentId.trim() !== '' ? contentId : null);
    
    // 記事詳細ページに遷移した時に閲覧数を記録
    if (contentId && contentId.trim() !== '') {
      recordView({ article_id: contentId });
    }
  }, [contentId, recordView]);
  
  // コンテンツ一覧からMDXContent型に変換する
  const mdxContents: MDXContent[] = useMemo(() => {
    return displayContents.map(content => {
      // 特別なケース: TACANアプローチのようなHTMLコンテンツの処理
      if (content.id === '05_TacanApproach') {
        return {
          id: content.id,
          title: content.title,
          category: content.category,
          directHtml: true,
          htmlUrl: '/content/05_TacanApproach.html'
        };
      }
      
      return {
        id: content.id,
        title: content.title,
        category: content.category
      };
    });
  }, [displayContents]);

  // カテゴリのリスト（displayContentsから取得）
  const categories = useMemo(() => {
    return Array.from(new Set(displayContents.map(content => content.category))).sort();
  }, [displayContents]);

  // フィルタリングされたコンテンツ
  const filteredContents = useMemo(() => {
    return mdxContents.filter(content => {
      const matchesCategory = selectedCategory ? content.category === selectedCategory : true;
      return matchesCategory;
    });
  }, [mdxContents, selectedCategory]);

  // スクロール位置を保存する関数
  const saveScrollPosition = (contentId: string) => {
    if (!contentId) return;
    
    const scrollPosition = window.scrollY;
    updateProgress(contentId, scrollPosition);
    console.log(`保存した読書位置: ${scrollPosition}px (コンテンツID: ${contentId})`);
  };

  // スクロール位置を追跡し、進捗を更新する
  useEffect(() => {
    if (!contentId) return;

    // デバウンスのためのタイマー参照
    let debounceTimer: number | null = null;
    // 前回更新したスクロール位置
    let lastUpdatedPosition = 0;

    const handleScroll = () => {
      // スクロール位置を取得（簡易的な実装）
      const scrollPosition = window.scrollY;
      
      // 小さな変化では更新しない（パフォーマンス向上）
      if (Math.abs(scrollPosition - lastUpdatedPosition) < 50) return;

      // 前回のタイマーをクリア
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
      }

      // デバウンスして更新（300ms後に実行）
      debounceTimer = window.setTimeout(() => {
        // コンテンツの高さを取得
        const contentHeight = document.body.scrollHeight - window.innerHeight;
        // スクロール率（0〜100）
        const scrollPercentage = (scrollPosition / contentHeight) * 100;
        
        // 進捗を更新（スクロール位置を使用）
        updateProgress(contentId, scrollPosition);
        lastUpdatedPosition = scrollPosition;
        
        // 90%以上スクロールした場合、コンテンツを完了としてマーク
        if (scrollPercentage > 90) {
          markAsCompleted(contentId);
        }
        
        // 「トップに戻る」ボタン表示の制御
        if (scrollPosition > 300) {
          setShowBackToTopButton(true);
        } else {
          setShowBackToTopButton(false);
        }
      }, 300);
    };

    // スクロールイベントリスナーを追加
    window.addEventListener('scroll', handleScroll);
    
    // クリーンアップ関数
    return () => {
      // タイマーをクリア
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
      }
      
      // 画面を離れるときに最後のスクロール位置を保存
      saveScrollPosition(contentId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [contentId]);  // contentIdを依存配列に設定

  // 前回の位置に戻る機能
  useEffect(() => {
    if (!contentId) return;
    
    // MDXコンテンツのロード完了イベントのリスナー
    const handleContentLoaded = (event: CustomEvent<{ contentId: string }>) => {
      const { contentId: loadedContentId } = event.detail;
      
      // イベントが現在選択中のコンテンツに対応するものであるか確認
      if (loadedContentId === contentId) {
        // 前回の読書位置を取得
        const lastReadInfo = getLastReadInfo(contentId);
        
        if (lastReadInfo && lastReadInfo.position > 0) {
          // コンテンツが読み込まれたら、少し遅延させてスムーズにスクロール
          setTimeout(() => {
            window.scrollTo({
              top: lastReadInfo.position,
              behavior: 'smooth'
            });
            console.log(`前回の続きから再開: ${lastReadInfo.position}px (ロード完了後)`);
          }, 300);
        }
      }
    };
    
    // イベントリスナーを追加
    window.addEventListener(MDX_CONTENT_LOADED_EVENT, handleContentLoaded as EventListener);
    
    // クリーンアップ関数
    return () => {
      window.removeEventListener(MDX_CONTENT_LOADED_EVENT, handleContentLoaded as EventListener);
    };
  }, [contentId, getLastReadInfo]);

  // HTMLを開くダイアログを表示
  const showHtmlOpenDialog = (content: MDXContent) => {
    setPendingHtmlContent(content);
    setShowHtmlDialog(true);
  };

  // HTMLを開く
  const openHtml = () => {
    if (pendingHtmlContent?.htmlUrl) {
      window.location.href = pendingHtmlContent.htmlUrl;
    }
    setShowHtmlDialog(false);
    setPendingHtmlContent(null);
  };

  // ダイアログをキャンセル
  const cancelDialog = () => {
    setShowHtmlDialog(false);
    setPendingHtmlContent(null);
  };

  // 読書位置を保存して一覧に戻る
  const backToListWithSavePosition = () => {
    if (selectedContent) {
      saveScrollPosition(selectedContent);
      console.log(`読書位置を保存して一覧に戻ります`);
    }
    setSelectedContent(null);
    window.scrollTo(0, 0);
    if (onBackToList) {
      onBackToList();
    }
  };

  // 続きを読むかどうかのプロンプトを表示し、選択した結果に応じて処理
  const handleResumeReading = (contentId: string, resumed: boolean) => {
    setShowResumePrompt(false);
    setSelectedContent(contentId);
    
    if (resumed) {
      // 前回の位置へスクロール（遅延実行）
      setTimeout(() => {
        const lastReadInfo = getLastReadInfo(contentId);
        if (lastReadInfo && lastReadInfo.position > 0) {
          window.scrollTo({
            top: lastReadInfo.position,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      // 最初からの場合はトップへ
      window.scrollTo(0, 0);
    }
    
    if (onContentSelect) {
      onContentSelect(contentId);
    }
  };

  // コンテンツを選択する関数
  const selectContent = (contentId: string) => {
    // 現在のコンテンツの読書位置を保存
    if (selectedContent) {
      saveScrollPosition(selectedContent);
    }
    
    // コンテンツを探す
    const content = mdxContents.find(c => c.id === contentId);
    
    // HTMLコンテンツの場合は確認ダイアログを表示
    if (content && content.directHtml) {
      showHtmlOpenDialog(content);
      return;
    }
    
    // 前回の読書情報を取得
    const lastReadInfo = getLastReadInfo(contentId);
    
    // 前回の続きからか、最初からかを確認するプロンプトを表示
    if (lastReadInfo && lastReadInfo.position > 100) {
      setShowResumePrompt(true);
    } else {
      // 初めて読む場合や、進行していない場合は最初から表示
      setSelectedContent(contentId);
      window.scrollTo(0, 0);
    }

    if (onContentSelect) {
      onContentSelect(contentId);
    }
  };

  // トップにスクロールする関数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 前のコンテンツに移動
  const goBack = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
      const prevContent = mdxContents[currentIndex - 1];
      if (selectedContent) {
        saveScrollPosition(selectedContent);
      }
      setSelectedContent(prevContent.id);
      window.scrollTo(0, 0);
      
      if (onContentSelect) {
        onContentSelect(prevContent.id);
      }
    }
  };

  // 次のコンテンツに移動
  const goForward = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex < mdxContents.length - 1) {
      const nextContent = mdxContents[currentIndex + 1];
      if (selectedContent) {
        saveScrollPosition(selectedContent);
      }
      setSelectedContent(nextContent.id);
      window.scrollTo(0, 0);
      
      if (onContentSelect) {
        onContentSelect(nextContent.id);
      }
    }
  };

  // 現在のコンテンツのインデックスを取得
  const getCurrentIndex = () => {
    if (!selectedContent) return -1;
    return mdxContents.findIndex(content => content.id === selectedContent);
  };

  // ナビゲーションボタン部分を関数化
  const renderNavigation = () => (
    <div className="flex justify-between items-center my-4 sticky top-16 z-10 py-2 px-1 sm:px-2 md:px-4 bg-opacity-75 backdrop-blur-md rounded border-b border-gray-200 dark:border-gray-700"
      style={{
        background: theme === 'dark' 
          ? 'rgba(17, 24, 39, 0.75)' 
          : 'rgba(255, 255, 255, 0.75)'
      }}
    >
      <div className="flex items-center space-x-2">
        {/* 前のコンテンツボタン */}
        <button 
          className={`nav-btn ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'} px-2 py-1 sm:px-4 sm:py-2 mx-1 rounded text-sm sm:text-base font-bold ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-300'} transition-transform duration-200 hover:scale-105 ${getCurrentIndex() <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={goBack}
          disabled={getCurrentIndex() <= 0}
        >
          ←
        </button>
        {/* 次のコンテンツボタン */}
        <button 
          className={`nav-btn ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'} px-2 py-1 sm:px-4 sm:py-2 mx-1 rounded text-sm sm:text-base font-bold ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-300'} transition-transform duration-200 hover:scale-105 ${getCurrentIndex() >= mdxContents.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={goForward}
          disabled={getCurrentIndex() >= mdxContents.length - 1}
        >
          →
        </button>
      </div>
      <div className="flex items-center space-x-2">
        {/* 一覧に戻るボタン */}
        <button 
          className={`nav-btn ${theme === 'dark' ? 'bg-amber-500 text-gray-900' : 'bg-amber-400 text-indigo-900'} px-2 py-1 sm:px-4 sm:py-2 mx-1 rounded text-sm sm:text-base font-bold ${theme === 'dark' ? 'hover:bg-amber-400' : 'hover:bg-amber-300'} transition-transform duration-200 hover:scale-105`}
          onClick={backToListWithSavePosition}
        >
          一覧
        </button>
      </div>
    </div>
  );

  // ロード中の表示
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      }`}>
        <div className="w-8 h-8 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin mr-3"></div>
        <p>コンテンツを読み込んでいます...</p>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* MDXコンテンツ表示エリア */}
      <div ref={contentRef} className="mb-8">
        {selectedContent ? (
          <>
            {/* 上部ナビゲーションボタン */}
            {renderNavigation()}
            {/* MDXローダーコンポーネント */}
            <MDXLoader contentId={selectedContent} />
            {/* いいね・コメント機能 */}
            <LearningContentInteraction contentId={selectedContent} />
            {/* トップに戻るボタン */}
            {showBackToTopButton && (
              <button
                onClick={scrollToTop}
                className={`fixed bottom-4 right-4 p-2 rounded-full shadow-lg z-50 transform transition hover:scale-110 ${
                  theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            )}
          </>
        ) : (
          <div>
            {/* 新着記事お知らせ */}
            <div className="mb-6">
              <div className={`p-4 rounded-lg border-l-4 ${
                theme === 'dark' 
                  ? 'bg-blue-900/30 border-blue-400 text-blue-200' 
                  : 'bg-blue-50 border-blue-400 text-blue-800'
              }`}>
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-semibold">最新記事のお知らせ</h3>
                </div>
                <p className="text-sm mb-3">
                  新しい記事が追加されました！ロジカル思考術シリーズで、プレゼンテーション能力を向上させましょう。
                </p>
                <div className="space-y-2">
                  {displayContents
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 3)
                    .map(content => (
                      <div 
                        key={content.id}
                        className={`text-sm px-3 py-2 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                          theme === 'dark' 
                            ? 'bg-blue-800/50 text-blue-100 hover:bg-blue-700/50' 
                            : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                        }`}
                        onClick={() => {
                          const contentElement = document.getElementById(`content-${content.id}`);
                          if (contentElement) {
                            contentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium">📝 {content.title}</span>
                        </div>
                        <div className="flex justify-between text-xs opacity-75">
                          <span className="bg-opacity-50 bg-gray-500 text-white px-2 py-0.5 rounded">
                            {content.category}
                          </span>
                          <span>{new Date(content.created_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
              <div className="mt-4">
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-800'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">すべてのカテゴリ</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* コンテンツ一覧 */}
            {filteredContents.length > 0 ? (
              <div>
                {/* カテゴリごとのコンテンツ一覧 */}
                {(selectedCategory ? [selectedCategory] : categories).map(category => {
                  const contentsInCategory = filteredContents.filter(content => content.category === category);
                  
                  // カテゴリ内にコンテンツがない場合はスキップ
                  if (contentsInCategory.length === 0) {
                    return null;
                  }
                  
                  // 見出しの色
                  const subHeadingColor = theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600';
                  // カードの背景色
                  const cardBgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
                  
                  return (
                    <div key={category} className="mb-8">
                      <h2 className={`text-xl font-semibold ${subHeadingColor} border-b ${theme === 'dark' ? 'border-indigo-700' : 'border-indigo-200'} pb-2 mb-4`}>
                        {category}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contentsInCategory.map(content => {
                          // 進捗率の取得
                          const progressPercentage = getProgress(content.id);
                          const completed = isCompleted(content.id);
                          const lastReadInfo = getLastReadInfo(content.id);
                          const hasReadBefore = lastReadInfo !== null;
                          const hasAccess = canAccessContent(content.id);
                          
                          // いいね・コメント統計を取得
                          const stats = getStatsForContent(content.id);
                          
                          // フリーミアム記事かどうかを判定
                          const isFreemium = isFreemiumContent(content.id);
                          
                          return (
                            <div 
                              key={content.id}
                              id={`content-${content.id}`}
                              className={`${cardBgColor} p-4 rounded-lg border ${
                                hasReadBefore
                                  ? theme === 'dark' ? 'border-indigo-500' : 'border-indigo-300'
                                  : theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                              } hover:border-indigo-500 transition-all duration-200 hover:shadow-lg ${
                                !hasAccess ? 'opacity-60' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className={`font-semibold text-lg ${subHeadingColor} flex-1 ${
                                  !hasAccess ? 'line-through' : ''
                                }`}>{content.title}</h3>
                                
                                <div className="flex items-center space-x-1 ml-2">
                                  {/* フリーミアムバッジ */}
                                  {isFreemium && (
                                    <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                                      Free
                                    </span>
                                  )}
                                  {/* 鍵マーク（アクセス不可の場合） */}
                                  {!hasAccess && !isFreemium && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                                      theme === 'dark'
                                        ? 'border border-gray-600 bg-gray-700 text-gray-400'
                                        : 'border border-gray-300 bg-gray-100 text-gray-400'
                                    }`}>🔒</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col space-y-2">
                                <div className="flex justify-end items-center">
                                  {/* 進捗表示（アクセス可能な場合のみ） */}
                                  {hasAccess && progressPercentage > 0 && (
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      completed 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-blue-600 text-white'
                                    }`}>
                                      {completed ? '完了' : `${progressPercentage}%`}
                                    </span>
                                  )}
                                </div>
                                
                                {/* 進捗バー（アクセス可能な場合のみ） */}
                                {hasAccess && progressPercentage > 0 && (
                                  <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
                                    <div 
                                      className={`${completed ? 'bg-green-600' : 'bg-indigo-600'} h-1.5 rounded-full`} 
                                      style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                  </div>
                                )}
                                
                                {/* ボタン */}
                                <div className="flex justify-between items-center mt-3">
                                  {hasAccess ? (
                                    hasReadBefore && !completed ? (
                                      <button 
                                        onClick={() => selectContent(content.id)}
                                        className={`text-xs px-3 py-2 ${
                                          theme === 'dark' 
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                                            : 'bg-indigo-500 text-white hover:bg-indigo-400'
                                        } rounded transition-colors duration-200 flex items-center space-x-1`}
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>続きから</span>
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => selectContent(content.id)}
                                        className={`text-xs px-3 py-2 ${
                                          completed
                                            ? theme === 'dark'
                                              ? 'bg-green-700 text-white hover:bg-green-600'
                                              : 'bg-green-600 text-white hover:bg-green-500'
                                            : theme === 'dark'
                                              ? 'bg-blue-700 text-white hover:bg-blue-600'
                                              : 'bg-blue-600 text-white hover:bg-blue-500'
                                        } rounded transition-colors duration-200`}
                                      >
                                        {completed ? '復習する' : '読む'}
                                      </button>
                                    )
                                  ) : (
                                    <span className={`text-xs px-3 py-2 rounded cursor-not-allowed ${
                                      theme === 'dark'
                                        ? 'bg-gray-700 text-gray-400'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}>
                                      ログインが必要
                                    </span>
                                  )}
                                  
                                  {/* 最終閲覧日時 */}
                                  {hasReadBefore && hasAccess && (
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {new Date(lastReadInfo.date).toLocaleDateString('ja-JP')}
                                    </span>
                                  )}
                                </div>
                                
                                {/* いいね・コメント数（アクセス可能な場合のみ） */}
                                {hasAccess && (
                                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center gap-1">
                                      <span className="text-red-500">❤️</span>
                                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {stats.likesCount}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-blue-500">💬</span>
                                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {stats.commentsCount}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`p-8 text-center border rounded-lg ${
                theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
              }`}>
                <p>検索条件に一致するコンテンツが見つかりませんでした。</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 読書再開確認ダイアログ */}
      {showResumePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl max-w-md w-full ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <h3 className="text-xl font-bold mb-4">読書を再開しますか？</h3>
            <p className="mb-6">前回の続きから読みますか？それとも最初から読み直しますか？</p>
            <div className="flex justify-end space-x-4">
              <button 
                className={`px-4 py-2 rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
                onClick={() => handleResumeReading(selectedContent || '', false)}
              >
                最初から
              </button>
              <button 
                className={`px-4 py-2 rounded ${
                  theme === 'dark' 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                    : 'bg-indigo-500 hover:bg-indigo-400 text-white'
                }`}
                onClick={() => handleResumeReading(selectedContent || '', true)}
              >
                続きから
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* HTMLコンテンツオープン確認ダイアログ */}
      {showHtmlDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl max-w-md w-full ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <h3 className="text-xl font-bold mb-4">HTMLコンテンツを開きますか？</h3>
            <p className="mb-6">このコンテンツは別ページのHTMLで表示されます。開きますか？</p>
            <div className="flex justify-end space-x-4">
              <button 
                className={`px-4 py-2 rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
                onClick={cancelDialog}
              >
                キャンセル
              </button>
              <button 
                className={`px-4 py-2 rounded ${
                  theme === 'dark' 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                    : 'bg-indigo-500 hover:bg-indigo-400 text-white'
                }`}
                onClick={openHtml}
              >
                開く
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningTabMDX; 