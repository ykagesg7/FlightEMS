import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import supabase from '../../utils/supabase';

interface RelatedTestButtonProps {
  contentId: string;
  contentTitle: string;
}

interface TestMapping {
  id: string;
  learning_content_id: string;
  test_question_ids: string[];
  difficulty_level: number;
  topic_category: string;
}

const RelatedTestButton: React.FC<RelatedTestButtonProps> = ({ 
  contentId, 
  contentTitle 
}) => {
  const { theme } = useTheme();
  const [testMapping, setTestMapping] = useState<TestMapping | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestMapping = async () => {
      try {
        const { data, error } = await supabase
          .from('learning_test_mapping')
          .select('*')
          .eq('learning_content_id', contentId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error fetching test mapping:', error);
        } else if (data) {
          setTestMapping(data);
        }
      } catch (error) {
        console.error('Error fetching test mapping:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestMapping();
  }, [contentId]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!testMapping || !testMapping.test_question_ids?.length) {
    return null; // 関連テストがない場合は何も表示しない
  }

  const questionCount = testMapping.test_question_ids.length;
  const difficultyLabel = ['', '初級', '中級', '上級', '難問', '超難問'][testMapping.difficulty_level] || '中級';

  return (
    <div className={`mt-8 p-6 rounded-lg border-l-4 ${
      theme === 'dark' 
        ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-400 text-gray-100' 
        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500 text-gray-800'
    }`}>
      <div className="flex items-center mb-4">
        <div className="mr-3">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold">関連テストで理解度をチェック！</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            この記事の内容に関連した問題で習熟度を確認しましょう
          </p>
        </div>
      </div>
      
      <div className={`mb-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            問題数: {questionCount}問
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
            難易度: {difficultyLabel}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
            </svg>
            科目: {testMapping.topic_category}
          </span>
        </div>
      </div>
      
      <Link
        to={`/test?content=${contentId}&questions=${testMapping.test_question_ids.join(',')}&title=${encodeURIComponent(contentTitle)}`}
        className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white transition-all duration-200 transform hover:scale-105 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
        }`}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        関連テストを受ける
      </Link>
    </div>
  );
};

export default RelatedTestButton; 