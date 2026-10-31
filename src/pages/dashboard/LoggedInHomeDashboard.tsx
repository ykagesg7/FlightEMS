import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import type { DashboardMetrics } from '../../types/dashboard';
import { fetchDashboardMetrics } from '../../utils/dashboard';
import { DailyTasks } from './components/DailyTasks';
import { LearningHeatmap } from './components/LearningHeatmap';
import { LearningJourneyCard } from './components/LearningJourneyCard';
import { ProfileCompletionNudge } from '../../components/profile/ProfileCompletionNudge';
import { InAppNotificationBell } from '../../components/learning/InAppNotificationBell';
import { SubjectAccuracyChart } from './components/SubjectAccuracyChart';
import { buildWeakSubjectHref } from '../test/testHubFilters';
import { DashboardCourseSection } from './components/DashboardCourseSection';
import { HomeFirstStepCta } from './components/HomeFirstStepCta';
import { LoggedInHomeLatestNews } from './components/LoggedInHomeLatestNews';
import { useDashboardCourseNext } from '../../hooks/useDashboardCourseNext';
import { hasDashboardLearningProgress } from '../../utils/dashboardProgress';

const LoggedInHomeDashboard: React.FC = () => {
  const { user, profile } = useAuthStore();
  const courseState = useDashboardCourseNext();
  const [metrics, setMetrics] = React.useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadMetrics() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashboardMetrics(user!.id, { includeSocial: false });
        setMetrics(data);
      } catch (err) {
        console.error('ダッシュボードデータ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    void loadMetrics();
  }, [user]);

  const borderColor = 'border-brand-primary/60';
  const weakest = metrics?.weakTopics[0];
  const showFirstStepCta =
    !loading &&
    metrics != null &&
    !hasDashboardLearningProgress(metrics, { xpPoints: profile?.xp_points });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Typography variant="h1" color="brand" className="mb-1">
              今日の1手
            </Typography>
            <Typography variant="body" color="muted">
              次にやることを、短く確認
            </Typography>
          </div>
          <InAppNotificationBell className="sm:max-w-sm sm:shrink-0" />
        </div>

        {error && (
          <div
            className={`
              mb-6 rounded-xl border-2 p-4 text-center
              border-brand-primary/50 bg-brand-primary/10
            `}
          >
            <p className="mb-3 text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={`
                px-4 py-2 rounded-lg border-2
                border-brand-primary/60 text-brand-primary hover:bg-brand-primary/20
              `}
            >
              再試行
            </button>
          </div>
        )}

        {showFirstStepCta ? <HomeFirstStepCta /> : null}

        <DashboardCourseSection forceFallback={Boolean(error)} courseState={courseState} />
        <LearningJourneyCard />
        <div className="mb-6">
          <DailyTasks variant="inline" limit={2} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border-2 border-brand-primary/30 bg-brand-primary/10 p-6 animate-pulse"
              >
                <div className="h-6 w-32 bg-gray-700/30 rounded mb-4" />
                <div className="h-12 w-full bg-gray-700/20 rounded" />
              </div>
            ))}
          </div>
        ) : !metrics ? (
          <div
            className={`
              mb-6 rounded-xl border-2 p-6 text-center
              border-brand-primary/30 bg-brand-primary/10
            `}
          >
            <p className="text-[color:var(--text-muted)]">学習サマリーを取得できませんでした</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card variant="hud" padding="md" className={borderColor}>
              <CardContent>
                <Typography variant="caption" color="muted" className="mb-2">
                  今日の学習分（JST）
                </Typography>
                <Typography variant="h1" color="hud" className="mb-2">
                  {metrics.todayStudyMinutes}分
                </Typography>
                <Typography variant="caption" color="muted">
                  クイズと記事・レッスンの実測
                </Typography>
              </CardContent>
            </Card>

            <Card variant="hud" padding="md" className={borderColor}>
              <CardContent>
                <Typography variant="caption" color="muted" className="mb-2">
                  継続日数
                </Typography>
                <Typography variant="h1" color="hud" className="mb-2">
                  {metrics.streakDays}日
                </Typography>
                <Typography variant="caption" color="muted">
                  連続して学習した日
                </Typography>
              </CardContent>
            </Card>

            <Card variant="hud" padding="md" className={borderColor}>
              <CardContent>
                <Typography variant="caption" color="muted" className="mb-2">
                  いちばん弱い科目
                </Typography>
                {weakest ? (
                  <>
                    <Link
                      to={buildWeakSubjectHref(weakest.topic)}
                      className="block text-xl font-semibold text-brand-primary underline decoration-brand-primary/40 hover:decoration-brand-primary"
                    >
                      {weakest.topic}
                    </Link>
                    <Typography variant="caption" color="muted" className="mt-2 block">
                      通算正答率 {weakest.accuracyPct}%（{weakest.attemptCount}問）
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body" color="muted">
                    5問以上解くと表示します
                  </Typography>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <LoggedInHomeLatestNews
          excludeContentId={courseState.next?.articleId ?? null}
        />

        <ProfileCompletionNudge
          dismissStorageKey="profile_completion_nudge_home_v1"
          className="mb-6 max-w-3xl"
        />

        {metrics && (
          <details className="mb-6 group rounded-xl border border-brand-primary/30 bg-[var(--panel)]/40 open:pb-4">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-brand-primary marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2">
                詳しく
                <span className="text-xs font-normal text-[color:var(--text-muted)] group-open:hidden">
                  （直近7日・ヒートマップ・科目別正答率）
                </span>
                <span className="text-xs font-normal text-[color:var(--text-muted)] hidden group-open:inline">
                  （閉じる）
                </span>
              </span>
            </summary>
            <div className="space-y-6 px-4 pt-2">
              <Card variant="hud" padding="md" className={borderColor}>
                <CardContent>
                  <Typography variant="h4" color="hud" className="mb-2">
                    直近7日の学習時間
                  </Typography>
                  <Typography variant="h2" color="hud">
                    {metrics.weeklyStudyMinutes}分
                  </Typography>
                  <Typography variant="body-sm" color="muted" className="mt-2">
                    今日を含む JST 暦日 7 日分。今日は {metrics.todayStudyMinutes}分
                  </Typography>
                </CardContent>
              </Card>
              <LearningHeatmap />
              <SubjectAccuracyChart />
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default LoggedInHomeDashboard;
