import React, { Suspense, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography } from '../../components/ui';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { useAuthStore } from '../../stores/authStore';
import type { DashboardMetrics } from '../../types/dashboard';
import { fetchDashboardMetrics } from '../../utils/dashboard';
import { AnnouncementCard } from './components/AnnouncementCard';
import { DailyTasks } from './components/DailyTasks';
import { LearningHeatmap } from './components/LearningHeatmap';
import { SubjectRadarChart } from './components/SubjectRadarChart';

const useReveal = (deps?: React.DependencyList) => {
  useEffect(() => {
    let io: IntersectionObserver | null = null;

    // 少し遅延を待って、DOMが更新された後に実行
    const timer = setTimeout(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

      // アニメーション設定を最適化（prefers-reduced-motion対応）
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const threshold = prefersReducedMotion ? 0.1 : 0.15;

      io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;

            // スタイルアニメーション用の遅延を取得（style属性から取得）
            const delay = target.style.transitionDelay ?
              parseInt(target.style.transitionDelay.replace('ms', '')) : 0;

            // アニメーション適用
            setTimeout(() => {
              target.classList.add('opacity-100', 'translate-y-0');
              target.classList.remove('opacity-0', 'translate-y-4');
            }, prefersReducedMotion ? 0 : delay);

            // 一度表示された要素は監視を停止
            io?.unobserve(target);
          }
        });
      }, {
        threshold,
        rootMargin: '0px 0px -50px 0px' // 少し早めにアニメーション開始
      });

      els.forEach((el) => io?.observe(el));
    }, 100); // 100ms遅延でDOM更新を待つ

    return () => {
      clearTimeout(timer);
      if (io) {
        io.disconnect();
      }
    };
  }, deps || []);
};

/**
 * ダッシュボードページのスケルトンローダー
 */
const DashboardSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-700/30 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-700/20 rounded mt-2 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        <div className="h-64 bg-gray-700/10 rounded-xl animate-pulse" />
      </div>
    </div>
  );
};

/**
 * ダッシュボードページ本体
 */
const DashboardContent: React.FC = () => {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = React.useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadMetrics() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashboardMetrics(user!.id);
        setMetrics(data);
      } catch (err) {
        console.error('ダッシュボードデータ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, [user]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div
            className={`
              rounded-xl border-2 p-6 text-center
              border-brand-primary/50 bg-brand-primary/10
            `}
          >
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={`
                px-4 py-2 rounded-lg border-2
                border-brand-primary/60 text-brand-primary hover:bg-brand-primary/20
              `}
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div
            className={`
              rounded-xl border-2 p-6 text-center
              border-brand-primary/30 bg-brand-primary/10
            `}
          >
            <p className="text-[color:var(--text-muted)]">データがありません</p>
          </div>
        </div>
      </div>
    );
  }

  const borderColor = 'border-brand-primary/60';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <Typography variant="h1" color="brand" className="mb-2">
            学習ダッシュボード
          </Typography>
          <Typography variant="body" color="muted">
            進捗、弱点、次のアクションを一画面で確認
          </Typography>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 全体進捗 */}
          <Card variant="hud" padding="md" className={borderColor}>
            <CardContent>
              <Typography variant="caption" color="muted" className="mb-2">
                学習の進捗率
              </Typography>
              <Typography variant="h1" color="hud" className="mb-2">
                {metrics.overallProgressPct}%
              </Typography>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div
                  className={`
                    h-2 rounded-full transition-all duration-500
                    bg-brand-primary
                  `}
                  style={{ width: `${metrics.overallProgressPct}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* 模試正答率 */}
          <Card variant="hud" padding="md" className={borderColor}>
            <CardContent>
              <Typography variant="caption" color="muted" className="mb-2">
                クイズ正答率
              </Typography>
              <Typography variant="h1" color="hud" className="mb-2">
                {metrics.testAccuracyPct}%
              </Typography>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div
                  className={`
                    h-2 rounded-full transition-all duration-500
                    bg-brand-primary
                  `}
                  style={{ width: `${metrics.testAccuracyPct}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* 連続学習日数 */}
          <Card variant="hud" padding="md" className={borderColor}>
            <CardContent>
              <Typography variant="caption" color="muted" className="mb-2">
                継続日数
              </Typography>
              <Typography variant="h1" color="hud" className="mb-2">
                {metrics.streakDays}日
              </Typography>
              <Typography variant="caption" color="muted">
                継続して学習を続けましょう
              </Typography>
            </CardContent>
          </Card>
        </div>

        {/* 主要導線 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/planning">
            <Card variant="hud" padding="md" className={`text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${borderColor}`}>
              <CardContent>
                <div className="text-2xl mb-2">🗺️</div>
                <Typography variant="h5" color="hud" className="font-bold">
                  PLANNING
                </Typography>
                <Typography variant="body-sm" color="muted">
                  ルートと条件を確認
                </Typography>
              </CardContent>
            </Card>
          </Link>

          <Link to="/articles">
            <Card variant="hud" padding="md" className={`text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${borderColor}`}>
              <CardContent>
                <div className="text-2xl mb-2">📖</div>
                <Typography variant="h5" color="hud" className="font-bold">
                  BLOG
                </Typography>
                <Typography variant="body-sm" color="muted">
                  記事とレッスンを読む
                </Typography>
              </CardContent>
            </Card>
          </Link>

          <Link to="/test">
            <Card variant="hud" padding="md" className={`text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${borderColor}`}>
              <CardContent>
                <div className="text-2xl mb-2">✍️</div>
                <Typography variant="h5" color="hud" className="font-bold">
                  QUIZ
                </Typography>
                <Typography variant="body-sm" color="muted">
                  理解度を確認する
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 今日の学習タスク / 科目別レーダーチャート */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DailyTasks />
          <SubjectRadarChart />
        </div>

        {/* 学習履歴カレンダー */}
        <div className="mb-8">
          <LearningHeatmap />
        </div>

        {/* 続きから再開 / 弱点復習 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 続きから再開 */}
          {metrics.nextLesson && (
            <Link to={`/articles/${metrics.nextLesson.id}`}>
              <Card variant="hud" padding="md" className={`transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${borderColor}`}>
                <CardContent>
                  <Typography variant="h4" color="hud" className="mb-3">
                    🔄 続きから再開
                  </Typography>
                  <Typography variant="body" color="muted" className="mb-4">
                    {metrics.nextLesson.title}
                  </Typography>
                  <Typography variant="body-sm" color="hud">
                    すぐ再開する →
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* 弱点復習 */}
          {metrics.weakTopics.length > 0 && (
            <Card variant="hud" padding="md" className={borderColor}>
              <CardContent>
                <Typography variant="h4" color="hud" className="mb-3">
                  📌 復習が必要なトピック
                </Typography>
                <div className="space-y-2">
                  {metrics.weakTopics.map((topic, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <Typography variant="body-sm">{topic.topic}</Typography>
                      <Typography variant="body-sm" color="brand">
                        {topic.accuracyPct}%
                      </Typography>
                    </div>
                  ))}
                </div>
                <Link to="/test?mode=review" className="inline-block mt-4">
                  <Typography variant="body-sm" color="hud" className="underline">
                    弱点を復習する →
                  </Typography>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 学習時間サマリー */}
        <div className="mt-8">
          <Card variant="hud" padding="md" className={borderColor}>
            <CardContent>
              <Typography variant="h4" color="hud" className="mb-4">
                今週の学習時間
              </Typography>
              <Typography variant="h2" color="hud">
                {metrics.weeklyStudyMinutes}分
              </Typography>
              <Typography variant="body-sm" color="muted" className="mt-2">
                今週の積み上げを継続しましょう
              </Typography>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

/**
 * ゲスト向けホームページ（未ログイン時）
 */
const GuestHomeContent: React.FC = () => {
  const { announcements, isLoading, error } = useAnnouncements();

  // お知らせデータが読み込まれた後にrevealアニメーションを実行
  // 依存配列にannouncements.lengthを含めることで、データ読み込み後に再実行
  useReveal([announcements.length, isLoading]);

  const corePillars = [
    {
      id: 'planning',
      title: 'Flight Planning',
      summary: '地図、経路、気象情報をひとつの画面で確認し、訓練前の準備精度を高めます。',
      href: '/planning',
      cta: '計画を見る',
    },
    {
      id: 'quiz',
      title: 'Quiz',
      summary: 'Practice、Exam、Review を切り替えながら、理解度と弱点を継続的に把握できます。',
      href: '/test',
      cta: '問題を解く',
    },
    {
      id: 'blog',
      title: 'Blog',
      summary: '記事とレッスンを横断しながら、必要な知識を体系的に積み上げられます。',
      href: '/articles',
      cta: '記事を読む',
    },
  ];

  const trainingFlow = [
    {
      step: '01',
      title: '読む',
      desc: 'ブログとレッスンで背景知識を理解し、用語と原理を先に押さえます。',
    },
    {
      step: '02',
      title: '解く',
      desc: 'クイズで理解を確認し、モード別に弱点を切り分けながら復習します。',
    },
    {
      step: '03',
      title: '計画する',
      desc: 'Flight Planning でルートと条件を整理し、実践へつながる判断力を養います。',
    },
  ];

  const operationalHighlights = [
    'Home ダッシュボードで学習状況を一目で把握',
    '主要機能を 3 本柱に整理したシンプルな導線',
    '訓練・学習・復習を同じブランド体験で統一',
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)]">
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,170,247,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(143,211,255,0.10),transparent_30%)]" />
        <img
          src="/images/ContentImages/topgun1.jpg"
          alt="Flight Academy background"
          className="h-full w-full object-cover opacity-10"
        />
      </div>

      <section className="relative border-b border-brand-primary/10">
        <div className="container mx-auto px-4 pt-16 pb-20 lg:pt-24 lg:pb-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-brand-primary/20 bg-brand-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                Flight Training Platform
              </div>
              <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Learn Smart.
              </h1>
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-[color:var(--text-muted)] sm:text-xl">
                学習・試験対策・フライトプランニングを、ひとつの流れで。
              </p>

              <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/auth?mode=signup"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-brand-primary/60 bg-brand-primary px-8 py-4 text-sm font-semibold text-[var(--bg)] shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-brand-primary-dark"
                >
                  アカウントを作成する
                </Link>
                <Link
                  to="/planning"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-brand-primary/40 bg-[var(--panel)] px-8 py-4 text-sm font-semibold text-[var(--text-primary)] transition-all duration-300 hover:scale-[1.02] hover:border-brand-primary/60 hover:bg-brand-primary/10"
                >
                  Flight Planning を体験する
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {operationalHighlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-xl border border-brand-primary/20 bg-[var(--panel)]/80 px-4 py-4 text-sm leading-relaxed text-[color:var(--text-muted)] backdrop-blur-sm"
                  >
                    {highlight}
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal opacity-0 translate-y-4 transition-all duration-700 ease-out">
              <div className="relative overflow-hidden rounded-3xl border border-brand-primary/20 bg-[var(--panel)] shadow-2xl">
                <img
                  src="images/ContentImages/WorryVsThink4.jpg"
                  alt="Pilot training visual"
                  className="h-[420px] w-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                    Core Modules
                  </div>
                  <div className="grid gap-3">
                    {corePillars.map((pillar) => (
                      <div
                        key={pillar.id}
                        className="rounded-2xl border border-brand-primary/20 bg-[var(--bg)]/70 px-4 py-4 backdrop-blur-sm"
                      >
                        <div className="mb-1 text-sm font-semibold text-brand-primary">{pillar.title}</div>
                        <div className="text-sm leading-relaxed text-[color:var(--text-muted)]">{pillar.summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="relative container mx-auto px-4 pb-16">
        <div className="mb-8 pt-16 text-center">
          <h2 className="mb-3 text-3xl font-bold text-brand-primary sm:text-4xl">
            最新情報
          </h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            学習コンテンツ、機能改善、運用上のお知らせをまとめて確認できます。
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`
                    rounded-xl border-2 backdrop-blur-md shadow-lg p-6 animate-pulse
                    bg-[var(--panel)] border-brand-primary/30
                  `}
              >
                <div className="h-6 rounded mb-3 bg-brand-primary/30" />
                <div className="h-12 rounded bg-brand-primary/20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className={`
                rounded-xl border-2 backdrop-blur-md p-6 text-center
                bg-[var(--panel)] border-brand-primary/50
              `}
          >
            <p className="text-sm text-[color:var(--text-muted)]">
              お知らせの読み込み中にエラーが発生しました。
            </p>
            {process.env.NODE_ENV === 'development' && error && (
              <p className="text-xs text-red-400 mt-2">{error.message}</p>
            )}
          </div>
        ) : announcements.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {announcements.map((announcement, index) => {
              if (process.env.NODE_ENV === 'development') {
                console.log('AnnouncementCard レンダリング:', { id: announcement.id, title: announcement.title, index });
              }
              return (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  index={index}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-[color:var(--text-muted)]">現在お知らせはありません</p>
          </div>
        )}
      </section>

      {/* Core pillars */}
      <section className="relative container mx-auto px-4 pb-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-brand-primary sm:text-4xl">
            主要機能
          </h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            Flight Planning、Quiz、Blog の 3 本柱で学習体験を整理しています。
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {corePillars.map((pillar, index) => (
            <Link
              key={pillar.id}
              to={pillar.href}
              className="reveal opacity-0 translate-y-4 transition-all duration-700 ease-out"
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <div className="group h-full rounded-2xl border border-brand-primary/20 bg-[var(--panel)] p-7 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/50 hover:shadow-2xl">
                <div className="mb-4 inline-flex rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                  {pillar.title}
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-[var(--text-primary)]">{pillar.title}</h3>
                <p className="mb-6 text-sm leading-relaxed text-[color:var(--text-muted)]">{pillar.summary}</p>
                <div className="text-sm font-semibold text-brand-primary transition-transform duration-300 group-hover:translate-x-1">
                  {pillar.cta} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Training flow */}
      <section className="relative container mx-auto px-4 pb-20">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="reveal opacity-0 translate-y-4 transition-all duration-700 ease-out overflow-hidden rounded-3xl border border-brand-primary/20 bg-[var(--panel)] shadow-xl">
            <img
              src="/images/ContentImages/image3.png"
              alt="Training flow visual"
              className="h-full min-h-[320px] w-full object-cover opacity-70"
            />
          </div>
          <div className="reveal opacity-0 translate-y-4 transition-all duration-700 ease-out rounded-3xl border border-brand-primary/20 bg-[var(--panel)] p-8 shadow-xl">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
              Workflow
            </div>
            <h2 className="mb-4 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
              学習から実践まで、
              <span className="text-brand-primary">迷わない流れ</span>
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-[color:var(--text-muted)]">
              Home のダッシュボードを起点に、読む、解く、計画する、の順で自然に進められる構成にしています。
              何を学び、何が不足し、次に何をすべきかを一画面で把握できます。
            </p>
            <div className="space-y-4">
              {trainingFlow.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-brand-primary/15 bg-[var(--bg)]/50 p-5"
                >
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                    Step {item.step}
                  </div>
                  <div className="mb-2 text-lg font-semibold text-[var(--text-primary)]">{item.title}</div>
                  <div className="text-sm leading-relaxed text-[color:var(--text-muted)]">{item.desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center text-sm font-semibold text-brand-primary transition-all duration-300 hover:translate-x-1"
              >
                登録して Home ダッシュボードを使う →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="relative container mx-auto px-4 pb-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-brand-primary sm:text-4xl">
            このプラットフォームでできること
          </h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            教材の閲覧、問題演習、フライト前準備を同じ文脈で進められます。
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: '知識の定着',
              desc: '記事やレッスンで得た知識を、そのままクイズに接続して理解へ変えます。',
            },
            {
              title: '弱点の可視化',
              desc: 'Home ダッシュボードを入口に、進捗、正答率、復習候補をまとめて確認できます。',
            },
            {
              title: '訓練準備の効率化',
              desc: 'Flight Planning でルートと条件を整理し、学習を実践的な判断へつなげます。',
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className={`
                p-6 rounded-xl border-2 backdrop-blur-md shadow-lg
                transform transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-xl
                border-brand-primary/40 bg-[var(--panel)]/60 hover:bg-brand-primary/5 hover:border-brand-primary/60
              `}
            >
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                0{i + 1}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[color:var(--text-muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative container mx-auto px-4 pb-24">
        <div className="reveal opacity-0 translate-y-4 transition-all duration-700 ease-out text-center max-w-2xl mx-auto rounded-2xl border-2 border-brand-primary/60 backdrop-blur-md shadow-lg p-8 sm:p-10 bg-[var(--panel)]">
          <h3 className="mb-4 text-2xl font-bold text-brand-primary sm:text-3xl">
            学習と準備を、毎日のルーティンに。
          </h3>
          <p className="mb-8 leading-relaxed text-[color:var(--text-muted)]">
            アカウントを作成すると、学習進捗、テスト結果、次に進むべきコンテンツを Home からまとめて確認できます。
          </p>
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center justify-center rounded-lg border-2 border-brand-primary/60 bg-brand-primary px-8 py-4 font-semibold text-[var(--bg)] shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-brand-primary-dark"
          >
            Flight Academy を始める
          </Link>
        </div>
      </section>
    </div>
  );
};

/**
 * 統合されたHomePage/DashboardPage
 * ログイン状態に応じてDashboardまたはGuestHomeを表示
 */
const HomePage: React.FC = () => {
  const { user } = useAuthStore();

  // ログイン状態で分岐
  if (user) {
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    );
  }

  return <GuestHomeContent />;
};

export default HomePage;


