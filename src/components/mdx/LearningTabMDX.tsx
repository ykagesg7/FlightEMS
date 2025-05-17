import React, { useState } from 'react';
import MDXLoader from './MDXLoader';

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

  // コンテンツを選択した時の処理
  const selectContent = (contentId: string) => {
    // HTMLへの直接遷移が指定されている場合
    const content = mdxContents.find(c => c.id === contentId);
    if (content?.directHtml && content.htmlUrl) {
      showHtmlOpenDialog(content);
      return;
    }
    
    // 通常のMDXコンテンツの場合
    setSelectedContent(contentId);
    window.scrollTo(0, 0); // ページ上部にスクロール
  };

  // 前へボタンの処理
  const goBack = () => {
    if (selectedContent) {
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

  return (
    <div className="bg-gray-50 rounded-lg shadow-lg overflow-hidden">
      {showHtmlDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              「{pendingHtmlContent?.title}」を開く
            </h3>
            <p className="mb-4 text-gray-700">
              このコンテンツはHTMLページとして表示されます。
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={cancelDialog}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
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
      <div className="max-w-7xl mx-auto">
        {!selectedContent ? (
          <div className="p-8 bg-white">
            <h1 className="text-2xl font-bold text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">
              学習コンテンツ一覧
            </h1>

            <div className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4">
              <div className="flex-1 mb-4 md:mb-0">
                <input
                  type="text"
                  placeholder="コンテンツを検索..."
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-shrink-0">
                <select
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-gray-800"
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
              <div className="text-center p-8 text-gray-500">
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
                    <h2 className="text-xl font-semibold text-indigo-800 border-b border-indigo-200 pb-2 mb-4">
                      {category}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {contentsInCategory.map(content => (
                        <div 
                          key={content.id}
                          className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-500 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                          onClick={() => selectContent(content.id)}
                        >
                          <h3 className="font-semibold text-lg text-indigo-800 mb-2">{content.title}</h3>
                          <div className="flex justify-between items-center">
                            {/* カテゴリ名はヘッダーで表示しているのでここでは不要かも */}
                            {/* <span className="text-sm text-gray-600">{content.category}</span> */}
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                              {content.id}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            {filteredContents.length === 0 && (searchTerm || selectedCategory) && (
              <div className="text-center p-8 text-gray-500">
                検索条件または選択したカテゴリに一致するコンテンツがありません。
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white p-8">
              <MDXLoader filePath={selectedContent} showPath={false} />
            </div>
            <div className="navigation bg-indigo-800 text-center p-4 flex justify-between items-center mt-4">
              <div className="flex items-center">
                <button 
                  className="nav-btn bg-white text-indigo-800 px-4 py-2 mx-1 rounded font-bold hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-105" 
                  onClick={goBack}
                  disabled={getCurrentIndex() <= 0}
                >
                  前へ
                </button>
                <button 
                  className="nav-btn bg-white text-indigo-800 px-4 py-2 mx-1 rounded font-bold hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-105" 
                  onClick={goForward}
                  disabled={getCurrentIndex() >= mdxContents.length - 1}
                >
                  次へ
                </button>
              </div>
              <div className="text-white font-semibold text-lg">
                {mdxContents.find(c => c.id === selectedContent)?.title || 'コンテンツの表示中'}
              </div>
              <div>
                <button 
                  className="nav-btn bg-amber-400 text-indigo-900 px-4 py-2 mx-1 rounded font-bold hover:bg-amber-300 transition-transform duration-200 hover:scale-105"
                  onClick={() => setSelectedContent(null)}
                >
                  コンテンツ一覧
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