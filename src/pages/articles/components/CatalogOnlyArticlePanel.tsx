import React from 'react';
import MDXContent from '../../../components/mdx/MDXContent';
import type { ArticleMeta } from '../../../types/articles';
import type { LearningContent } from '../../../types';

type CatalogOnlyArticlePanelProps = {
  meta: ArticleMeta;
  contentId: string;
  learning?: LearningContent | null;
};

/**
 * MDX 未整備の `learning_contents` 行向けプレースホルダ（予約 slug のみ公開）。
 */
export const CatalogOnlyArticlePanel: React.FC<CatalogOnlyArticlePanelProps> = ({
  meta,
  contentId,
  learning,
}) => (
  <MDXContent meta={meta} contentId={contentId}>
    <div className="prose prose-invert max-w-none">
      <p className="text-base leading-relaxed text-[var(--text-primary)]">
        {learning?.description ??
          '本文は現在整備中です。シラバス上の位置づけと DB 登録のみ先行公開しています。'}
      </p>
    </div>
  </MDXContent>
);