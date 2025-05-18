import React from 'react';
import { useLearningProgress } from '../../hooks/useLearningProgress';

interface LearningContent {
  id: string;
  title: string;
  category: string;
  description: string | null;
  order_index: number;
}

interface LearningMenuSidebarProps {
  contents: LearningContent[];
  selectedId: string | null;
  onSelectItem: (id: string) => void;
}

const LearningMenuSidebar: React.FC<LearningMenuSidebarProps> = ({
  contents,
  selectedId,
  onSelectItem
}) => {
  const { getProgress, isCompleted } = useLearningProgress();
  
  // カテゴリーでグループ化
  const groupedContents: Record<string, LearningContent[]> = {};
  contents.forEach(content => {
    if (!groupedContents[content.category]) {
      groupedContents[content.category] = [];
    }
    groupedContents[content.category].push(content);
  });
  
  // カテゴリーの順序を保持
  const categories = Object.keys(groupedContents).sort();
  
  return (
    <div className="learning-menu">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">学習コンテンツ</h2>
      
      {categories.map(category => (
        <div key={category} className="mb-4">
          <h3 className="text-md font-medium mb-2 text-gray-700 border-b pb-1">{category}</h3>
          <ul className="space-y-1">
            {groupedContents[category]
              .sort((a, b) => a.order_index - b.order_index)
              .map(content => {
                const progress = getProgress(content.id);
                const completed = isCompleted(content.id);
                
                return (
                  <li 
                    key={content.id}
                    className={`
                      py-2 px-3 rounded cursor-pointer text-sm
                      ${selectedId === content.id
                        ? 'bg-indigo-500 text-white'
                        : 'hover:bg-gray-100 text-gray-800'}
                    `}
                    onClick={() => onSelectItem(content.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span>{content.title}</span>
                      {progress > 0 && (
                        <span className={`
                          text-xs px-1.5 py-0.5 rounded-full ml-2 
                          ${completed 
                            ? 'bg-green-600 text-white' 
                            : 'bg-blue-600 text-white'}
                        `}>
                          {completed ? '完了' : `${progress}%`}
                        </span>
                      )}
                    </div>
                    
                    {/* 進捗バー */}
                    {progress > 0 && (
                      <div className="w-full bg-gray-300 rounded-full h-1 mt-2">
                        <div 
                          className={`${completed ? 'bg-green-500' : 'bg-blue-500'} h-1 rounded-full`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    )}
                  </li>
                );
              })
            }
          </ul>
        </div>
      ))}
      
      {categories.length === 0 && (
        <p className="text-gray-500 text-center p-4">カテゴリーがありません</p>
      )}
    </div>
  );
};

export default LearningMenuSidebar; 