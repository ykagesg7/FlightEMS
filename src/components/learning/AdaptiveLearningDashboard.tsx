import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import supabase from '../../utils/supabase';

interface LearningProgress {
  user_id: string;
  content_id: string;
  title: string;
  category: string;
  completed: boolean;
  progress_percentage: number;
  last_read_at: string;
  related_test_questions: number;
  attempted_questions: number;
  correct_answers: number;
  test_accuracy_rate: number;
  performance_level: 'weak' | 'average' | 'strong';
  recommended_action: string;
}

interface WeakArea {
  subject_category: string;
  sub_category: string;
  accuracy_rate: number;
  attempt_count: number;
  improvement_trend: 'improving' | 'declining' | 'stable';
  priority_level: number;
}

interface LearningRecommendation {
  content_id: string;
  content_type: string;
  reason: string;
  priority_score: number;
  estimated_impact: number;
}

interface LearningSession {
  id: string;
  session_type: 'reading' | 'testing' | 'review' | 'practice';
  content_id: string;
  session_duration: number;
  completion_rate: number;
  created_at: string;
}

const AdaptiveLearningDashboard: React.FC = () => {
  const { user } = useAuth();
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [recentSessions, setRecentSessions] = useState<LearningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'weaknesses' | 'recommendations'>('overview');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 学習進捗データの取得
      const { data: progressData, error: progressError } = await supabase
        .from('learning_progress_integration')
        .select('*')
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false });

      if (progressError) {
        console.error('学習進捗データの取得エラー:', progressError);
      } else {
        setLearningProgress(progressData || []);
      }

      // 弱点分析データの取得
      const { data: weakAreasData, error: weakAreasError } = await supabase
        .from('user_weak_areas')
        .select('*')
        .eq('user_id', user.id)
        .order('priority_level', { ascending: false })
        .limit(10);

      if (weakAreasError) {
        console.error('弱点分析データの取得エラー:', weakAreasError);
      } else {
        setWeakAreas(weakAreasData || []);
      }

      // 学習推奨データの取得
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .rpc('generate_learning_recommendations', { p_user_id: user.id });

      if (recommendationsError) {
        console.error('学習推奨データの取得エラー:', recommendationsError);
      } else {
        setRecommendations(recommendationsData || []);
      }

      // 最近の学習セッション取得
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (sessionsError) {
        console.error('学習セッションデータの取得エラー:', sessionsError);
      } else {
        setRecentSessions(sessionsData || []);
      }

    } catch (error) {
      console.error('ダッシュボードデータの取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceLevelColor = (level: string) => {
    switch (level) {
      case 'strong': return 'text-green-600 bg-green-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'weak': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendedActionText = (action: string) => {
    switch (action) {
      case 'review_content_first': return '記事を再復習';
      case 'practice_more': return 'さらに練習';
      case 'advance_to_next': return '次のレベルへ';
      case 'continue_learning': return '学習継続';
      default: return action;
    }
  };

  const calculateOverallStats = () => {
    const totalProgress = learningProgress.length;
    const completedProgress = learningProgress.filter(p => p.completed).length;
    const averageAccuracy = learningProgress.length > 0
      ? learningProgress.reduce((sum, p) => sum + p.test_accuracy_rate, 0) / learningProgress.length
      : 0;
    const totalStudyTime = recentSessions.reduce((sum, s) => sum + (s.session_duration || 0), 0);

    return {
      completionRate: totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0,
      averageAccuracy: averageAccuracy * 100,
      totalStudyTime: Math.round(totalStudyTime / 60), // 分に変換
      activeWeakAreas: weakAreas.filter(w => w.accuracy_rate < 0.7).length
    };
  };

  const stats = calculateOverallStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">学習分析ダッシュボード</h1>

        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">完了率</h3>
            <p className="text-2xl font-bold text-blue-900">{stats.completionRate.toFixed(1)}%</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">平均正答率</h3>
            <p className="text-2xl font-bold text-green-900">{stats.averageAccuracy.toFixed(1)}%</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600">総学習時間</h3>
            <p className="text-2xl font-bold text-purple-900">{stats.totalStudyTime}分</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-600">要改善分野</h3>
            <p className="text-2xl font-bold text-red-900">{stats.activeWeakAreas}個</p>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: '概要' },
              { key: 'progress', label: '学習進捗' },
              { key: 'weaknesses', label: '弱点分析' },
              { key: 'recommendations', label: '学習推奨' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'overview' | 'progress' | 'weaknesses' | 'recommendations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 最近の学習活動 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">最近の学習活動</h3>
                <div className="space-y-3">
                  {recentSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{session.content_id}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({session.session_type})
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.session_duration ? `${Math.round(session.session_duration / 60)}分` : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 優先改善分野 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">優先改善分野</h3>
                <div className="space-y-3">
                  {weakAreas.slice(0, 5).map((area, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{area.subject_category}</span>
                        {area.sub_category && (
                          <span className="text-sm text-gray-500 ml-2">
                            - {area.sub_category}
                          </span>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="text-red-600">
                          {(area.accuracy_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">学習進捗詳細</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      記事
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      進捗
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      テスト成績
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      パフォーマンス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      推奨アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {learningProgress.map((progress, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{progress.title}</div>
                          <div className="text-sm text-gray-500">{progress.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${progress.progress_percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{progress.progress_percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {progress.attempted_questions > 0 ? (
                          <div>
                            <div>{progress.correct_answers}/{progress.attempted_questions}</div>
                            <div className="text-xs text-gray-500">
                              ({(progress.test_accuracy_rate * 100).toFixed(1)}%)
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">未実施</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceLevelColor(progress.performance_level)}`}>
                          {progress.performance_level === 'strong' ? '良好' :
                            progress.performance_level === 'average' ? '普通' : '要改善'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getRecommendedActionText(progress.recommended_action)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'weaknesses' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">弱点分析</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weakAreas.map((area, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{area.subject_category}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${area.improvement_trend === 'improving' ? 'bg-green-100 text-green-800' :
                      area.improvement_trend === 'declining' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {area.improvement_trend === 'improving' ? '改善中' :
                        area.improvement_trend === 'declining' ? '悪化' : '安定'}
                    </span>
                  </div>
                  {area.sub_category && (
                    <p className="text-sm text-gray-600 mb-2">{area.sub_category}</p>
                  )}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>正答率:</span>
                      <span className="font-medium text-red-600">
                        {(area.accuracy_rate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>試行回数:</span>
                      <span>{area.attempt_count}回</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>優先度:</span>
                      <span className="font-medium">{area.priority_level}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">学習推奨</h3>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{rec.content_id}</h4>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        優先度: {rec.priority_score.toFixed(1)}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        効果: {rec.estimated_impact.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                    学習を開始
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdaptiveLearningDashboard;
