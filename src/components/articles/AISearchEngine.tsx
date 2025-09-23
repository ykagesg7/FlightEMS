import React, { useCallback, useMemo, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface AISearchEngineProps {
  onSearch: (query: string, intent: SearchIntent) => void;
  onVoiceSearch: (transcript: string) => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

interface SearchIntent {
  type: 'concept' | 'tutorial' | 'reference' | 'comparison' | 'troubleshooting';
  confidence: number;
  keywords: string[];
  relatedTags: string[];
}

interface SearchSuggestion {
  text: string;
  type: 'concept' | 'tutorial' | 'reference';
  icon: string;
  description: string;
}

const AISearchEngine: React.FC<AISearchEngineProps> = ({
  onSearch,
  onVoiceSearch,
  isListening,
  onStartListening,
  onStopListening
}) => {
  const { effectiveTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // AI検索意図分析
  const analyzeSearchIntent = useCallback((searchQuery: string): SearchIntent => {
    const normalizedQuery = searchQuery.toLowerCase();

    // チュートリアル系の検索意図
    if (normalizedQuery.includes('やり方') || normalizedQuery.includes('方法') ||
      normalizedQuery.includes('手順') || normalizedQuery.includes('how to')) {
      return {
        type: 'tutorial',
        confidence: 0.9,
        keywords: ['手順', '方法', 'やり方'],
        relatedTags: ['思考法', 'メンタリティー', '操縦']
      };
    }

    // 概念・理論系の検索意図
    if (normalizedQuery.includes('とは') || normalizedQuery.includes('概念') ||
      normalizedQuery.includes('理論') || normalizedQuery.includes('what is')) {
      return {
        type: 'concept',
        confidence: 0.8,
        keywords: ['概念', '理論', '定義'],
        relatedTags: ['思考法', 'メンタリティー', '7つの習慣']
      };
    }

    // 比較系の検索意図
    if (normalizedQuery.includes('違い') || normalizedQuery.includes('比較') ||
      normalizedQuery.includes('vs') || normalizedQuery.includes('対比')) {
      return {
        type: 'comparison',
        confidence: 0.7,
        keywords: ['比較', '違い', '対比'],
        relatedTags: ['思考法', 'メンタリティー']
      };
    }

    // トラブルシューティング系の検索意図
    if (normalizedQuery.includes('問題') || normalizedQuery.includes('解決') ||
      normalizedQuery.includes('困った') || normalizedQuery.includes('troubleshoot')) {
      return {
        type: 'troubleshooting',
        confidence: 0.8,
        keywords: ['問題', '解決', 'トラブル'],
        relatedTags: ['メンタル', '思考法', '体の記憶']
      };
    }

    // デフォルト：リファレンス系
    return {
      type: 'reference',
      confidence: 0.6,
      keywords: normalizedQuery.split(' '),
      relatedTags: ['思考法', 'メンタリティー', '操縦']
    };
  }, []);

  // 検索候補の生成
  const searchSuggestions = useMemo((): SearchSuggestion[] => {
    const baseSuggestions: SearchSuggestion[] = [
      {
        text: '7つの習慣とは',
        type: 'concept',
        icon: '💡',
        description: '成功哲学の基本概念を学ぶ'
      },
      {
        text: 'GIVE&TAKEのやり方',
        type: 'tutorial',
        icon: '🎯',
        description: '実践的な手法を身につける'
      },
      {
        text: '体の記憶の鍛え方',
        type: 'tutorial',
        icon: '💪',
        description: 'パイロットの基本スキル'
      },
      {
        text: 'メンタリティーの違い',
        type: 'comparison',
        icon: '⚖️',
        description: '異なる思考法を比較'
      },
      {
        text: 'トップガンの教え',
        type: 'reference',
        icon: '✈️',
        description: '映画から学ぶリーダーシップ'
      }
    ];

    // 検索履歴に基づくパーソナライズ候補
    const personalizedSuggestions = searchHistory
      .slice(0, 3)
      .map(history => ({
        text: history,
        type: 'reference' as const,
        icon: '🕒',
        description: '最近検索した内容'
      }));

    return [...personalizedSuggestions, ...baseSuggestions];
  }, [searchHistory]);

  // 検索実行
  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const intent = analyzeSearchIntent(searchQuery);
    onSearch(searchQuery, intent);

    // 検索履歴に追加
    setSearchHistory(prev => {
      const newHistory = [searchQuery, ...prev.filter(h => h !== searchQuery)];
      return newHistory.slice(0, 10); // 最新10件まで保持
    });

    setShowSuggestions(false);
  }, [analyzeSearchIntent, onSearch]);

  // 音声検索の処理
  const handleVoiceSearch = useCallback(() => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  }, [isListening, onStartListening, onStopListening]);

  return (
    <div className={`p-4 rounded-lg border backdrop-blur-sm ${effectiveTheme === 'dark'
        ? 'hud-surface border-gray-700'
        : 'hud-surface border-gray-300'
      }`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-medium ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
          🤖 AI検索エンジン
        </h3>
        <div className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
          検索意図を理解して最適な結果を提供
        </div>
      </div>

      {/* 検索バー */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="AIが検索意図を理解します..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            }
          }}
          className={`w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 transition-all duration-200 ${effectiveTheme === 'dark'
              ? 'bg-gray-700 text-white border-gray-600 focus:ring-red-500 focus:border-red-500'
              : 'bg-white text-gray-900 border-gray-300 focus:ring-green-500 focus:border-green-500'
            }`}
        />

        {/* 検索アイコン */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* 音声検索ボタン */}
        <button
          onClick={handleVoiceSearch}
          className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200 ${isListening
              ? 'text-red-500 animate-pulse'
              : effectiveTheme === 'dark'
                ? 'text-gray-400 hover:text-red-400'
                : 'text-gray-500 hover:text-green-500'
            }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>

      {/* 音声検索状態表示 */}
      {isListening && (
        <div className={`mb-4 p-3 rounded-lg ${effectiveTheme === 'dark'
            ? 'bg-red-900/20 border border-red-500/50'
            : 'bg-red-50 border border-red-200'
          }`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className={`text-sm ${effectiveTheme === 'dark' ? 'text-red-300' : 'text-red-700'
              }`}>
              音声を聞いています... 話してください
            </span>
          </div>
        </div>
      )}

      {/* 検索候補 */}
      {showSuggestions && (
        <div className={`mb-4 p-3 rounded-lg border ${effectiveTheme === 'dark'
            ? 'bg-gray-800 border-gray-600'
            : 'bg-gray-50 border-gray-200'
          }`}>
          <div className={`text-xs mb-2 ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
            検索候補
          </div>
          <div className="space-y-2">
            {searchSuggestions
              .filter(suggestion =>
                suggestion.text.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5)
              .map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion.text);
                    handleSearch(suggestion.text);
                  }}
                  className={`w-full text-left p-2 rounded-md transition-colors duration-200 ${effectiveTheme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{suggestion.icon}</span>
                    <div>
                      <div className="font-medium">{suggestion.text}</div>
                      <div className={`text-xs ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        {suggestion.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* 検索履歴 */}
      {searchHistory.length > 0 && !showSuggestions && (
        <div className={`p-3 rounded-lg border ${effectiveTheme === 'dark'
            ? 'bg-gray-800 border-gray-600'
            : 'bg-gray-50 border-gray-200'
          }`}>
          <div className={`text-xs mb-2 ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
            最近の検索
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 5).map((history, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(history);
                  handleSearch(history);
                }}
                className={`px-2 py-1 rounded-md text-xs transition-colors duration-200 ${effectiveTheme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {history}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISearchEngine;
