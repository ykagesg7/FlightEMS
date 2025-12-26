import React, { useCallback, useRef, useState } from 'react';

interface MultimodalSearchProps {
  onTextSearch: (query: string) => void;
  onImageSearch: (imageData: string) => void;
  onVoiceSearch: (transcript: string) => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

interface SearchMode {
  type: 'text' | 'image' | 'voice';
  label: string;
  icon: string;
  description: string;
}

const MultimodalSearch: React.FC<MultimodalSearchProps> = ({
  onTextSearch,
  onImageSearch,
  onVoiceSearch,
  isListening,
  onStartListening,
  onStopListening
}) => {
  const [activeMode, setActiveMode] = useState<SearchMode['type']>('text');
  const [textQuery, setTextQuery] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchModes: SearchMode[] = [
    {
      type: 'text',
      label: 'テキスト検索',
      icon: '📝',
      description: 'キーワードで記事を検索'
    },
    {
      type: 'image',
      label: '画像検索',
      icon: '🖼️',
      description: '画像から関連記事を検索'
    },
    {
      type: 'voice',
      label: '音声検索',
      icon: '🎤',
      description: '音声で記事を検索'
    }
  ];

  // テキスト検索の実行
  const handleTextSearch = useCallback(() => {
    if (textQuery.trim()) {
      onTextSearch(textQuery);
    }
  }, [textQuery, onTextSearch]);

  // 画像アップロードの処理
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setImagePreview(imageData);
        onImageSearch(imageData);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSearch]);

  // 音声検索の処理
  const handleVoiceSearch = useCallback(() => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  }, [isListening, onStartListening, onStopListening]);

  // 画像検索のクリア
  const clearImageSearch = useCallback(() => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="p-4 rounded-lg border backdrop-blur-sm hud-surface border-gray-300">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">
          🔍 マルチモーダル検索
        </h3>
        <div className="text-xs text-gray-500">
          テキスト・画像・音声で検索
        </div>
      </div>

      {/* 検索モード選択 */}
      <div className="flex space-x-2 mb-4">
        {searchModes.map((mode) => (
          <button
            key={mode.type}
            onClick={() => setActiveMode(mode.type)}
            className={`flex-1 p-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeMode === mode.type
                ? 'bg-green-500 text-white shadow-green-500/50 shadow-lg'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
          >
            <div className="flex items-center space-x-1">
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* テキスト検索 */}
      {activeMode === 'text' && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="キーワードで記事を検索..."
              value={textQuery}
              onChange={(e) => setTextQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTextSearch();
                }
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 transition-colors bg-white text-gray-900 border-gray-300 focus:ring-green-500 focus:border-green-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button
            onClick={handleTextSearch}
            className="w-full py-2 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
          >
            検索実行
          </button>
        </div>
      )}

      {/* 画像検索 */}
      {activeMode === 'image' && (
        <div className="space-y-3">
          <div className="border-2 border-dashed rounded-lg p-4 text-center border-gray-300 bg-gray-50">
            {imagePreview ? (
              <div className="space-y-2">
                <img
                  src={imagePreview}
                  alt="アップロード画像"
                  className="max-h-32 mx-auto rounded"
                />
                <button
                  onClick={clearImageSearch}
                  className="text-xs px-2 py-1 rounded transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                >
                  画像をクリア
                </button>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-sm text-gray-500">
                  画像をドラッグ&ドロップまたはクリックして選択
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-4 py-2 rounded-lg text-sm transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  画像を選択
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 音声検索 */}
      {activeMode === 'voice' && (
        <div className="space-y-3">
          <div className={`p-4 rounded-lg text-center ${isListening
              ? 'bg-red-50 border border-red-200'
              : 'bg-gray-50 border border-gray-200'
            }`}>
            <div className="text-4xl mb-2">
              {isListening ? '🎤' : '🔇'}
            </div>
            <p className="text-sm mb-3 text-gray-500">
              {isListening ? '音声を聞いています...' : '音声検索を開始'}
            </p>
            <button
              onClick={handleVoiceSearch}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isListening
                  ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {isListening ? '音声検索を停止' : '音声検索を開始'}
            </button>
          </div>
        </div>
      )}

      {/* 検索モードの説明 */}
      <div className="mt-4 p-3 rounded-lg text-xs bg-gray-50 text-gray-500">
        <div className="font-medium mb-1">
          {searchModes.find(m => m.type === activeMode)?.label}
        </div>
        <div>
          {searchModes.find(m => m.type === activeMode)?.description}
        </div>
      </div>
    </div>
  );
};

export default MultimodalSearch;
