import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import supabase from '../../utils/supabase';

interface EnhancedReviewContentLinkProps {
  subjectCategories: string[];
  overallAccuracy: number;
  subjectAccuracies: Record<string, number>;
  testSessionId?: string;
  incorrectQuestionIds?: string[];
}

interface RecommendedContent {
  content_id: string;
  content_title: string;
  content_category: string;
  priority_score: number;
  accuracy_rate: number;
  recommended_reason: string;
  difficulty_level: number;
  estimated_study_time: number;
  relationship_type: string;
}

interface WeakArea {
  subject_category: string;
  sub_category: string;
  accuracy_rate: number;
  attempt_count: number;
  improvement_trend: string;
  priority_level: number;
}

const EnhancedReviewContentLink: React.FC<EnhancedReviewContentLinkProps> = ({
  subjectCategories,
  overallAccuracy,
  subjectAccuracies,
  testSessionId,
  incorrectQuestionIds = []
}) => {
  const { user } = useAuthStore();
  const [recommendedContents, setRecommendedContents] = useState<RecommendedContent[]>([]);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendationsAndWeakAreas = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1. 弱点領域の更新と取得
        for (const [subject, accuracy] of Object.entries(subjectAccuracies)) {
          await supabase.rpc('update_user_weak_areas', {
            p_user_id: user.id,
            p_subject_category: subject,
            p_accuracy_rate: accuracy
          });
        }

        // 2. 推奨記事の取得
        const { data: recommendedData, error: recommendedError } = await supabase
          .rpc('get_recommended_articles_for_weak_areas', {
            p_user_id: user.id,
            recommendation_limit: 8
          });

        if (recommendedError) {
          console.error('Error fetching recommendations:', recommendedError);
        } else if (recommendedData) {
          setRecommendedContents(recommendedData);
        }

        // 3. 弱点領域の詳細取得
        const { data: weakAreasData, error: weakAreasError } = await supabase
          .from('user_weak_areas')
          .select('*')
          .eq('user_id', user.id)
          .order('priority_level', { ascending: false })
          .limit(5);

        if (weakAreasError) {
          console.error('Error fetching weak areas:', weakAreasError);
        } else if (weakAreasData) {
          setWeakAreas(weakAreasData);
        }

        // 4. 学習推奨の動的生成
        if (overallAccuracy < 70) {
          const highPriorityRecommendations = recommendedData?.slice(0, 3) || [];

          for (const content of highPriorityRecommendations) {
            await supabase
              .from('learning_recommendations')
              .upsert({
                user_id: user.id,
                recommended_content_id: content.content_id,
                content_type: 'article',
                recommendation_reason: `テスト正答率${overallAccuracy}%のため復習推奨`,
                priority_score: Math.max(8.0, (100 - overallAccuracy) / 10),
                estimated_impact: Math.min(90, overallAccuracy + 30),
                estimated_time: content.estimated_study_time,
                difficulty_match: content.difficulty_level / 5.0,
                algorithm_version: 'v1.1'
              }, {
                onConflict: 'user_id,recommended_content_id'
              });
          }
        }

      } catch (error) {
        console.error('Error in fetchRecommendationsAndWeakAreas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendationsAndWeakAreas();
  }, [user, subjectAccuracies, overallAccuracy]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!recommendedContents.length && !weakAreas.length) {
    return null;
  }

  const needsReview = overallAccuracy < 70;
  const needsIntensiveReview = overallAccuracy < 50;

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-500';
    if (accuracy >= 70) return 'text-blue-500';
    if (accuracy >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPerformanceLabel = (accuracy: number) => {
    if (accuracy >= 80) return '優秀';
    if (accuracy >= 70) return '合格水準';
    if (accuracy >= 50) return '要改善';
    return '要復習';
  };

  const bgColor = needsIntensiveReview
    ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-500'
    : needsReview
    ? 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-500'
    : 'bg-gradient-to-br from-green-50 to-blue-50 border-green-500';

  return (
    <div className={`mt-8 p-6 rounded-lg border-l-4 shadow-lg ${bgColor} text-gray-800`}>
      {/* ヘッダー */}
      <div className="flex items-center mb-6">
        <div className="mr-4">
          <svg className={`w-10 h-10 ${needsReview ? 'text-orange-500' : 'text-green-500'}`}
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={needsReview
                ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                : "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              } />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">
            {needsIntensiveReview ? '🚨 集中復習推奨' : needsReview ? '📚 復習推奨記事' : '📖 さらなる学習記事'}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            全体正答率{overallAccuracy}% - {getPerformanceLabel(overallAccuracy)}
            {needsReview && '：理解を深めるために復習をおすすめします'}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getPerformanceColor(overallAccuracy)}`}>
          {getPerformanceLabel(overallAccuracy)}
        </div>
      </div>

      {/* 科目別成績表示 */}
      {Object.keys(subjectAccuracies).length > 1 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3 opacity-75">科目別成績：</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(subjectAccuracies).map(([subject, accuracy]) => (
              <div
                key={subject}
                className={`p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/80'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{subject}</span>
                  <span className={`text-lg font-bold ${getPerformanceColor(accuracy)}`}>
                    {accuracy}%
                  </span>
                </div>
                <div className={`w-full bg-gray-300 rounded-full h-2 mt-2 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      accuracy >= 70 ? 'bg-green-500' : accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, accuracy)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 弱点領域分析 */}
      {weakAreas.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3 opacity-75">弱点領域分析：</h4>
          <div className="space-y-2">
            {weakAreas.slice(0, 3).map((area, index) => (
              <div
                key={`${area.subject_category}-${area.sub_category}`}
                className={`p-3 rounded-lg border-l-2 ${
                  area.improvement_trend === 'improving'
                    ? 'border-green-400 bg-green-900/10'
                    : area.improvement_trend === 'declining'
                    ? 'border-red-400 bg-red-900/10'
                    : 'border-yellow-400 bg-yellow-900/10'
                } ${theme === 'dark' ? 'bg-opacity-20' : 'bg-opacity-80'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-medium">
                      {area.sub_category || area.subject_category}
                    </span>
                    <div className="text-xs opacity-75 mt-1">
                      {area.attempt_count}回挑戦 •
                      {area.improvement_trend === 'improving' ? '改善傾向' :
                       area.improvement_trend === 'declining' ? '悪化傾向' : '横ばい'}
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${getPerformanceColor(area.accuracy_rate)}`}>
                    {area.accuracy_rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 推奨記事一覧 */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold opacity-75">
          {needsReview ? '復習推奨記事' : '関連学習記事'}：
        </h4>
        {recommendedContents.slice(0, 4).map((content, index) => (
          <Link
            key={content.content_id}
            to={`/learning/${content.content_id}`}
            className={`block p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
              theme === 'dark'
                ? 'bg-gray-800/60 border-gray-600 hover:border-gray-500'
                : 'bg-white/90 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className={`inline-block w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mr-3 ${
                    index === 0 ? 'bg-red-500 text-white' :
                    index === 1 ? 'bg-orange-500 text-white' :
                    index === 2 ? 'bg-yellow-500 text-black' :
                    'bg-gray-500 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <h4 className="font-medium text-base">{content.content_title}</h4>
                </div>

                <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {content.recommended_reason}
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    theme === 'dark'
                      ? 'bg-blue-900/30 text-blue-300'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {content.content_category}
                  </span>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    theme === 'dark'
                      ? 'bg-purple-900/30 text-purple-300'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    推定{content.estimated_study_time}分
                  </span>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    content.priority_score > 7
                      ? theme === 'dark'
                        ? 'bg-red-900/30 text-red-300'
                        : 'bg-red-100 text-red-800'
                      : theme === 'dark'
                        ? 'bg-yellow-900/30 text-yellow-300'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    優先度 {content.priority_score.toFixed(1)}
                  </span>
                </div>
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

      {/* アクションプラン */}
      {needsReview && (
        <div className={`mt-6 p-4 rounded-lg ${
          theme === 'dark'
            ? 'bg-indigo-900/20 text-indigo-200 border border-indigo-800/30'
            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
        }`}>
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">おすすめ学習プラン：</span>
          </div>
          <ol className="text-sm space-y-2 ml-7">
            <li>1. 上記の優先度1-2の記事を重点的に復習</li>
            <li>2. 理解が深まったら再度テストに挑戦</li>
            <li>3. 70%以上の正答率を目指して継続学習</li>
            {needsIntensiveReview && (
              <li className="text-red-400 font-medium">
                ⚠️ 50%未満のため、基礎から体系的な復習を強く推奨
              </li>
            )}
          </ol>
        </div>
      )}
    </div>
  );
};

export default EnhancedReviewContentLink;
