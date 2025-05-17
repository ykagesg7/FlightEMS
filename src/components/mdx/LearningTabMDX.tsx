import React, { useState, useEffect, useRef } from 'react';
import MDXLoader, { MDX_CONTENT_LOADED_EVENT } from './MDXLoader';
import { useTheme } from '../../contexts/ThemeContext';
import { useProgress } from '../../contexts/ProgressContext';

// MDXコンテンツの型定義
interface MDXContent {
  id: string;
  title: string;
  category: string;
  directHtml?: boolean;
  htmlUrl?: string;
}

// 利用可能なMDXコンテンツのリスト
const mdxContents: MDXContent[] = [
  { id: '0.1-AviationRegulations', title: '航空法規', category: '基本知識' },
  { id: '0.2_Mentality', title: '【悩みと考える】たったこれだけの違いで、人生って結構変わる話。', category: 'マインドセット' },
  { id: '0.2.2_Mentality2', title: '【モチベーション】夢を追いかける勇気と決意', category: 'マインドセット' },
  { id: '0.3.1_UnconsciousSuccess', title: '【７つの習慣】道真公と学ぶ「主体的である」', category: 'マインドセット' },
  { id: '0.3.2_EndWithFuture', title: '【７つの習慣】終わりを思い描くことから始める、熊本よかとこラジオ', category: 'マインドセット' },
  { id: '0.3.3_PrioritizingMostImportant', title: '【７つの習慣】緊急指令！最優先で「第３の習慣」をマスターせよ！', category: 'マインドセット' },
  { id: '0.4_ConcreteAbstract', title: '【具体と抽象】記憶のモヤモヤ、ワシがバッサリ斬ったるわ！', category: '思考法' },
  { id: '1.1-DefinitionOfInstrumentFlight', title: '計器飛行の定義', category: '計器飛行' },
  { id: '1.2-BasicPrinciples', title: '計器飛行の基本原理', category: '計器飛行' },
  { id: '1.3-MajorInstruments', title: '主要な計器', category: '計器飛行' },
  { id: '1.4-InstrumentScan', title: '計器スキャン', category: '計器飛行' },
  { id: '1.5-InstrumentFlightBasicOperations', title: '計器飛行の基本操作', category: '計器飛行' },
  { id: '4-InstrumentFlight', title: '計器飛行の応用的な操作 - 基礎知識', category: '計器飛行' },
  { id: '05_TacanApproach', title: 'TACANアプローチ', category: '計器飛行', directHtml: true, htmlUrl: '/content/05_TacanApproach.html' },
  // 追加: 新しい識別子を持つコンテンツ
  { id: '91801e15-cd20-4ba4-9ad3-6c755a6e08fa', title: '進捗管理機能のテスト', category: 'システム' }
  // { id: '1.6-InstrumentFlightProcedures', title: '計器飛行の手順', category: '計器飛行' },
  // { id: '1.7-InstrumentApproachProcedures', title: '計器進入の手順', category: '計器飛行' },
  // { id: '1.8-InstrumentFlightEmergencies', title: '計器飛行の緊急事態', category: '計器飛行' },
  // { id: '2-InstrumentTakeoff', title: '計器離陸', category: '計器飛行' },
  // { id: '3-BasicInstrumentFlightOperations', title: '基本的な計器飛行操作', category: '計器飛行' },
];

// カテゴリのリスト
const categories = Array.from(new Set(mdxContents.map(content => content.category)));

const LearningTabMDX: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
    getLastReadInfo 
  } = useProgress();

  // スクロール位置を保存する関数
  const saveScrollPosition = (contentId: string) => {
    if (!contentId) return;
    
    const scrollPosition = window.scrollY;
    updateProgress(contentId, scrollPosition);
    console.log(`保存した読書位置: ${scrollPosition}px (コンテンツID: ${contentId})`);
  };

  // スクロール位置を追跡し、進捗を更新する
  useEffect(() => {
    if (!selectedContent) return;

    const handleScroll = () => {
      // スクロール位置を取得（簡易的な実装）
      const scrollPosition = window.scrollY;
      // コンテンツの高さを取得
      const contentHeight = document.body.scrollHeight - window.innerHeight;
      // スクロール率（0〜100）
      const scrollPercentage = (scrollPosition / contentHeight) * 100;
      
      // 進捗を更新（スクロール位置を使用）
      updateProgress(selectedContent, scrollPosition);
      
      // 90%以上スクロールした場合、コンテンツを完了としてマーク
      if (scrollPercentage > 90) {
        markAsCompleted(selectedContent);
      }
      
      // 「トップに戻る」ボタン表示の制御
      if (scrollPosition > 300) {
        setShowBackToTopButton(true);
      } else {
        setShowBackToTopButton(false);
      }
    };

    // スクロールイベントリスナーを追加
    window.addEventListener('scroll', handleScroll);
    
    // クリーンアップ関数
    return () => {
      // 画面を離れるときに最後のスクロール位置を保存
      saveScrollPosition(selectedContent);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [selectedContent, updateProgress, markAsCompleted]);
  
  // 前回の位置に戻る機能
  useEffect(() => {
    if (!selectedContent) return;
    
    // MDXコンテンツのロード完了イベントのリスナー
    const handleContentLoaded = (event: CustomEvent<{ contentId: string }>) => {
      const { contentId } = event.detail;
      
      // イベントが現在選択中のコンテンツに対応するものであるか確認
      if (contentId === selectedContent) {
        // 前回の読書位置を取得
        const lastReadInfo = getLastReadInfo(selectedContent);
        
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
  }, [selectedContent, getLastReadInfo]);

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
  };

  // 続きを読むかどうかのプロンプトを表示し、選択した結果に応じて処理
  const handleResumeReading = (contentId: string, resumed: boolean) => {
    setShowResumePrompt(false);
    setSelectedContent(contentId);
    
    if (!resumed) {
      // 最初から読む場合はトップに戻る
      window.scrollTo(0, 0);
    }
    // 続きから読む場合は useEffect 内で自動的にスクロールされる
  };

  // コンテンツを選択した時の処理
  const selectContent = (contentId: string) => {
    // HTMLへの直接遷移が指定されている場合
    const content = mdxContents.find(c => c.id === contentId);
    if (content?.directHtml && content.htmlUrl) {
      showHtmlOpenDialog(content);
      return;
    }
    
    // 前回の読書位置があるか確認
    const lastReadInfo = getLastReadInfo(contentId);
    
    if (lastReadInfo && lastReadInfo.position > 0 && !isCompleted(contentId)) {
      // 続きから読むか確認するプロンプトを表示
      setPendingHtmlContent(content!);
      setShowResumePrompt(true);
    } else {
      // 通常のMDXコンテンツの場合、または前回の読書位置がない場合
      setSelectedContent(contentId);
      window.scrollTo(0, 0); // ページ上部にスクロール
    }
  };

  // トップに戻る
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 前へボタンの処理
  const goBack = () => {
    if (selectedContent) {
      // 現在の位置を保存してから移動
      saveScrollPosition(selectedContent);
      
      const currentIndex = mdxContents.findIndex(c => c.id === selectedContent);
      if (currentIndex > 0) {
        setSelectedContent(mdxContents[currentIndex - 1].id);
        window.scrollTo(0, 0);
      }
    }
  };

  // 次へボタンの処理
  const goForward = () => {
    if (selectedContent) {
      // 現在の位置を保存してから移動
      saveScrollPosition(selectedContent);
      
      const currentIndex = mdxContents.findIndex(c => c.id === selectedContent);
      if (currentIndex < mdxContents.length - 1) {
        setSelectedContent(mdxContents[currentIndex + 1].id);
        window.scrollTo(0, 0);
      }
    }
  };

  // 現在のコンテンツのインデックスを取得
  const getCurrentIndex = () => {
    return selectedContent ? mdxContents.findIndex(c => c.id === selectedContent) : -1;
  };

  // フィルタリングされたコンテンツリスト
  const filteredContents = mdxContents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? content.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // ダークモード用のスタイル
  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';
  const cardBgColor = theme === 'dark' ? 'bg-gray-700' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const headingColor = theme === 'dark' ? 'text-indigo-300' : 'text-indigo-900';
  const subHeadingColor = theme === 'dark' ? 'text-indigo-200' : 'text-indigo-800';
  const borderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const inputBgColor = theme === 'dark' ? 'bg-gray-700' : 'bg-white';
  const buttonBgColor = theme === 'dark' ? 'bg-indigo-700' : 'bg-indigo-800';
  const buttonHoverBgColor = theme === 'dark' ? 'hover:bg-indigo-600' : 'hover:bg-indigo-700';
  const navButtonBgColor = theme === 'dark' ? 'bg-indigo-600' : 'bg-white';
  const navButtonTextColor = theme === 'dark' ? 'text-white' : 'text-indigo-800';
  const navButtonHoverBgColor = theme === 'dark' ? 'hover:bg-indigo-500' : 'hover:bg-indigo-100';

  return (
    <div className={`${bgColor} rounded-lg shadow-lg overflow-hidden`}>
      {/* 続きから読むプロンプト */}
      {showResumePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBgColor} p-6 rounded-lg shadow-xl max-w-md w-full`}>
            <h3 className={`text-lg font-semibold ${textColor} mb-4`}>
              「{pendingHtmlContent?.title}」の続きから読みますか？
            </h3>
            <p className={`mb-4 ${textColor}`}>
              前回の読書位置が保存されています。続きから読みますか？
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => handleResumeReading(pendingHtmlContent!.id, false)}
                className={`px-4 py-2 border ${borderColor} rounded-md ${textColor} hover:bg-opacity-10 hover:bg-gray-500`}
              >
                最初から
              </button>
              <button 
                onClick={() => handleResumeReading(pendingHtmlContent!.id, true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                続きから
              </button>
            </div>
          </div>
        </div>
      )}
    
      {/* HTMLダイアログ */}
      {showHtmlDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBgColor} p-6 rounded-lg shadow-xl max-w-md w-full`}>
            <h3 className={`text-lg font-semibold ${textColor} mb-4`}>
              「{pendingHtmlContent?.title}」を開く
            </h3>
            <p className={`mb-4 ${textColor}`}>
              このコンテンツはHTMLページとして表示されます。
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={cancelDialog}
                className={`px-4 py-2 border ${borderColor} rounded-md ${textColor} hover:bg-opacity-10 hover:bg-gray-500`}
              >
                キャンセル
              </button>
              <button 
                onClick={openHtml}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                開く
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* コンテンツ読書中に一覧に戻るフローティングボタン */}
      {selectedContent && (
        <div className="fixed top-20 right-4 z-20">
          <button
            onClick={backToListWithSavePosition}
            className={`p-2 rounded-full shadow-md ${
              theme === 'dark' 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-white text-gray-800 hover:bg-gray-200'
            } flex items-center justify-center transition-all duration-200`}
            aria-label="一覧に戻る"
            title="一覧に戻る（位置を保存します）"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
        </div>
      )}
      
      {/* トップに戻るボタン */}
      {showBackToTopButton && (
        <div className="fixed bottom-20 right-4 z-20">
          <button
            onClick={scrollToTop}
            className={`p-2 rounded-full shadow-md ${
              theme === 'dark' 
                ? 'bg-indigo-700 text-white hover:bg-indigo-600' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            } flex items-center justify-center transition-all duration-200`}
            aria-label="トップに戻る"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {!selectedContent ? (
          <div className={`p-3 sm:p-4 md:p-6 ${cardBgColor}`}>
            <h1 className={`text-xl sm:text-2xl font-bold ${headingColor} border-b-2 border-indigo-800 pb-2 mb-4 sm:mb-6`}>
              学習コンテンツ一覧
            </h1>

            <div className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4">
              <div className="flex-1 mb-4 md:mb-0">
                <input
                  type="text"
                  placeholder="コンテンツを検索..."
                  className={`w-full p-2 border ${borderColor} rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${inputBgColor} ${textColor}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-shrink-0">
                <select
                  className={`p-2 border ${borderColor} rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${inputBgColor} ${textColor}`}
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                >
                  <option value="">すべてのカテゴリ</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredContents.length === 0 && !searchTerm && !selectedCategory ? (
              <div className={`text-center p-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                利用可能な学習コンテンツがありません。
              </div>
            ) : (
              (selectedCategory ? [selectedCategory] : categories).map(category => {
                const contentsInCategory = filteredContents.filter(content => content.category === category);
                if (contentsInCategory.length === 0) {
                  // 選択されたカテゴリ、または検索結果がそのカテゴリにない場合は何も表示しない
                  // ただし、全体で filteredContents.length === 0 の場合は後続のメッセージが表示される
                  return null; 
                }
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
                        
                        return (
                          <div 
                            key={content.id}
                            className={`${cardBgColor} p-4 rounded-lg border ${
                              hasReadBefore
                                ? theme === 'dark' ? 'border-indigo-500' : 'border-indigo-300'
                                : theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                            } hover:border-indigo-500 transition-all duration-200 hover:shadow-lg`}
                          >
                            <h3 className={`font-semibold text-lg ${subHeadingColor} mb-2`}>{content.title}</h3>
                            <div className="flex flex-col space-y-2">
                              <div className="flex justify-between items-center">
                                <span className={`text-xs ${theme === 'dark' ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'} px-2 py-1 rounded`}>
                                  {content.id.length > 30 ? `${content.id.substring(0, 8)}...` : content.id}
                                </span>
                                
                                {/* 進捗表示 */}
                                {progressPercentage > 0 && (
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    completed 
                                      ? 'bg-green-600 text-white' 
                                      : 'bg-blue-600 text-white'
                                  }`}>
                                    {completed ? '完了' : `${progressPercentage}%`}
                                  </span>
                                )}
                              </div>
                              
                              {/* 進捗バー */}
                              {progressPercentage > 0 && (
                                <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
                                  <div 
                                    className={`${completed ? 'bg-green-600' : 'bg-indigo-600'} h-1.5 rounded-full`} 
                                    style={{ width: `${progressPercentage}%` }}
                                  ></div>
                                </div>
                              )}
                              
                              {/* ボタン */}
                              <div className="flex justify-between mt-3">
                                {hasReadBefore && !completed ? (
                                  <button 
                                    onClick={() => selectContent(content.id)}
                                    className={`text-xs px-2 py-1 ${
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
                                    className={`text-xs px-2 py-1 ${
                                      completed
                                        ? theme === 'dark' ? 'bg-green-700 text-white hover:bg-green-600' : 'bg-green-500 text-white hover:bg-green-400'
                                        : theme === 'dark' ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-300 text-gray-800 hover:bg-gray-200'
                                    } rounded transition-colors duration-200`}
                                  >
                                    {completed ? '復習する' : '読む'}
                                  </button>
                                )}
                                
                                {hasReadBefore && (
                                  <div className="text-xs text-right">
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                      最終：{new Date(lastReadInfo!.date).toLocaleDateString('ja-JP')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}

            {filteredContents.length === 0 && (searchTerm || selectedCategory) && (
              <div className={`text-center p-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                検索条件または選択したカテゴリに一致するコンテンツがありません。
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={`${cardBgColor} p-1 sm:p-2 md:p-4`} ref={contentRef}>
              <MDXLoader filePath={selectedContent} showPath={false} />
            </div>
            <div className={`navigation sticky bottom-0 ${buttonBgColor} text-center p-2 sm:p-4 flex justify-between items-center mt-2 sm:mt-4 z-10`}>
              <div className="flex items-center">
                <button 
                  className={`nav-btn ${navButtonBgColor} ${navButtonTextColor} px-2 py-1 sm:px-4 sm:py-2 mx-1 rounded text-sm sm:text-base font-bold ${navButtonHoverBgColor} disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-105`} 
                  onClick={goBack}
                  disabled={getCurrentIndex() <= 0}
                >
                  前へ
                </button>
                <button 
                  className={`nav-btn ${navButtonBgColor} ${navButtonTextColor} px-2 py-1 sm:px-4 sm:py-2 mx-1 rounded text-sm sm:text-base font-bold ${navButtonHoverBgColor} disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-105`} 
                  onClick={goForward}
                  disabled={getCurrentIndex() >= mdxContents.length - 1}
                >
                  次へ
                </button>
              </div>
              <div className="text-white font-semibold text-sm sm:text-base md:text-lg max-w-[40%] truncate">
                {mdxContents.find(c => c.id === selectedContent)?.title || 'コンテンツの表示中'}
              </div>
              <div className="flex items-center space-x-2">
                {/* 完了ボタン */}
                <button 
                  className={`nav-btn ${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-500 text-white'} px-2 py-1 sm:px-4 sm:py-2 mx-1 rounded text-sm sm:text-base font-bold ${theme === 'dark' ? 'hover:bg-green-500' : 'hover:bg-green-400'} transition-transform duration-200 hover:scale-105`}
                  onClick={() => selectedContent && markAsCompleted(selectedContent)}
                >
                  完了
                </button>
                
                {/* 一覧に戻るボタン */}
                <button 
                  className={`nav-btn ${theme === 'dark' ? 'bg-amber-500 text-gray-900' : 'bg-amber-400 text-indigo-900'} px-2 py-1 sm:px-4 sm:py-2 mx-1 rounded text-sm sm:text-base font-bold ${theme === 'dark' ? 'hover:bg-amber-400' : 'hover:bg-amber-300'} transition-transform duration-200 hover:scale-105`}
                  onClick={backToListWithSavePosition}
                >
                  一覧
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LearningTabMDX; 