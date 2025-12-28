import { BookOpen, Plane, Target } from 'lucide-react';
import React from 'react';

type TabType = 'missions' | 'blog' | 'experience' | 'tools';

interface MissionTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const MissionTabs: React.FC<MissionTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center mb-8 border-b border-whiskyPapa-yellow/20">
      <button
        onClick={() => onTabChange('missions')}
        className={`px-6 py-3 font-medium transition-colors ${
          activeTab === 'missions'
            ? 'text-whiskyPapa-yellow border-b-2 border-whiskyPapa-yellow'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Target className="w-5 h-5 inline-block mr-2" />
        ミッション
      </button>
      <button
        onClick={() => onTabChange('blog')}
        className={`px-6 py-3 font-medium transition-colors ${
          activeTab === 'blog'
            ? 'text-whiskyPapa-yellow border-b-2 border-whiskyPapa-yellow'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <BookOpen className="w-5 h-5 inline-block mr-2" />
        ブログ
      </button>
      <button
        onClick={() => onTabChange('experience')}
        className={`px-6 py-3 font-medium transition-colors ${
          activeTab === 'experience'
            ? 'text-whiskyPapa-yellow border-b-2 border-whiskyPapa-yellow'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Plane className="w-5 h-5 inline-block mr-2" />
        体験搭乗
      </button>
      <button
        onClick={() => onTabChange('tools')}
        className={`px-6 py-3 font-medium transition-colors ${
          activeTab === 'tools'
            ? 'text-whiskyPapa-yellow border-b-2 border-whiskyPapa-yellow'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Target className="w-5 h-5 inline-block mr-2" />
        ツール
      </button>
    </div>
  );
};

