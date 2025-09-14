import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import supabase from '../../utils/supabase';

interface LearningProgress {
  learning_content_id: string;
  content_title: string;
  topic_category: string;
  subject_area: string;
  is_content_completed: boolean;
  last_read_position: number;
  last_read_date: string;
  subject_accuracy_rate: number;
  learning_status: 'mastered' | 'needs_practice' | 'in_progress' | 'not_started';
  estimated_study_time: number;
  difficulty_level: number;
}

interface StudyRecommendation {
  content_id: string;
  content_title: string;
  content_category: string;
  recommendation_reason: string;
  priority_score: number;
  estimated_impact: number;
  estimated_time: number;
  difficulty_match: number;
}

interface WeakArea {
  subject_category: string;
  sub_category: string;
  accuracy_rate: number;
  attempt_count: number;
  improvement_trend: 'improving' | 'declining' | 'stable';
  priority_level: number;
}

interface DashboardStats {
  total_articles_completed: number;
  total_tests_taken: number;
  overall_accuracy: number;
  study_time_this_week: number;
  learning_streak: number;
  mastered_subjects: number;
}

const LearningTestIntegrationDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuthStore();

  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [studyRecommendations, setStudyRecommendations] = useState<StudyRecommendation[]>([]);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1. 学習進捗統合データを取得
        const { data: progressData, error: progressError } = await supabase
          .from('learning_progress_overview')
          .select('*')
          .eq('user_id', user.id)
          .order('last_read_date', { ascending: false });

        if (progressError) {
          console.error('Error fetching learning progress:', progressError);
        } else if (progressData) {
          setLearningProgress(progressData);
        }

        // 2. 学習推奨を取得
        const { data: recommendationsData, error: recommendationsError } = await supabase
          .from('learning_recommendations')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('priority_score', { ascending: false })
          .limit(6);

        if (recommendationsError) {
          console.error('Error fetching recommendations:', recommendationsError);
        } else if (recommendationsData) {
          setStudyRecommendations(recommendationsData);
        }

        // 3. 弱点領域を取得
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

        // 4. ダッシュボード統計を計算
        const timeFilter = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 365;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeFilter);

        // 統計データの取得と計算
        const [
          completedArticles,
          testsTaken,
          accuracyData,
          studyTime,
          learningStreak
        ] = await Promise.all([
          supabase
            .from('progress')
            .select('content_id')
            .eq('user_id', user.id)
            .eq('completed', true)
            .gte('completed_at', startDate.toISOString()),

          supabase
            .from('cpl_exam_sessions')
            .select('id, overall_accuracy')
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString()),

          supabase.rpc('calculate_user_overall_accuracy', { p_user_id: user.id }),

          supabase
            .from('learning_sessions')
            .select('session_duration')
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString()),

          supabase.rpc('calculate_learning_streak', { p_user_id: user.id })
        ]);

        const stats: DashboardStats = {
          total_articles_completed: completedArticles.data?.length || 0,
          total_tests_taken: testsTaken.data?.length || 0,
          overall_accuracy: accuracyData.data || 0,
          study_time_this_week: studyTime.data?.reduce((sum: number, session: { session_duration?: number }) =>
            sum + (session.session_duration || 0), 0) || 0,
          learning_streak: learningStreak.data || 0,
          mastered_subjects: progressData?.filter(p => p.learning_status === 'mastered').length || 0
        };

        setDashboardStats(stats);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, selectedTimeframe]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        <p>ダッシュボードを表示するにはログインが必要です。</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'text-green-500';
      case 'needs_practice': return 'text-yellow-500';
      case 'in_progress': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'mastered': return '習得済み';
      case 'needs_practice': return '要練習';
      case 'in_progress': return '学習中';
      default: return '未開始';
    }
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">📊 学習統合ダッシュボード</h1>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          学習進捗とテスト成績を統合して効率的な学習を支援します
        </p>

        {/* 期間選択 */}
        <div className="mt-4 flex space-x-2">
          {(['week', 'month', 'all'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {timeframe === 'week' ? '今週' : timeframe === 'month' ? '今月' : '全期間'}
            </button>
          ))}
        </div>
      </div>

      {/* 統計カード */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className={`p-4 rounded-lg shadow ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">📚</div>
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {dashboardStats.total_articles_completed}
                </div>
                <div className="text-xs opacity-75">完了記事</div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg shadow ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">📝</div>
              <div>
                <div className="text-2xl font-bold text-indigo-500">
                  {dashboardStats.total_tests_taken}
                </div>
                <div className="text-xs opacity-75">テスト受験</div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg shadow ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">🎯</div>
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {dashboardStats.overall_accuracy}%
                </div>
                <div className="text-xs opacity-75">総合正答率</div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg shadow ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">⏱️</div>
              <div>
                <div className="text-2xl font-bold text-purple-500">
                  {Math.round(dashboardStats.study_time_this_week / 60)}h
                </div>
                <div className="text-xs opacity-75">学習時間</div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg shadow ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">🔥</div>
              <div>
                <div className="text-2xl font-bold text-orange-500">
                  {dashboardStats.learning_streak}
                </div>
                <div className="text-xs opacity-75">連続学習日</div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg shadow ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">🏆</div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">
                  {dashboardStats.mastered_subjects}
                </div>
                <div className="text-xs opacity-75">習得分野</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 学習進捗 */}
        <div className={`p-6 rounded-lg shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="text-2xl mr-2">📈</span>
            学習進捗一覧
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {learningProgress.slice(0, 8).map((progress, index) => (
              <Link
                key={progress.learning_content_id}
                to={`/learning/${progress.learning_content_id}`}
                className={`block p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                  theme === 'dark'
                    ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-1">
                      {progress.content_title}
                    </h3>
                    <div className="flex items-center text-xs opacity-75 space-x-3">
                      <span>{progress.topic_category}</span>
                      <span className={getStatusColor(progress.learning_status)}>
                        {getStatusLabel(progress.learning_status)}
                      </span>
                      {progress.subject_accuracy_rate > 0 && (
                        <span>正答率: {progress.subject_accuracy_rate}%</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      progress.learning_status === 'mastered' ? 'bg-green-500' :
                      progress.learning_status === 'needs_practice' ? 'bg-yellow-500' :
                      progress.learning_status === 'in_progress' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}></div>
                    <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 学習推奨 */}
        <div className={`p-6 rounded-lg shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="text-2xl mr-2">🎯</span>
            今日の推奨学習
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {studyRecommendations.map((rec, index) => (
              <Link
                key={rec.content_id}
                to={`/learning/${rec.content_id}`}
                className={`block p-3 rounded-lg border-l-4 transition-all hover:scale-[1.02] ${
                  index === 0 ? 'border-red-400' :
                  index === 1 ? 'border-orange-400' :
                  index === 2 ? 'border-yellow-400' : 'border-blue-400'
                } ${
                  theme === 'dark'
                    ? 'bg-gray-700/30 hover:bg-gray-700/50'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className={`inline-block w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mr-2 ${
                        index === 0 ? 'bg-red-500 text-white' :
                        index === 1 ? 'bg-orange-500 text-white' :
                        index === 2 ? 'bg-yellow-500 text-black' :
                        'bg-blue-500 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <h3 className="font-medium text-sm">
                        {rec.content_title}
                      </h3>
                    </div>
                    <p className={`text-xs mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {rec.recommendation_reason}
                    </p>
                    <div className="flex items-center text-xs opacity-75 space-x-2">
                      <span>推定{rec.estimated_time}分</span>
                      <span>•</span>
                      <span>効果予測 {rec.estimated_impact}%</span>
                    </div>
                  </div>
                  <div className="ml-2 text-right">
                    <div className="text-sm font-bold text-blue-500">
                      {rec.priority_score.toFixed(1)}
                    </div>
                    <div className="text-xs opacity-75">優先度</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 弱点領域分析 */}
      {weakAreas.length > 0 && (
        <div className={`mt-8 p-6 rounded-lg shadow-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="text-2xl mr-2">🔍</span>
            弱点領域分析
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weakAreas.map((area, index) => (
              <div
                key={`${area.subject_category}-${area.sub_category}`}
                className={`p-4 rounded-lg border-l-4 ${
                  area.improvement_trend === 'improving'
                    ? 'border-green-400 bg-green-900/10'
                    : area.improvement_trend === 'declining'
                    ? 'border-red-400 bg-red-900/10'
                    : 'border-yellow-400 bg-yellow-900/10'
                } ${theme === 'dark' ? 'bg-opacity-20' : 'bg-opacity-80'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">
                    {area.sub_category || area.subject_category}
                  </h3>
                  <span className={`text-lg font-bold ${
                    area.accuracy_rate >= 70 ? 'text-green-500' :
                    area.accuracy_rate >= 50 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {area.accuracy_rate}%
                  </span>
                </div>

                <div className="text-xs opacity-75 space-y-1">
                  <div>{area.attempt_count}回挑戦</div>
                  <div className={`inline-block px-2 py-1 rounded-full ${
                    area.improvement_trend === 'improving' ? 'bg-green-500/20 text-green-400' :
                    area.improvement_trend === 'declining' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {area.improvement_trend === 'improving' ? '↗️ 改善傾向' :
                     area.improvement_trend === 'declining' ? '↘️ 悪化傾向' : '→ 横ばい'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* クイックアクション */}
      <div className={`mt-8 p-6 rounded-lg shadow-lg text-center ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50'
      }`}>
        <h2 className="text-xl font-bold mb-4">🚀 クイックアクション</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/test/cpl"
            className={`px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            📝 CPLテストを受ける
          </Link>
          <Link
            to="/learning"
            className={`px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 ${
              theme === 'dark'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            📚 学習記事を読む
          </Link>
          <Link
            to="/learning/analytics"
            className={`px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 ${
              theme === 'dark'
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            📊 詳細分析を見る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LearningTestIntegrationDashboard;
