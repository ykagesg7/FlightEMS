import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import LearningTabMDX from '../components/mdx/LearningTabMDX';

function NewLearningPage() {
  const { theme } = useTheme();
  const { contentId } = useParams<{ contentId?: string }>();
  const navigate = useNavigate();

  // 記事一覧に戻る関数
  const handleBackToList = () => {
    navigate('/learning');
  };

  // 記事を選択する関数
  const handleContentSelect = (selectedContentId: string) => {
    navigate(`/learning/${selectedContentId}`);
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-4">
            📚 Learning Center
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
            CPL試験対策記事で知識を深めよう
          </p>
        </div>
        
        <LearningTabMDX 
          contentId={contentId || ""} 
          onBackToList={handleBackToList} 
          onContentSelect={handleContentSelect} 
          contentType="learning"
        />
      </div>
    </div>
  );
}

export default NewLearningPage; 