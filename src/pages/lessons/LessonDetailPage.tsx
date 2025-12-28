import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LearningTabMDX from '../../components/mdx/LearningTabMDX';

const LessonDetailPage: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();

  if (!contentId) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">コンテンツIDが指定されていません。</p>
        <button onClick={() => navigate('/articles')} className="underline">記事一覧へ戻る</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white">
      <div className="container mx-auto px-4 py-6">
        <LearningTabMDX
          contentId={contentId}
          contentType="learning"
          onBackToList={() => navigate('/articles')}
        />
      </div>
    </div>
  );
};

export default LessonDetailPage;


