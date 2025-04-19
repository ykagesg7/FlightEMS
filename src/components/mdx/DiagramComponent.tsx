import React, { useState, useRef, useEffect } from 'react';

interface DiagramComponentProps {
  src: string;
  alt: string;
  caption?: string;
  width?: string;
  height?: string;
  zoomable?: boolean;
  pointerMode?: boolean;
}

/**
 * MDX内で使用できる航空図や図解表示用のコンポーネント
 * - 拡大縮小機能
 * - ポインター機能（クリックで位置を示す）
 * - キャプション表示
 */
const DiagramComponent: React.FC<DiagramComponentProps> = ({
  src,
  alt,
  caption,
  width = '100%',
  height = 'auto',
  zoomable = true,
  pointerMode = false,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pointers, setPointers] = useState<{ x: number; y: number; label: string }[]>([]);
  const [isAddingPointer, setIsAddingPointer] = useState(false);
  const [pointerLabel, setPointerLabel] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // ズームイン
  const zoomIn = () => {
    if (scale < 5) setScale(Math.min(scale + 0.25, 5));
  };

  // ズームアウト
  const zoomOut = () => {
    if (scale > 0.5) setScale(Math.max(scale - 0.25, 0.5));
  };

  // ズームリセット
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!zoomable || pointerMode) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // ドラッグ中
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !zoomable || pointerMode) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  // ドラッグ終了
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ポインター追加モード切替
  const togglePointerMode = () => {
    setPointerMode(!pointerMode);
    setIsAddingPointer(false);
  };

  // 画像クリック時の処理
  const handleImageClick = (e: React.MouseEvent) => {
    if (!pointerMode || !imageRef.current || !containerRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (isAddingPointer) {
      if (pointerLabel.trim()) {
        setPointers([...pointers, { x, y, label: pointerLabel }]);
        setPointerLabel('');
        setIsAddingPointer(false);
      }
    } else {
      setIsAddingPointer(true);
      setPointerLabel(`ポイント ${pointers.length + 1}`);
    }
  };

  // ポインター削除
  const removePointer = (index: number) => {
    const newPointers = [...pointers];
    newPointers.splice(index, 1);
    setPointers(newPointers);
  };

  // マウスイベントのクリーンアップ
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="my-8">
      <div className="mb-2 flex justify-between items-center">
        {zoomable && (
          <div className="flex space-x-2">
            <button
              onClick={zoomOut}
              className="bg-gray-200 hover:bg-gray-300 rounded p-1"
              title="ズームアウト"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={resetZoom}
              className="bg-gray-200 hover:bg-gray-300 rounded p-1"
              title="リセット"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={zoomIn}
              className="bg-gray-200 hover:bg-gray-300 rounded p-1"
              title="ズームイン"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
        {pointerMode && (
          <div className="flex space-x-2 ml-auto">
            {isAddingPointer ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={pointerLabel}
                  onChange={(e) => setPointerLabel(e.target.value)}
                  className="border rounded px-2 py-1 text-sm w-40 mr-2"
                  placeholder="ラベルを入力"
                />
                <button
                  onClick={() => setIsAddingPointer(false)}
                  className="bg-gray-200 hover:bg-gray-300 rounded p-1 text-sm"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingPointer(true)}
                className={`rounded p-1 text-sm px-2 ${isAddingPointer ? 'bg-indigo-500 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'}`}
              >
                ポインター追加
              </button>
            )}
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="overflow-hidden border rounded-lg bg-gray-100 relative"
        style={{ height: typeof height === 'string' ? height : `${height}px` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          className="diagram-content transition-transform duration-100"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center',
            cursor: isDragging ? 'grabbing' : pointerMode ? 'crosshair' : 'grab',
          }}
        >
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            className="max-w-full max-h-full mx-auto"
            style={{ width: width }}
            onClick={handleImageClick}
          />
        </div>

        {pointers.map((pointer, index) => (
          <div
            key={index}
            className="absolute bg-red-500 rounded-full w-3 h-3 transform -translate-x-1.5 -translate-y-1.5"
            style={{
              left: `${pointer.x}%`,
              top: `${pointer.y}%`,
              zIndex: 10,
            }}
          >
            <div className="group relative">
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-white shadow rounded p-2 text-xs min-w-max">
                {pointer.label}
                <button
                  onClick={() => removePointer(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {caption && (
        <figcaption className="text-center text-sm text-gray-600 mt-2">
          {caption}
        </figcaption>
      )}
    </div>
  );
};

export default DiagramComponent; 