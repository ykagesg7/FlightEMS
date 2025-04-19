import React, { useRef, useEffect, useState } from 'react';
// @ts-ignore
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

// MermaidのDOMコンテナタイプ
interface MermaidContainerProps {
  chartId: string; 
  className?: string;
}

// ダイアグラムのプロパティタイプ
interface DiagramComponentProps {
  chart: string;
  title?: string;
  caption?: string;
  theme?: 'default' | 'forest' | 'dark' | 'neutral';
  className?: string;
}

// MermaidJSコンテナコンポーネント
const MermaidContainer: React.FC<MermaidContainerProps> = ({ chartId, className }) => {
  return <div id={chartId} className={className}></div>;
};

/**
 * MDX内で使用できる航空図や図解表示用のコンポーネント
 * - 拡大縮小機能
 * - ポインター機能（クリックで位置を示す）
 * - キャプション表示
 */
const DiagramComponent: React.FC<DiagramComponentProps> = ({ 
  chart, 
  title, 
  caption,
  theme = 'default',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartId] = useState(`mermaid-${Math.random().toString(36).substring(2, 10)}`);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // MermaidJS初期化
    mermaid.initialize({
      startOnLoad: true,
      theme,
      securityLevel: 'loose', 
      fontFamily: '"Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif'
    });

    try {
      // SVGをレンダリング
      mermaid.render(chartId, chart).then((result: { svg: string }) => {
        if (containerRef.current) {
          const container = document.getElementById(chartId);
          if (container) {
            container.innerHTML = result.svg;
            setError(null);

            // SVG画像をダウンロードするための準備
            const svgBlob = new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            setDownloadUrl(url);
          }
        }
      }).catch((err: Error) => {
        console.error('Mermaidレンダリングエラー:', err);
        setError('ダイアグラムの解析中にエラーが発生しました。構文を確認してください。');
      });
    } catch (err) {
      console.error('Mermaid初期化エラー:', err);
      setError('ダイアグラムの初期化中にエラーが発生しました。');
    }

    // クリーンアップ関数
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [chart, chartId, theme]);

  // SVGをダウンロードする関数
  const handleDownload = () => {
    if (!downloadUrl) return;
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `diagram-${chartId}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // PNG形式でダウンロードする関数
  const handlePngDownload = () => {
    if (!containerRef.current) return;
    
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagram-${chartId}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className={`diagram-container bg-gray-50 rounded-lg p-4 my-6 shadow-sm border border-gray-200 ${className}`}>
      {title && <h4 className="text-lg font-bold mb-2 text-indigo-800">{title}</h4>}
      
      <div ref={containerRef} className="mermaid-wrapper bg-white p-4 rounded border border-gray-100 overflow-auto">
        {error ? (
          <div className="error-message bg-red-100 text-red-700 p-3 rounded">
            <p className="font-bold">エラー</p>
            <p>{error}</p>
            <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">{chart}</pre>
          </div>
        ) : (
          <MermaidContainer chartId={chartId} className="flex justify-center" />
        )}
      </div>
      
      {caption && <p className="text-sm text-gray-600 mt-2 text-center">{caption}</p>}
      
      {!error && downloadUrl && (
        <div className="flex justify-end mt-2 space-x-2">
          <button 
            onClick={handleDownload}
            className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
          >
            SVGをダウンロード
          </button>
          <button 
            onClick={handlePngDownload}
            className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
          >
            PNGをダウンロード
          </button>
        </div>
      )}
    </div>
  );
};

export default DiagramComponent; 