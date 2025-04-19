import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import * as MDXComponents from './mdx';

// MDXでカスタマイズできるコンポーネント
const components = {
  h1: (props: any) => <h1 className="text-3xl font-bold text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6" {...props} />,
  h2: (props: any) => <h2 className="text-2xl font-bold mb-4 text-indigo-800 mt-8" {...props} />,
  h3: (props: any) => <h3 className="text-xl font-bold mt-6 mb-3 text-indigo-800" {...props} />,
  p: (props: any) => <p className="mb-4 text-gray-800 leading-relaxed" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-6 space-y-2 my-4 text-gray-800" {...props} />,
  ol: (props: any) => <ol className="list-decimal pl-6 space-y-2 my-4 text-gray-800" {...props} />,
  li: (props: any) => <li className="text-gray-800 leading-relaxed" {...props} />,
  blockquote: (props: any) => (
    <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-900 rounded-r-lg shadow-sm" {...props} />
  ),
  table: (props: any) => <table className="w-full border-collapse my-6 shadow-sm" {...props} />,
  th: (props: any) => <th className="border border-gray-300 p-3 text-left bg-indigo-800 text-white" {...props} />,
  td: (props: any) => <td className="border border-gray-300 p-3" {...props} />,
  tr: (props: any) => <tr className="bg-white even:bg-gray-50" {...props} />,
  
  // カスタムコンポーネント
  Image: MDXComponents.ImageComponent,
  Callout: MDXComponents.CalloutBox,
  CalloutBox: MDXComponents.CalloutBox,
  Code: MDXComponents.CodeBlock,
  Quiz: MDXComponents.QuizComponent,
  Diagram: MDXComponents.DiagramComponent,

  // HTMLのimg要素をオーバーライドする代わりに、標準のimg要素を使用
  // img: MDXComponents.ImageComponent, // 型エラーが発生するため削除
};

interface MDXContentProps {
  children: React.ReactNode;
}

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

const MDXContent: React.FC<MDXContentProps> = ({ children }) => {
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
      <div className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow-md transition-all duration-300">
        {filteredChildren}
      </div>
    </MDXProvider>
  );
};

export default MDXContent; 