import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import * as MDXComponents from './index';
import { useTheme } from '../../contexts/ThemeContext';

// HTML要素のプロップス型定義
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {}
interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {}
interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {}
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}
interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {}
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}
interface AnchorProps extends React.HTMLAttributes<HTMLAnchorElement> {}
interface BlockquoteProps extends React.HTMLAttributes<HTMLElement> {}

// MDXコンポーネント型定義
export interface MDXComponents {
  h1: React.ComponentType<HeadingProps>;
  h2: React.ComponentType<HeadingProps>;
  h3: React.ComponentType<HeadingProps>;
  p: React.ComponentType<ParagraphProps>;
  ul: React.ComponentType<ListProps>;
  ol: React.ComponentType<ListProps>;
  li: React.ComponentType<ListItemProps>;
  blockquote: React.ComponentType<BlockquoteProps>;
  table: React.ComponentType<TableProps>;
  th: React.ComponentType<TableCellProps>;
  td: React.ComponentType<TableCellProps>;
  tr: React.ComponentType<TableRowProps>;
  a: React.ComponentType<AnchorProps>;
  strong: React.ComponentType<React.HTMLAttributes<HTMLElement>>;
  em: React.ComponentType<React.HTMLAttributes<HTMLElement>>;
}

// MDXでカスタマイズできるコンポーネント
const MDXContentWithTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  
  // ダークモード用のスタイル
  const textColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';
  const headingColor = theme === 'dark' ? 'text-indigo-300' : 'text-indigo-900';
  const subHeadingColor = theme === 'dark' ? 'text-indigo-200' : 'text-indigo-800';
  const linkColor = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
  const linkHoverColor = theme === 'dark' ? 'hover:text-blue-300' : 'hover:text-blue-800';
  const strongColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const bgColor = theme === 'dark' ? 'bg-gray-700' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const blockquoteBgColor = theme === 'dark' ? 'bg-amber-900 bg-opacity-20' : 'bg-amber-50';
  const blockquoteBorderColor = theme === 'dark' ? 'border-amber-400' : 'border-amber-500';
  const blockquoteTextColor = theme === 'dark' ? 'text-amber-100' : 'text-amber-900';
  
  const components: MDXComponents = {
    h1: (props: HeadingProps) => <h1 className={`text-2xl sm:text-3xl font-bold ${headingColor} border-b-2 ${theme === 'dark' ? 'border-indigo-700' : 'border-indigo-800'} pb-2 mb-6 break-words tracking-tight`} {...props} />,
    h2: (props: HeadingProps) => <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${subHeadingColor} mt-8 break-words tracking-tight`} {...props} />,
    h3: (props: HeadingProps) => <h3 className={`text-lg sm:text-xl font-bold mt-6 mb-3 ${subHeadingColor} break-words tracking-tight`} {...props} />,
    p: (props: ParagraphProps) => <p className={`mb-5 ${textColor} leading-7 sm:leading-8 break-words text-base tracking-wide`} {...props} />,
    ul: (props: ListProps) => <ul className={`list-disc pl-6 space-y-2 my-4 ${textColor}`} {...props} />,
    ol: (props: ListProps) => <ol className={`list-decimal pl-6 space-y-2 my-4 ${textColor}`} {...props} />,
    li: (props: ListItemProps) => <li className={`${textColor} leading-7 sm:leading-8 break-words text-base mb-1`} {...props} />,
    blockquote: (props: BlockquoteProps) => (
      <div className={`important-box ${blockquoteBgColor} border-l-4 ${blockquoteBorderColor} p-4 my-6 ${blockquoteTextColor} rounded-r-lg shadow-sm break-words`} {...props} />
    ),
    table: (props: TableProps) => <table className="w-full border-collapse my-6 shadow-sm" {...props} />,
    th: (props: TableCellProps) => <th className={`border ${borderColor} p-3 text-left ${theme === 'dark' ? 'bg-indigo-900 text-white' : 'bg-indigo-800 text-white'} break-words`} {...props} />,
    td: (props: TableCellProps) => <td className={`border ${borderColor} p-3 break-words ${textColor}`} {...props} />,
    tr: (props: TableRowProps) => <tr className={`${theme === 'dark' ? 'bg-gray-800 even:bg-gray-750' : 'bg-white even:bg-gray-50'}`} {...props} />,
    a: (props: AnchorProps) => <a className={`${linkColor} ${linkHoverColor} break-all underline`} {...props} />,
    strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className={`font-bold ${strongColor}`} {...props} />,
    em: (props: React.HTMLAttributes<HTMLElement>) => <em className={`italic ${textColor}`} {...props} />,
    
    // カスタムコンポーネント
    Image: MDXComponents.ImageComponent,
    Callout: MDXComponents.CalloutBox,
    CalloutBox: MDXComponents.CalloutBox,
    Code: MDXComponents.CodeBlock,
    Quiz: MDXComponents.QuizComponent,
    Diagram: MDXComponents.DiagramComponent,
    Highlight: MDXComponents.Highlight,

    // HTMLのimg要素をオーバーライドする代わりに、標準のimg要素を使用
    // img: MDXComponents.ImageComponent, // 型エラーが発生するため削除
  };

  // フロントマターのキーワード
  const frontmatterKeywords = ['title:', 'slug:', 'category:', 'order:'];

  // テキストノードまたは要素のテキスト内容を取得するヘルパー関数
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string') {
      return node;
    } 
    if (React.isValidElement<{ children?: React.ReactNode }>(node) && node.props.children) {
      if (typeof node.props.children === 'string') {
        return node.props.children;
      } 
      if (Array.isArray(node.props.children)) {
        // 配列内の最初の文字列を見つける
        const firstString = node.props.children.find((child: React.ReactNode) => typeof child === 'string');
        return typeof firstString === 'string' ? firstString : '';
      }
    }
    return '';
  };

  const childrenArray = React.Children.toArray(children);
  
  // 最初の数要素（例：5要素）をチェックしてフロントマターらしきものをフィルタリング
  const filteredChildren = childrenArray.filter((child, index) => {
    // 最初の5要素のみをチェック対象とする
    if (index < 5) { 
      const text = getTextContent(child);
      // テキストが存在し、かつキーワードのいずれかを含む場合はフィルタリング
      if (text && frontmatterKeywords.some(keyword => text.trim().startsWith(keyword))) {
        return false; // フィルタリング
      }
    }
    // 最初の5要素以外、またはフロントマターでないと判断された要素は表示
    return true;
  });

  return (
    <MDXProvider components={components}>
      <div className={`prose max-w-none ${bgColor} p-2 sm:p-4 md:p-6 rounded-lg shadow-md transition-all duration-300 break-words overflow-hidden text-base leading-7 sm:leading-8 ${theme === 'dark' ? 'prose-invert' : ''}`}>
        <div className="max-w-3xl mx-auto">
          {filteredChildren}
        </div>
      </div>
    </MDXProvider>
  );
};

interface MDXContentProps {
  children: React.ReactNode;
}

const MDXContent: React.FC<MDXContentProps> = ({ children }) => {
  return <MDXContentWithTheme>{children}</MDXContentWithTheme>;
};

export default MDXContent; 