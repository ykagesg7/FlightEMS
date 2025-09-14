import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { ContentEffectiveness, LearningAnalytics, UserProfile } from '../../types';
import supabase from '../../utils/supabase';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);

// 学習セッション型
interface LearningSession {
  id: string;
  user_id: string;
  content_id: string;
  duration_minutes: number;
  comprehension_score: number;
  created_at: string;
}

// テスト結果型
interface TestResult {
  id: string;
  user_id: string;
  question_id: number;
  is_correct: boolean;
  created_at: string;
  subject_category: string;
  response_time_seconds: number;
}

// ユーザープロファイル型
interface UserProfile {
  id: string;
  user_id: string;
  current_streak_days: number;
  longest_streak_days: number;
  total_study_time_minutes: number;
  created_at: string;
  updated_at: string;
}

// コンテンツ効果分析型
interface ContentEffectiveness {
  learning_content_id: string;
  before_accuracy: number;
  after_accuracy: number;
  improvement_rate: number;
  sample_size: number;
  measurement_period_start: string;
  measurement_period_end: string;
  // プロセス後の型も含む
  contentId?: string;
  title?: string;
  beforeAccuracy?: number;
  afterAccuracy?: number;
  improvement?: number;
  sampleSize?: number;
}

// 学習分析データ型
interface LearningAnalytics {
  totalStudyTime: number;
  averageTestScore: number;
  completionRate: number;
  subjectMastery: Record<string, number>;
  weeklyProgress: Array<{
    week: string;
    minutes: number;
    score: number;
  }>;
  weakAreas: Array<{
    subject: string;
    accuracy: number;
    questionCount: number;
  }>;
  strongAreas: Array<{
    subject: string;
    accuracy: number;
    questionCount: number;
  }>;
  learningVelocity: number;
  retentionRate: number;
  streakData: {
    current: number;
    longest: number;
  };
}

const LearningAnalyticsDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [contentEffectiveness, setContentEffectiveness] = useState<ContentEffectiveness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    } else {
      // ユーザーがログインしていない場合はローディング状態を解除
      setLoading(false);
    }
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 期間の設定
      const now = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'quarter':
          startDate.setDate(now.getDate() - 90);
          break;
      }

      // 並列でデータを取得
      const [
        sessionsResult,
        testResultsResult,
        profileResult,
        effectivenessResult
      ] = await Promise.all([
        // 学習セッションデータ
        supabase
          .from('learning_sessions')
          .select('duration_minutes, created_at, comprehension_score, content_id')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString()),

        // テスト結果データ
        supabase
          .from('user_test_results')
          .select('is_correct, subject_category, created_at, response_time_seconds')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString()),

        // ユーザープロファイル (存在しない場合はnullになる)
        supabase
          .from('user_learning_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),

        // コンテンツ効果データ
        supabase
          .from('content_effectiveness')
          .select('*')
          .gte('measurement_period_start', startDate.toISOString())
      ]);

      if (sessionsResult.error) throw sessionsResult.error;
      if (testResultsResult.error) throw testResultsResult.error;

      // プロファイルエラーをログ出力（必須ではないため継続）
      if (profileResult.error) {
        if (import.meta.env.MODE === 'development') {
          console.warn('User profile loading failed:', profileResult.error);
        }
      }

      const sessions = sessionsResult.data || [];
      const testResults = testResultsResult.data || [];
      const profile = profileResult.data;
      const effectiveness = effectivenessResult.data || [];

      // 分析データの計算
      const analyticsData = calculateAnalytics(sessions, testResults, profile);
      setAnalytics(analyticsData);

      // コンテンツ効果データの処理
      const processedEffectiveness = processContentEffectiveness(effectiveness);
      setContentEffectiveness(processedEffectiveness);

    } catch (err) {
      console.error('Analytics loading error:', err);
      setError('分析データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (sessions: LearningSession[], testResults: TestResult[], profile: UserProfile | null): LearningAnalytics => {
    // 総学習時間
    const totalStudyTime = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);

    // 平均テストスコア
    const averageTestScore = testResults.length > 0
      ? Math.round((testResults.filter(r => r.is_correct).length / testResults.length) * 100)
      : 0;

    // 完了率（理解度スコアベース）
    const validComprehensionScores = sessions.filter(s => s.comprehension_score !== null);
    const completionRate = validComprehensionScores.length > 0
      ? Math.round((validComprehensionScores.reduce((sum, s) => sum + s.comprehension_score, 0) / validComprehensionScores.length) * 100)
      : 0;

    // 科目別習熟度
    const subjectStats = testResults.reduce((acc, result) => {
      const subject = result.subject_category || 'その他';
      if (!acc[subject]) {
        acc[subject] = { correct: 0, total: 0 };
      }
      acc[subject].total++;
      if (result.is_correct) {
        acc[subject].correct++;
      }
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    const subjectMastery = Object.entries(subjectStats).reduce((acc, [subject, stats]) => {
      acc[subject] = Math.round((stats.correct / stats.total) * 100);
      return acc;
    }, {} as Record<string, number>);

    // 週間進捗
    const weeklyProgress = calculateWeeklyProgress(sessions, testResults);

    // 弱点・強点分析
    const weakAreas = Object.entries(subjectStats)
      .filter(([, stats]) => stats.total >= 3) // 最低3問以上
      .map(([subject, stats]) => ({
        subject,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        questionCount: stats.total
      }))
      .filter(area => area.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    const strongAreas = Object.entries(subjectStats)
      .filter(([, stats]) => stats.total >= 3)
      .map(([subject, stats]) => ({
        subject,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        questionCount: stats.total
      }))
      .filter(area => area.accuracy >= 80)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);

    // 学習速度（分あたりの問題正解数）
    const learningVelocity = totalStudyTime > 0
      ? Math.round((testResults.filter(r => r.is_correct).length / totalStudyTime) * 60 * 100) / 100
      : 0;

    // 定着率（初回正解率）
    const retentionRate = testResults.length > 0 ? averageTestScore : 0;

    return {
      totalStudyTime,
      averageTestScore,
      completionRate,
      subjectMastery,
      weeklyProgress,
      weakAreas,
      strongAreas,
      learningVelocity,
      retentionRate,
      streakData: {
        current: profile?.current_streak_days || 0,
        longest: profile?.longest_streak_days || 0
      }
    };
  };

  const calculateWeeklyProgress = (sessions: LearningSession[], testResults: TestResult[]) => {
    const weeks = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + 6));
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));

      const weekSessions = sessions.filter(s => {
        const sessionDate = new Date(s.created_at);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });

      const weekTests = testResults.filter(r => {
        const testDate = new Date(r.created_at);
        return testDate >= weekStart && testDate <= weekEnd;
      });

      const weekMinutes = weekSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const weekScore = weekTests.length > 0
        ? Math.round((weekTests.filter(r => r.is_correct).length / weekTests.length) * 100)
        : 0;

      weeks.push({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        minutes: weekMinutes,
        score: weekScore
      });
    }

    return weeks;
  };

  const processContentEffectiveness = (effectiveness: ContentEffectiveness[]): ContentEffectiveness[] => {
    return effectiveness.map(item => ({
      contentId: item.learning_content_id,
      title: item.learning_content_id, // 実際にはコンテンツタイトルを取得すべき
      beforeAccuracy: item.before_accuracy || 0,
      afterAccuracy: item.after_accuracy || 0,
      improvement: item.improvement_rate || 0,
      sampleSize: item.sample_size || 0
    })).filter(item => item.sampleSize >= 5); // 最低5サンプル以上
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
        <p className="text-red-600 dark:text-red-400">{error || 'データが見つかりません'}</p>
      </div>
    );
  }

  const progressChartData = {
    labels: analytics.weeklyProgress.map(w => w.week),
    datasets: [
      {
        label: '学習時間（分）',
        data: analytics.weeklyProgress.map(w => w.minutes),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        yAxisID: 'y',
      },
      {
        label: '正答率（%）',
        data: analytics.weeklyProgress.map(w => w.score),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        yAxisID: 'y1',
      },
    ],
  };

  const subjectMasteryData = {
    labels: Object.keys(analytics.subjectMastery),
    datasets: [
      {
        label: '習熟度（%）',
        data: Object.values(analytics.subjectMastery),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          📊 学習分析ダッシュボード
        </h1>

        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === range
                ? 'bg-indigo-600 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {range === 'week' ? '1週間' : range === 'month' ? '1ヶ月' : '3ヶ月'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {analytics.totalStudyTime}分
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">総学習時間</div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {analytics.averageTestScore}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">平均正答率</div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {analytics.completionRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">理解度</div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {analytics.streakData.current}日
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">連続学習</div>
        </div>
      </div>

      {/* 進捗チャート */}
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-xl font-semibold mb-4">📈 週間進捗</h2>
        <Bar data={progressChartData} options={chartOptions} />
      </div>

      {/* 科目別習熟度 */}
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-xl font-semibold mb-4">🎯 科目別習熟度</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64">
            <Bar data={subjectMasteryData} options={chartOptions} />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">🔥 強化推奨分野</h3>
              {analytics.weakAreas.length > 0 ? (
                <div className="space-y-2">
                  {analytics.weakAreas.map((area, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{area.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 dark:text-red-400">{area.accuracy}%</span>
                        <span className="text-gray-500">({area.questionCount}問)</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  すべての分野で良好な成績です！
                </p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ 得意分野</h3>
              {analytics.strongAreas.length > 0 ? (
                <div className="space-y-2">
                  {analytics.strongAreas.map((area, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{area.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400">{area.accuracy}%</span>
                        <span className="text-gray-500">({area.questionCount}問)</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  まだ十分なデータがありません
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 学習効率指標 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="font-semibold mb-2">⚡ 学習速度</h3>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {analytics.learningVelocity}
          </div>
          <div className="text-xs text-gray-500">問題/時間</div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="font-semibold mb-2">🧠 定着率</h3>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {analytics.retentionRate}%
          </div>
          <div className="text-xs text-gray-500">初回正解率</div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="font-semibold mb-2">🏆 最長記録</h3>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {analytics.streakData.longest}日
          </div>
          <div className="text-xs text-gray-500">連続学習記録</div>
        </div>
      </div>

      {/* コンテンツ効果分析 */}
      {contentEffectiveness.length > 0 && (
        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className="text-xl font-semibold mb-4">📚 学習コンテンツ効果分析</h2>
          <div className="space-y-3">
            {contentEffectiveness.slice(0, 5).map((content, index) => (
              <div key={index} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{content.title}</div>
                    <div className="text-sm text-gray-500">
                      改善率: {content.beforeAccuracy}% → {content.afterAccuracy}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${content.improvement > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                      }`}>
                      {content.improvement > 0 ? '+' : ''}{content.improvement}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {content.sampleSize}名のデータ
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningAnalyticsDashboard;
