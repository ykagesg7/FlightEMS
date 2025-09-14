import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import supabase from '../../utils/supabase';

interface EnhancedRelatedTestButtonProps {
  contentId: string;
  contentTitle: string;
  onTestStart?: () => void;
}

interface TestMapping {
  id: string;
  learning_content_id: string;
  content_title: string;
  topic_category: string;
  subject_area: string;
  relationship_type: string;
  weight_score: number;
  difficulty_level: number;
  estimated_study_time: number;
  unified_cpl_question_ids: string[];
  verification_status: string;
  confidence_score: number;
}

interface RelatedQuestion {
  question_id: string;
  main_subject: string;
  sub_subject: string;
  question_text: string;
  difficulty_level: number;
  relationship_type: string;
}

const EnhancedRelatedTestButton: React.FC<EnhancedRelatedTestButtonProps> = ({ 
  contentId, 
  contentTitle,
  onTestStart
}) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [testMapping, setTestMapping] = useState<TestMapping | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<RelatedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestMappingAndQuestions = async () => {
      try {
        // 1. 学習記事のマッピング情報を取得
        const { data: mappingData, error: mappingError } = await supabase
          .from('learning_test_mapping')
          .select('*')
          .eq('learning_content_id', contentId)
          .eq('verification_status', 'verified')
          .order('weight_score', { ascending: false })
          .limit(1)
          .single();

        if (mappingError) {
          if (mappingError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching test mapping:', mappingError);
            setError('マッピング情報の取得に失敗しました');
          }
          return;
        }

        if (mappingData) {
          setTestMapping(mappingData);

          // 2. 関連するCPL問題を取得
          const { data: questionsData, error: questionsError } = await supabase
            .rpc('get_related_cpl_questions', {
              content_id: contentId,
              question_limit: 15
            });

          if (questionsError) {
            console.error('Error fetching related questions:', questionsError);
            setError('関連問題の取得に失敗しました');
          } else if (questionsData) {
            setRelatedQuestions(questionsData);
          }
        }
      } catch (error) {
        console.error('Error in fetchTestMappingAndQuestions:', error);
        setError('データの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchTestMappingAndQuestions();
  }, [contentId]);

  const handleTestStart = async () => {
    if (onTestStart) {
      onTestStart();
    }

    // 学習セッションを記録
    if (user && testMapping) {
      try {
        await supabase
          .from('learning_sessions')
          .insert({
            user_id: user.id,
            session_type: 'testing',
            content_id: contentId,
            content_type: 'test',
            session_metadata: {
              test_mapping_id: testMapping.id,
              question_count: relatedQuestions.length,
              difficulty_level: testMapping.difficulty_level,
              estimated_time: testMapping.estimated_study_time
            }
          });
      } catch (error) {
        console.error('Error recording test session:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`mt-6 p-4 rounded-lg border-l-4 border-red-400 ${
        theme === 'dark' ? 'bg-red-900/20 text-red-200' : 'bg-red-50 text-red-800'
      }`}>
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!testMapping || relatedQuestions.length === 0) {
    return null; // 関連テストがない場合は何も表示しない
  }

  const difficultyLabel = ['', '初級', '中級', '上級', '難問', '超難問'][testMapping.difficulty_level] || '中級';
  const relationshipLabel = {
    'direct': '直接関連',
    'related': '関連',
    'prerequisite': '前提知識',
    'practice': '練習問題',
    'review': '復習問題'
  }[testMapping.relationship_type] || '関連';

  const questionsBySubject = relatedQuestions.reduce((acc, q) => {
    const subject = q.main_subject;
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(q);
    return acc;
  }, {} as Record<string, RelatedQuestion[]>);

  return (
    <div className={`mt-8 p-6 rounded-lg border-l-4 shadow-lg ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-400 text-gray-100' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 text-gray-800'
    }`}>
      {/* ヘッダー */}
      <div className="flex items-center mb-6">
        <div className="mr-4">
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">📝 関連テストで理解度をチェック！</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            この記事の内容に関連したCPL過去問で習熟度を確認しましょう
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
        }`}>
          信頼度 {Math.round(testMapping.confidence_score * 100)}%
        </div>
      </div>
      
      {/* 統計情報 */}
      <div className={`mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/80'
      }`}>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{relatedQuestions.length}</div>
          <div className="text-xs opacity-75">問題数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-500">{difficultyLabel}</div>
          <div className="text-xs opacity-75">難易度</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-500">{testMapping.estimated_study_time}分</div>
          <div className="text-xs opacity-75">推定時間</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">{relationshipLabel}</div>
          <div className="text-xs opacity-75">関連度</div>
        </div>
      </div>

      {/* 科目別問題数表示 */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-3 opacity-75">出題科目の内訳：</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(questionsBySubject).map(([subject, questions]) => (
            <span 
              key={subject}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                theme === 'dark' 
                  ? 'bg-blue-900/40 text-blue-200 border border-blue-700/50' 
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {subject} ({questions.length}問)
            </span>
          ))}
        </div>
      </div>

      {/* テスト開始ボタン */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to={`/test/cpl?content=${contentId}&mapping=${testMapping.id}&title=${encodeURIComponent(contentTitle)}`}
          onClick={handleTestStart}
          className={`flex-1 inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-lg shadow-lg text-white transition-all duration-200 transform hover:scale-105 hover:shadow-xl ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700'
              : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600'
          }`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          CPLテストを開始する
        </Link>

        {/* プレビューボタン */}
        <button
          onClick={() => {
            // モーダルで問題プレビューを表示する機能（今後実装）
            console.log('Preview questions:', relatedQuestions.slice(0, 3));
          }}
          className={`px-4 py-4 border-2 border-dashed rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
            theme === 'dark'
              ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
              : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
          }`}
        >
          <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <div className="text-xs">プレビュー</div>
        </button>
      </div>

      {/* 学習効果に関する情報 */}
      <div className={`mt-4 p-3 rounded-lg text-sm ${
        theme === 'dark' 
          ? 'bg-indigo-900/20 text-indigo-200 border border-indigo-800/30' 
          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
      }`}>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">学習効果を最大化するために：</span>
        </div>
        <ul className="mt-2 ml-6 space-y-1 text-xs opacity-90">
          <li>• 記事内容を思い出しながら問題に取り組みましょう</li>
          <li>• 間違えた問題は解説を読んで理解を深めましょう</li>
          <li>• 70%以上の正答率を目指しましょう</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedRelatedTestButton; 