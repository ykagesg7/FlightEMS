import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { KeyboardShortcuts } from '../components/articles/KeyboardShortcuts';
import { PrevNextNav } from '../components/articles/PrevNextNav';
import { ReadingProgressBar } from '../components/articles/ReadingProgressBar';
import { ScrollToButtons } from '../components/articles/ScrollToButtons';
import { usePrevNext } from '../components/articles/usePrevNext';
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

  const { prev, next } = usePrevNext(contentId);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <ReadingProgressBar contentId={contentId} />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Link to="/articles" className="text-sm text-[color:var(--hud-primary)] underline">← 記事一覧へ</Link>
        </div>
        <MDXLoader contentId={contentId} />
        <PrevNextNav currentId={contentId} listPath="/articles" />
      </div>
      <ScrollToButtons />
      <KeyboardShortcuts prevId={prev?.id} nextId={next?.id} />
    </div>
  );
};

export default ArticleDetailPage;


