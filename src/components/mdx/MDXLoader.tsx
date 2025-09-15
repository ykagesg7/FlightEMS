import { MDXProvider } from '@mdx-js/react';
import React, { useEffect, useState } from 'react';
import type { ArticleMeta, MDXModule } from '../../types/articles';
import { getArticleBySlug } from '../../utils/articlesIndex';
import MDXContent from './MDXContent';

interface MDXLoaderProps {
  contentId: string; // コンテンツID（後方互換性のため）
  slug?: string; // 新しいslugベースのローディング
  showPath?: boolean; // ファイルパスを表示するかどうか
}

// コンテンツ読み込みが完了したときに発火するカスタムイベント
export const MDX_CONTENT_LOADED_EVENT = 'mdx-content-loaded';

// UUIDの形式かどうかをチェック
const isUUID = (str: string): boolean => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
};

const MDXLoader: React.FC<MDXLoaderProps> = ({ contentId, slug, showPath }) => {
  const [Content, setContent] = useState<React.ComponentType | null>(null);
  const [meta, setMeta] = useState<ArticleMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMDX = async () => {
      try {
        setLoading(true);
        setError(null);

        let module: MDXModule;
        let articleMeta: ArticleMeta | null = null;

        // slugが指定されている場合は新しいインデックスベースのローディング
        if (slug) {
          const articleEntry = await getArticleBySlug(slug);
          if (!articleEntry) {
            throw new Error(`記事が見つかりません: ${slug}`);
          }
          module = await articleEntry.loader();
          articleMeta = articleEntry.meta;
        } else {
          // 後方互換性のため、contentIdベースのローディングも保持
          // UUIDの場合は特別なエラーメッセージを表示
          if (isUUID(contentId)) {
            console.error('UUIDフォーマットのコンテンツIDは現在サポートされていません:', contentId);
            setError(`コンテンツID "${contentId}" はUUIDフォーマットのため読み込めません。代わりに管理者ページから新しいコンテンツを追加してください。`);
            setContent(null);
            setLoading(false);
            return;
          }

          // 従来の動的インポート方式
          try {
            // Try articles directory first
            module = await import(`../../content/articles/${contentId}.mdx`);
          } catch (err) {
            // If articles fails, try lessons directory
            try {
              module = await import(`../../content/lessons/${contentId}.mdx`);
            } catch (err2) {
              // If both fail, try legacy path
              try {
                module = await import(`../../content/${contentId}.mdx`);
              } catch (err3) {
                throw err3; // All paths failed
              }
            }
          }
          articleMeta = module.meta || null;
        }

        setContent(() => module.default);
        setMeta(articleMeta);
        setError(null);
      } catch (err) {
        console.error('MDXの読み込みに失敗しました:', err);
        const identifier = slug || contentId;
        setError(`コンテンツ "${identifier}" の読み込みに失敗しました。ファイルが存在するか確認してください。`);
        setContent(null);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };

    loadMDX();
  }, [contentId, slug]);

  // コンテンツの読み込みが完了したときにイベントを発火
  useEffect(() => {
    if (!loading && Content) {
      // 少し遅延させてコンテンツがDOMに反映された後にイベントを発火
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent(MDX_CONTENT_LOADED_EVENT, {
          detail: {
            contentId: contentId,
            slug: slug || meta?.slug,
            meta: meta
          }
        }));
        // コンテンツ読み込み完了
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [loading, Content, contentId, slug, meta]);

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
          {slug ? `Slug: ${slug}` : `コンテンツID: ${contentId}`}
          {meta && <span className="ml-2">({meta.title})</span>}
        </div>
      )}
      {Content ? (
        <MDXProvider>
          <MDXContent meta={meta}>
            <Content />
          </MDXContent>
        </MDXProvider>
      ) : null}
    </div>
  );
};

export default MDXLoader;
