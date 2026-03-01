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

    // 少し遁E��を�Eれて、DOMが更新された後に実衁E
    const timer = setTimeout(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

      // アニメーション設定を最適化！Erefers-reduced-motion対応！E
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const threshold = prefersReducedMotion ? 0.1 : 0.15;

      io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;

            // スタチE��ーアニメーション用の遁E��を取得！Etyle属性から�E�E
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
        rootMargin: '0px 0px -50px 0px' // 少し早めにアニメーション開姁E
      });

      els.forEach((el) => io?.observe(el));
    }, 100); // 100ms遁E��でDOM更新を征E��

    return () => {
      clearTimeout(timer);
      if (io) {
        io.disconnect();
      }
    };
  }, deps || []);
};

/**
 * ダチE��ュボ�Eド�Eージのスケルトンローダー
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
              className="rounded-xl border-2 border-whiskyPapa-yellow/30 bg-whiskyPapa-yellow/10 p-6 animate-pulse"
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
 * ダチE��ュボ�Eド�Eージ本佁E
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
        console.error('ダチE��ュボ�Eドデータ取得エラー:', err);
        setError('チE�Eタの取得に失敗しました');
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
              border-whiskyPapa-yellow/50 bg-whiskyPapa-yellow/10
            `}
          >
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={`
                px-4 py-2 rounded-lg border-2
                border-whiskyPapa-yellow/60 text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/20
              `}
            >
              再試衁E
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
              border-whiskyPapa-yellow/30 bg-whiskyPapa-yellow/10
            `}
          >
            <p className="text-[color:var(--text-muted)]">チE�Eタがありません</p>
          </div>
        </div>
      </div>
    );
  }

  const borderColor = 'border-whiskyPapa-yellow/60';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <Typography variant="h1" color="brand" className="mb-2">
            学習ダチE��ュボ�EチE
          </Typography>
          <Typography variant="body" color="muted">
            あなた�E学習進捗と成績を確誁E
          </Typography>
        </div>

        {/* サマリーカーチE*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 全体進捁E*/}
          <Card variant="hud" padding="md" className={borderColor}>
            <CardContent>
              <Typography variant="caption" color="muted" className="mb-2">
                全体進捁E
              </Typography>
              <Typography variant="h1" color="hud" className="mb-2">
                {metrics.overallProgressPct}%
              </Typography>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div
                  className={`
                    h-2 rounded-full transition-all duration-500
                    bg-whiskyPapa-yellow
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
                模試正答率
              </Typography>
              <Typography variant="h1" color="hud" className="mb-2">
                {metrics.testAccuracyPct}%
              </Typography>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div
                  className={`
                    h-2 rounded-full transition-all duration-500
                    bg-whiskyPapa-yellow
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
                連続学習日数
              </Typography>
              <Typography variant="h1" color="hud" className="mb-2">
                {metrics.streakDays}日
              </Typography>
              <Typography variant="caption" color="muted">
                継続して学習を続けましょぁE
              </Typography>
            </CardContent>
          </Card>
        </div>

        {/* クイチE��アクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/planning">
            <Card variant="hud" padding="md" className={`text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${borderColor}`}>
              <CardContent>
                <div className="text-2xl mb-2">🗺️</div>
                <Typography variant="h5" color="hud" className="font-bold">
                  PLANNING
                </Typography>
                <Typography variant="body-sm" color="muted">
                  フライト計画
                </Typography>
              </CardContent>
            </Card>
          </Link>

          <Link to="/articles">
            <Card variant="hud" padding="md" className={`text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${borderColor}`}>
              <CardContent>
                <div className="text-2xl mb-2">📖</div>
                <Typography variant="h5" color="hud" className="font-bold">
                  ARTICLES
                </Typography>
                <Typography variant="body-sm" color="muted">
                  記事を読む
                </Typography>
              </CardContent>
            </Card>
          </Link>

          <Link to="/articles">
            <Card variant="hud" padding="md" className={`text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${borderColor}`}>
              <CardContent>
                <div className="text-2xl mb-2">📚</div>
                <Typography variant="h5" color="hud" className="font-bold">
                  LESSONS
                </Typography>
                <Typography variant="body-sm" color="muted">
                  レチE��ン開姁E
                </Typography>
              </CardContent>
            </Card>
          </Link>

          <Link to="/test">
            <Card variant="hud" padding="md" className={`text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${borderColor}`}>
              <CardContent>
                <div className="text-2xl mb-2">✍️</div>
                <Typography variant="h5" color="hud" className="font-bold">
                  TEST
                </Typography>
                <Typography variant="body-sm" color="muted">
                  模試を受ける
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 今日の学習タスク / 科目別レーダーチャーチE*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DailyTasks />
          <SubjectRadarChart />
        </div>

        {/* 学習履歴カレンダー */}
        <div className="mb-8">
          <LearningHeatmap />
        </div>

        {/* 続きから再開 / 弱点復翁E*/}
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
                    クリチE��して続きを読む ↁE
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* 弱点復翁E*/}
          {metrics.weakTopics.length > 0 && (
            <Card variant="hud" padding="md" className={borderColor}>
              <CardContent>
                <Typography variant="h4" color="hud" className="mb-3">
                  📌 復習が忁E��なトピチE��
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
                <Link to="/test" className="inline-block mt-4">
                  <Typography variant="body-sm" color="hud" className="underline">
                    模試で復習すめEↁE
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
                直近7日間の学習時間
              </Typography>
              <Typography variant="h2" color="hud">
                {metrics.weeklyStudyMinutes}分
              </Typography>
              <Typography variant="body-sm" color="muted" className="mt-2">
                目標達成まで頑張りましょう
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

  // お知らせチE�Eタが読み込まれた後にrevealアニメーションを実衁E
  // 依存�E列にannouncements.lengthを含めることで、データ読み込み後に再実衁E
  useReveal([announcements.length, isLoading]);

  return (
    <div className="relative bg-whiskyPapa-black min-h-screen">
      {/* 背景イメージ�E�戦闘橁EパイロチE��系�E�E*/}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
        <img
          src="/images/ContentImages/topgun1.jpg"
          alt="Fighter jet background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Hero */}
      <section className="relative container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="text-whiskyPapa-yellow">学ぶ・計画する・飛ぶ</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed">
            FlightAcademyは、学習コンチE��チE��試験対策、フライト計画が�EとつになっぁE
            モダンなパイロチE��学習�EラチE��フォーム。今すぐ無料で始められます、E
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              to="/auth?mode=signup"
              className={`
                px-8 py-4 rounded-lg border-2 backdrop-blur-md
                w-full sm:w-auto text-center
                transform transition-all duration-300 ease-out
                hover:scale-105 hover:shadow-xl
                border-whiskyPapa-yellow/60 bg-whiskyPapa-black-dark shadow-lg hover:bg-whiskyPapa-yellow/10 hover:border-whiskyPapa-yellow/80
              `}
            >
              無料で始めめE
            </Link>
            <Link
              to="/planning"
              className={`
                px-8 py-4 rounded-lg border-2 backdrop-blur-md
                w-full sm:w-auto text-center
                transform transition-all duration-300 ease-out
                hover:scale-105 hover:bg-white/10
                border-whiskyPapa-yellow/40 hover:border-whiskyPapa-yellow/60
              `}
            >
              チE��を見る�E�計画マップ！E
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-400">
            <span className={`
              px-4 py-2 rounded-full backdrop-blur-sm border
              border-whiskyPapa-yellow/30 bg-whiskyPapa-yellow/10
            `}>
              一部コンテンツは無料
            </span>
            <span className={`
              px-4 py-2 rounded-full backdrop-blur-sm border
              border-whiskyPapa-yellow/30 bg-whiskyPapa-yellow/10
            `}>
              登録は3分で完了
            </span>
            <span className={`
              px-4 py-2 rounded-full backdrop-blur-sm border
              border-whiskyPapa-yellow/30 bg-whiskyPapa-yellow/10
            `}>
              Supabaseで安全に管理
            </span>
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="relative container mx-auto px-4 pb-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-whiskyPapa-yellow">
            最新惁E��
          </h2>
          <p className="text-sm text-gray-400">
            プラットフォームの最新アップデートとお知らせ
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`
                    rounded-xl border-2 backdrop-blur-md shadow-lg p-6 animate-pulse
                    bg-whiskyPapa-black-dark border-whiskyPapa-yellow/30
                  `}
              >
                <div className="h-6 rounded mb-3 bg-whiskyPapa-yellow/30" />
                <div className="h-12 rounded bg-whiskyPapa-yellow/20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className={`
                rounded-xl border-2 backdrop-blur-md p-6 text-center
                bg-whiskyPapa-black-dark border-whiskyPapa-yellow/50
              `}
          >
            <p className="text-sm text-gray-400">
              お知らせの読み込み中にエラーが発生しました、E
            </p>
            {process.env.NODE_ENV === 'development' && error && (
              <p className="text-xs text-red-400 mt-2">{error.message}</p>
            )}
          </div>
        ) : announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
            <p className="text-sm text-gray-400">現在お知らせはありません</p>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="relative container mx-auto px-4 pb-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-whiskyPapa-yellow">
            主な機�E
          </h2>
          <p className="text-sm text-gray-400">
            FlightAcademyが提供する革新皁E��学習体騁E
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: '学翁EÁEチE��ト連携',
              desc: '記事とCPL統一問題をマッピング。Practice/Exam/Reviewの3モードで最短距離の学習を。',
            },
            {
              title: 'リアルタイム地図/気象',
              desc: 'React-Leafletと気象データを統合。計画に必要な情報をHUDテーマで高可読に表示。',
            },
            {
              title: '進捗ダッシュボード',
              desc: '到達度・弱点・今日の復習を可視化。継続しやすいUIでモチベーションを維持。',
            },
          ].map((f, i) => (
            <div
              key={i}
              className={`
                reveal opacity-0 translate-y-4 transition-all duration-700 ease-out
                p-6 rounded-xl border-2 backdrop-blur-md shadow-lg
                transform hover:scale-[1.03] hover:shadow-xl
                border-whiskyPapa-yellow/60 bg-whiskyPapa-black-dark hover:bg-whiskyPapa-yellow/10 hover:border-whiskyPapa-yellow/80
              `}
            >
              <h3 className="font-bold text-lg mb-3 text-whiskyPapa-yellow">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Try routes */}
      <section className="relative container mx-auto px-4 pb-20">
        <div className="reveal opacity-0 translate-y-4 transition-all duration-700 ease-out rounded-2xl border-2 border-whiskyPapa-yellow/60 backdrop-blur-md shadow-lg p-6 sm:p-8 lg:p-10 bg-whiskyPapa-black-dark">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-whiskyPapa-yellow">今すぐ体験</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Link
              to="/articles"
              className={`
                block p-5 rounded-xl border-2 backdrop-blur-sm
                transform transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-lg
                border-whiskyPapa-yellow/40 hover:bg-whiskyPapa-yellow/10 hover:border-whiskyPapa-yellow/60
              `}
            >
              <div className="font-semibold mb-2 text-lg text-whiskyPapa-yellow">LESSONS</div>
              <p className="text-sm text-gray-400 leading-relaxed">カテゴリ/検索/タグで学習をスタート</p>
            </Link>
            <Link
              to="/articles"
              className={`
                block p-5 rounded-xl border-2 backdrop-blur-sm
                transform transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-lg
                border-whiskyPapa-yellow/40 hover:bg-whiskyPapa-yellow/10 hover:border-whiskyPapa-yellow/60
              `}
            >
              <div className="font-semibold mb-2 text-lg text-whiskyPapa-yellow">ARTICLES</div>
              <p className="text-sm text-gray-400 leading-relaxed">記事を読む・いいね/コメントで交流</p>
            </Link>
            <Link
              to="/planning"
              className={`
                block p-5 rounded-xl border-2 backdrop-blur-sm
                transform transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-lg
                border-whiskyPapa-yellow/40 hover:bg-whiskyPapa-yellow/10 hover:border-whiskyPapa-yellow/60
              `}
            >
              <div className="font-semibold mb-2 text-lg text-whiskyPapa-yellow">PLANNING</div>
              <p className="text-sm text-gray-400 leading-relaxed">地図・気象を確認しながらルート設定</p>
            </Link>
          </div>
          <div className="text-right">
            <Link
              to="/auth?mode=signup"
              className={`
                text-whiskyPapa-yellow underline text-sm
                transition-all duration-300 ease-out
                hover:no-underline
                hover:text-whiskyPapa-yellow
              `}
            >
              登録して機�Eを解放する ↁE
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="relative container mx-auto px-4 pb-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-whiskyPapa-yellow">
            ユーザーの声
          </h2>
          <p className="text-sm text-gray-400">
            FlightAcademyを利用してぁE��方、E��ら�EフィードバチE��
          </p>
        </div>
        <div className="reveal opacity-0 translate-y-4 transition-all duration-700 ease-out grid sm:grid-cols-3 gap-6">
          {[
            '短時間で弱点がわかり、復習がはかどりました。— CPL 受験生',
            'HUDテーマで夜間でも見やすい。地図もサクサク動きます（学生）',
            '試験モードのタイマーと問題パレットが実戦的で良い。— 教官',
          ].map((t, i) => (
            <div
              key={i}
              className={`
                p-6 rounded-xl border-2 backdrop-blur-md shadow-lg
                transform transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-xl
                border-whiskyPapa-yellow/40 bg-whiskyPapa-black-dark/60 hover:bg-whiskyPapa-yellow/5 hover:border-whiskyPapa-yellow/60
              `}
            >
              <p className="text-sm text-gray-400 leading-relaxed">"{t}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative container mx-auto px-4 pb-24">
        <div className="reveal opacity-0 translate-y-4 transition-all duration-700 ease-out text-center max-w-2xl mx-auto rounded-2xl border-2 border-whiskyPapa-yellow/60 backdrop-blur-md shadow-lg p-8 sm:p-10 bg-whiskyPapa-black-dark">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-whiskyPapa-yellow">3分で登録、今日からスタート</h3>
          <p className="text-gray-400 mb-8 leading-relaxed">
            メール登録で学習進捗やテスト結果が保存されます。
          </p>
          <Link
            to="/auth?mode=signup"
            className={`
              px-8 py-4 rounded-lg border-2 backdrop-blur-md
              inline-block
              transform transition-all duration-300 ease-out
              hover:scale-105 hover:shadow-xl
              border-whiskyPapa-yellow/60 bg-whiskyPapa-black-dark shadow-lg hover:bg-whiskyPapa-yellow/10 hover:border-whiskyPapa-yellow/80
            `}
          >
            無料で始めめE
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


