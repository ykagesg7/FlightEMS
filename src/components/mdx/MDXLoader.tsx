import React, { useState, useEffect } from 'react';
import { MDXProvider } from '@mdx-js/react';
import MDXContent from './MDXContent';

interface MDXLoaderProps {
  filePath: string; // 読み込むMDXファイルのパス (例: "../content/1.1-instrument-flight")
  showPath?: boolean; // ファイルパスを表示するかどうか
}

// コンテンツ読み込みが完了したときに発火するカスタムイベント
export const MDX_CONTENT_LOADED_EVENT = 'mdx-content-loaded';

const MDXLoader: React.FC<MDXLoaderProps> = ({ filePath, showPath }) => {
  const [Content, setContent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMDX = async () => {
      try {
        setLoading(true);
        const module = await import(`@content/${filePath}.mdx`);
        setContent(() => module.default);
        setError(null);
      } catch (err) {
        console.error('MDXの読み込みに失敗しました:', err);
        setError(`ファイル "${filePath}" の読み込みに失敗しました。ファイルが存在するか確認してください。`);
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    loadMDX();
  }, [filePath]);

  // コンテンツの読み込みが完了したときにイベントを発火
  useEffect(() => {
    if (!loading && Content) {
      // 少し遅延させてコンテンツがDOMに反映された後にイベントを発火
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent(MDX_CONTENT_LOADED_EVENT, { 
          detail: { contentId: filePath }
        }));
        console.log(`コンテンツの読み込みが完了しました: ${filePath}`);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [loading, Content, filePath]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 p-4 my-4 rounded-lg shadow-sm">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="mdx-container">
      {showPath && (
        <div className="bg-gray-100 text-gray-600 text-sm p-2 mb-4 rounded-lg shadow-sm">
          ファイル: {filePath}.mdx
        </div>
      )}
      {Content ? (
        <MDXProvider>
          <MDXContent>
            <Content />
          </MDXContent>
        </MDXProvider>
      ) : null}
    </div>
  );
};

export default MDXLoader; 