import 'katex/dist/katex.min.css';
import { MDXProvider } from '@mdx-js/react';
import React, { Suspense } from 'react';
import ArticleHeader from '../../pages/articles/components/ArticleHeader';
import RelatedArticles from '../../pages/articles/components/RelatedArticles';
import TableOfContents from '../../pages/articles/components/TableOfContents';
import ArticleJsonLd from '../../pages/articles/components/seo/ArticleJsonLd';
import ArticleMetaTags from '../../pages/articles/components/seo/ArticleMetaTags';
import type { ArticleMeta } from '../../types/articles';
import { Callout, Footnote, FootnoteRef } from './CalloutComponents';
import CalloutBox from './CalloutBox';
import CodeBlock from './CodeBlock';
import Highlight from './Highlight';
import ImageWithOptimization from './ImageWithOptimization';

const DiagramComponent = React.lazy(() => import('./DiagramComponent'));
const QuizComponent = React.lazy(() => import('./QuizComponent'));

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;
type ListProps = React.HTMLAttributes<HTMLUListElement | HTMLOListElement>;
type ListItemProps = React.HTMLAttributes<HTMLLIElement>;
type TableProps = React.HTMLAttributes<HTMLTableElement>;
type TableCellProps = React.HTMLAttributes<HTMLTableCellElement>;
type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;
type AnchorProps = React.HTMLAttributes<HTMLAnchorElement>;
type BlockquoteProps = React.HTMLAttributes<HTMLElement>;

const BLOCK_TAGS = new Set([
  'div',
  'p',
  'ul',
  'ol',
  'table',
  'blockquote',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'section',
  'figure',
]);

function hasBlockChild(children: React.ReactNode): boolean {
  return React.Children.toArray(children).some((child) => {
    if (!React.isValidElement(child)) return false;
    const type = child.type;
    if (typeof type === 'string') {
      return BLOCK_TAGS.has(type);
    }
    return true;
  });
}

const diagramFallback = (
  <div className="my-6 h-32 animate-pulse rounded-lg bg-brand-surface" aria-hidden />
);

const MDXContentWithTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const textColor = 'text-[var(--text-primary)]';
  const headingColor = 'text-brand-primary';
  const linkColor = 'text-brand-primary';
  const borderColor = 'border-brand-primary/20';

  const components = {
    h1: (props: HeadingProps) => (
      <h1 className={`mb-6 break-words border-b-2 border-brand-primary/40 pb-2 text-2xl font-bold tracking-tight sm:text-3xl ${headingColor}`} {...props} />
    ),
    h2: (props: HeadingProps) => (
      <h2 className={`mb-4 mt-8 break-words text-xl font-bold tracking-tight sm:text-2xl ${headingColor}`} {...props} />
    ),
    h3: (props: HeadingProps) => (
      <h3 className={`mb-3 mt-6 break-words text-lg font-bold tracking-tight sm:text-xl ${headingColor}`} {...props} />
    ),
    p: (props: ParagraphProps) => {
      const Tag = hasBlockChild(props.children) ? 'div' : 'p';
      return (
        <Tag
          className={`mb-5 break-words text-base tracking-wide leading-7 sm:leading-8 ${textColor}`}
          {...props}
        />
      );
    },
    ul: (props: ListProps) => <ul className={`my-4 list-disc space-y-2 pl-6 ${textColor}`} {...props} />,
    ol: (props: ListProps) => <ol className={`my-4 list-decimal space-y-2 pl-6 ${textColor}`} {...props} />,
    li: (props: ListItemProps) => (
      <li className={`mb-1 break-words text-base leading-7 sm:leading-8 ${textColor}`} {...props} />
    ),
    blockquote: (props: BlockquoteProps) => (
      <blockquote
        className="important-box my-6 rounded-r-lg border-l-4 border-hud-warning bg-hud-warning/10 p-4 text-[var(--text-primary)] shadow-sm break-words"
        {...props}
      />
    ),
    table: (props: TableProps) => <table className="my-6 w-full border-collapse shadow-sm" {...props} />,
    th: (props: TableCellProps) => (
      <th className={`break-words border ${borderColor} bg-brand-surface p-3 text-left text-[var(--text-primary)]`} {...props} />
    ),
    td: (props: TableCellProps) => (
      <td className={`break-words border ${borderColor} p-3 ${textColor}`} {...props} />
    ),
    tr: (props: TableRowProps) => <tr className="even:bg-brand-surface/50" {...props} />,
    a: (props: AnchorProps) => <a className={`${linkColor} break-all underline`} {...props} />,
    strong: (props: React.HTMLAttributes<HTMLElement>) => (
      <strong className={`font-bold ${textColor}`} {...props} />
    ),
    em: (props: React.HTMLAttributes<HTMLElement>) => (
      <em className={`italic ${textColor}`} {...props} />
    ),
    Image: ImageWithOptimization,
    ImageOptimized: ImageWithOptimization,
    Callout,
    CalloutBox,
    Footnote,
    FootnoteRef,
    Code: CodeBlock,
    Quiz: (props: React.ComponentProps<typeof QuizComponent>) => (
      <Suspense fallback={diagramFallback}>
        <QuizComponent {...props} />
      </Suspense>
    ),
    Diagram: (props: React.ComponentProps<typeof DiagramComponent>) => (
      <Suspense fallback={diagramFallback}>
        <DiagramComponent {...props} />
      </Suspense>
    ),
    Highlight,
  };

  return (
    <MDXProvider components={components}>
      <div className="prose prose-invert w-full min-w-0 max-w-none overflow-x-auto rounded-lg bg-brand-secondary p-2 text-base leading-7 shadow-md transition-all duration-300 sm:p-4 sm:leading-8 md:p-6">
        <div className="mx-auto w-full min-w-0 max-w-3xl">
          {children}
        </div>
      </div>
    </MDXProvider>
  );
};

interface MDXContentProps {
  children: React.ReactNode;
  meta?: ArticleMeta | null;
  contentId?: string;
}

const MDXContent: React.FC<MDXContentProps> = ({ children, meta, contentId: _contentId }) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      {meta && (
        <>
          <ArticleMetaTags meta={meta} url={currentUrl} />
          <ArticleJsonLd meta={meta} url={currentUrl} />
        </>
      )}

      {meta && <ArticleHeader meta={meta} />}

      <div className="flex gap-8">
        <div className="min-w-0 w-full flex-1">
          <MDXContentWithTheme>{children}</MDXContentWithTheme>

          {meta && (
            <div className="mt-12">
              <RelatedArticles currentSlug={meta.slug} collapsed />
            </div>
          )}
        </div>

        <div className="hidden flex-shrink-0 xl:block">
          <TableOfContents mode="sidebar" compact={true} />
        </div>
      </div>

      <div className="xl:hidden">
        <TableOfContents mode="drawer" />
      </div>
    </>
  );
};

export default MDXContent;
