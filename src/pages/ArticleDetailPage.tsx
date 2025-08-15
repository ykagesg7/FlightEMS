import React from 'react';
import { Link, useParams } from 'react-router-dom';
import MDXLoader from '../components/mdx/MDXLoader';

const ArticleDetailPage: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();

  if (!contentId) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">コンテンツIDが指定されていません。</p>
        <Link to="/articles" className="underline">記事一覧へ戻る</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Link to="/articles" className="text-sm text-[color:var(--hud-primary)] underline">← 記事一覧へ</Link>
        </div>
        <MDXLoader contentId={contentId} />
      </div>
    </div>
  );
};

export default ArticleDetailPage;


