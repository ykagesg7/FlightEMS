import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import supabase from '../../utils/supabase';

interface ReviewContentLinkProps {
  subjectCategory: string;
  accuracy: number; // 正答率 (0-100)
  questionIds?: string[]; // 問題IDリスト
}

interface LearningContent {
  id: string;
  title: string;
  category: string;
  description: string;
}

const ReviewContentLink: React.FC<ReviewContentLinkProps> = ({ 
  subjectCategory, 
  accuracy,
  questionIds = []
}) => {
  const { theme } = useTheme();
  const [recommendedContents, setRecommendedContents] = useState<LearningContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedContents = async () => {
      try {
        // 1. 問題IDからマッピングを検索
        let query = supabase
          .from('learning_test_mapping')
          .select(`
            learning_content_id,
            topic_category,
            difficulty_level
          `);

        if (questionIds.length > 0) {
          // 特定の問題IDに関連する記事を検索
          query = query.overlaps('test_question_ids', questionIds);
        } else {
          // 科目カテゴリに基づく推奨記事を検索
          query = query.eq('topic_category', subjectCategory);
        }

        const { data: mappings, error: mappingError } = await query.limit(5);
        
        if (mappingError) {
          console.error('Error fetching mappings:', mappingError);
          return;
        }

        if (!mappings || mappings.length === 0) {
          // マッピングがない場合は、科目カテゴリで直接learning_contentsを検索
          const { data: contents, error: contentError } = await supabase
            .from('learning_contents')
            .select('id, title, category, description')
            .eq('category', subjectCategory)
            .eq('is_published', true)
            .limit(3);

          if (contentError) {
            console.error('Error fetching contents:', contentError);
          } else if (contents) {
            setRecommendedContents(contents);
          }
          return;
        }

        // 2. マッピングから学習記事の詳細を取得
        const contentIds = mappings.map(m => m.learning_content_id);
        const { data: contents, error: contentError } = await supabase
          .from('learning_contents')
          .select('id, title, category, description')
          .in('id', contentIds)
          .eq('is_published', true);

        if (contentError) {
          console.error('Error fetching contents:', contentError);
        } else if (contents) {
          setRecommendedContents(contents);
        }
      } catch (error) {
        console.error('Error fetching recommended contents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedContents();
  }, [subjectCategory, questionIds]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!recommendedContents.length) {
    return null;
  }

  const needsReview = accuracy < 70; // 70%未満の場合は復習推奨
  const bgColor = needsReview 
    ? theme === 'dark' 
      ? 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-400'
      : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-500'
    : theme === 'dark'
      ? 'bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-400'
      : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-500';

  return (
    <div className={`mt-6 p-6 rounded-lg border-l-4 ${bgColor} ${
      theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
    }`}>
      <div className="flex items-center mb-4">
        <div className="mr-3">
          <svg className={`w-8 h-8 ${needsReview ? 'text-orange-500' : 'text-green-500'}`} 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d={needsReview 
                ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                : "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              } />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {needsReview ? '復習推奨記事' : '関連学習記事'}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {needsReview 
              ? `正答率${accuracy}%：理解を深めるために復習をおすすめします`
              : `正答率${accuracy}%：さらなる理解向上のための関連記事です`
            }
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendedContents.map((content) => (
          <Link
            key={content.id}
            to={`/learning/${content.id}`}
            className={`block p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                : 'bg-white/80 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-base mb-1">{content.title}</h4>
                {content.description && (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {content.description}
                  </p>
                )}
                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                  theme === 'dark'
                    ? 'bg-blue-900/30 text-blue-300'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {content.category}
                </span>
              </div>
              <div className="ml-4 flex-shrink-0">
                <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {needsReview && (
        <div className={`mt-4 p-3 rounded-lg ${
          theme === 'dark' 
            ? 'bg-orange-900/20 text-orange-200' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            復習後、再度テストに挑戦して理解度を確認しましょう！
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewContentLink; 