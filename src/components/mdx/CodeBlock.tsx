import React, { useState } from 'react';

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

/**
 * MDX内で使用できるコードブロックコンポーネント
 * - コードのコピー機能
 * - タイトル表示機能
 * - 行番号表示機能（オプション）
 * 注: 完全なシンタックスハイライトはライブラリ（prism-react-renderer等）の
 * 追加実装が必要です。ここでは基本的なスタイリングのみ行います。
 */
const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  language = 'text',
  title,
  showLineNumbers = false,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // コードの行を分割
  const codeLines = children.trim().split('\n');

  return (
    <div className="my-6">
      {title && (
        <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-mono rounded-t-md flex justify-between items-center">
          <span>{title}</span>
          <span className="text-gray-400">{language}</span>
        </div>
      )}
      <div className={`relative bg-gray-900 overflow-auto rounded-md ${title ? 'rounded-t-none' : ''}`}>
        <button
          onClick={copyToClipboard}
          className="absolute right-2 top-2 p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs"
        >
          {copied ? (
            <span>コピーしました!</span>
          ) : (
            <span>コピー</span>
          )}
        </button>
        <pre className="p-4 pt-10 text-gray-300 overflow-x-auto">
          <code>
            {showLineNumbers ? (
              <table className="border-collapse w-full">
                <tbody>
                  {codeLines.map((line, i) => (
                    <tr key={i} className="leading-normal">
                      <td className="text-right pr-4 text-gray-500 select-none w-10 text-xs">
                        {i + 1}
                      </td>
                      <td className="font-mono whitespace-pre-wrap break-words">
                        {line || ' '}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="font-mono whitespace-pre-wrap break-words">{children}</div>
            )}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock; 