import { MDXProvider } from '@mdx-js/react';
import React, { useEffect, useState } from 'react';
import MDXContent from './MDXContent';

interface MDXLoaderProps {
  contentId: string; // コンテンツID (filePath を contentId にリネーム)
  showPath?: boolean; // ファイルパスを表示するかどうか
}

// コンテンツ読み込みが完了したときに発火するカスタムイベント
export const MDX_CONTENT_LOADED_EVENT = 'mdx-content-loaded';

// UUIDの形式かどうかをチェック
const isUUID = (str: string): boolean => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
};

const MDXLoader: React.FC<MDXLoaderProps> = ({ contentId, showPath }) => {
  const [Content, setContent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMDX = async () => {
      // UUIDの場合は特別なエラーメッセージを表示
      if (isUUID(contentId)) {
        console.error('UUIDフォーマットのコンテンツIDは現在サポートされていません:', contentId);
        setError(`コンテンツID "${contentId}" はUUIDフォーマットのため読み込めません。代わりに管理者ページから新しいコンテンツを追加してください。`);
        setContent(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`MDXファイルを読み込みます: ${contentId}.mdx`);

        // ファイルパスを指定してimport
        // 注: コンテンツIDに基づいて動的にインポートするため、エラーが発生する可能性があります
        try {
          const module = await import(`../../content/${contentId}.mdx`);
          console.log('MDXファイルの読み込みに成功しました', module);
          setContent(() => module.default);
          setError(null);
        } catch (err) {
          // 最初のパスでの読み込みに失敗した場合、別のパスを試す
          try {
            const module = await import(`@content/${contentId}.mdx`);
            console.log('MDXファイルの読み込みに成功しました（エイリアス経由）', module);
            setContent(() => module.default);
            setError(null);
          } catch (err2) {
            throw err2; // 両方のパスで失敗した場合はエラーをスロー
          }
        }
      } catch (err) {
        console.error('MDXの読み込みに失敗しました:', err);
        setError(`コンテンツID "${contentId}" の読み込みに失敗しました。ファイルが存在するか確認してください。`);
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    loadMDX();
  }, [contentId]);

  // コンテンツの読み込みが完了したときにイベントを発火
  useEffect(() => {
    if (!loading && Content) {
      // 少し遅延させてコンテンツがDOMに反映された後にイベントを発火
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent(MDX_CONTENT_LOADED_EVENT, {
          detail: { contentId: contentId }
        }));
        console.log(`コンテンツの読み込みが完了しました: ${contentId}`);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [loading, Content, contentId]);

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
        <p className="text-sm text-red-600 mt-2">
          以下のコンテンツIDが使用されました: {contentId}
        </p>
      </div>
    );
  }

  return (
    <div className="mdx-container">
      {showPath && (
        <div className="bg-gray-100 text-gray-600 text-sm p-2 mb-4 rounded-lg shadow-sm">
          コンテンツID: {contentId}
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
