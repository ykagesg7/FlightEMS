import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useFreemiumAccess } from '../../hooks/useFreemiumAccess';

interface FreemiumUpgradePromptProps {
  contentId: string;
}

const FreemiumUpgradePrompt: React.FC<FreemiumUpgradePromptProps> = ({ contentId }) => {
  const { theme } = useTheme();
  const { freemiumInfo } = useFreemiumAccess();
  
  return (
    <div className={`${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-white border-gray-200'
    } rounded-lg p-8 text-center shadow-lg border`}>
      {/* ロックアイコン */}
      <div className="mb-6">
        <div className={`mx-auto h-16 w-16 rounded-full ${
          theme === 'dark' ? 'bg-indigo-900' : 'bg-indigo-100'
        } flex items-center justify-center`}>
          <svg 
            className="h-8 w-8 text-indigo-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        </div>
      </div>
      
      {/* メインメッセージ */}
      <h3 className={`text-2xl font-bold mb-4 ${
        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
      }`}>
        このコンテンツはプレミアム限定です
      </h3>
      
      <p className={`mb-6 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      }`}>
        現在は無料版をご利用中です。<br />
        ログイン/登録すると、すべての学習コンテンツにアクセスでき、<br />
        学習進捗の管理も可能になります。<br />
        登録は無料です。
      </p>
      
      {/* 統計情報 */}
      <div className={`mb-6 p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
            }`}>
              {freemiumInfo.availableContents}
            </div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              プレビュー可能
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
            }`}>
              {freemiumInfo.lockedContents}
            </div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              プレミアム限定
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}>
              {freemiumInfo.totalContents}
            </div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              総コンテンツ数
            </div>
          </div>
        </div>
      </div>
      
      {/* アクションボタン */}
      <div className="space-y-3">
        <Link
          to="/auth"
          className="inline-block w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          無料で登録/ログイン
        </Link>
        
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          登録は無料です。メールアドレスのみで簡単に始められます。
        </p>
      </div>
      
      {/* 機能説明 */}
      <div className={`mt-8 p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <h4 className={`font-semibold mb-3 ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          🎯 登録するとできること
        </h4>
        <ul className={`text-sm space-y-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <li className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            全ての学習コンテンツへのアクセス
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            学習進捗の自動保存・管理
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            クイズ機能の利用
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            コミュニティ機能への参加
          </li>
        </ul>
      </div>
      
      {/* フッターメッセージ */}
      <div className={`mt-6 text-xs ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        Flight Academy は航空教育をより身近にするプラットフォームです
      </div>
    </div>
  );
};

export default FreemiumUpgradePrompt; 