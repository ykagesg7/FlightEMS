import React, { useState } from 'react';
import MDXLoader from './MDXLoader';

// 利用可能なMDXファイルのリスト
const availableMDXFiles = [
  { id: '1.1-instrument-flight', label: '計器飛行の基本' },
  { id: '2計器離陸', label: '計器離陸' },
  { id: '3基本的な計器飛行操作', label: '基本的な計器飛行操作' },
  { id: '4基本計器飛行', label: '基本計器飛行' },
];

const MDXTester: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('');

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">MDX Tester</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          MDXファイルを選択:
        </label>
        <select
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        >
          <option value="">ファイルを選択</option>
          {availableMDXFiles.map((file) => (
            <option key={file.id} value={file.id}>
              {file.label} ({file.id}.mdx)
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">プレビュー</h2>
        <div className="border border-gray-200 rounded-lg p-4 min-h-[200px]">
          <MDXLoader filePath={selectedFile} showPath={true} />
        </div>
      </div>
    </div>
  );
};

export default MDXTester; 