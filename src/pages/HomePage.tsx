import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnnouncementCard } from '../components/home/AnnouncementCard';
import { useTheme } from '../contexts/ThemeContext';
import { useAnnouncements } from '../hooks/useAnnouncements';

const useReveal = (deps?: React.DependencyList) => {
  useEffect(() => {
    let io: IntersectionObserver | null = null;

    // 少し遅延を入れて、DOMが更新された後に実行
    const timer = setTimeout(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

      // アニメーション設定を最適化（prefers-reduced-motion対応）
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const threshold = prefersReducedMotion ? 0.1 : 0.15;

      io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;

            // スタッガーアニメーション用の遅延を取得（style属性から）
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

const HomePage: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const { announcements, isLoading, error } = useAnnouncements();

  // お知らせデータが読み込まれた後にrevealアニメーションを実行
  // 依存配列にannouncements.lengthを含めることで、データ読み込み後に再実行
  useReveal([announcements.length, isLoading]);

  return (
    <div className="relative bg-[color:var(--bg)] min-h-screen">
      {/* 背景イメージ（戦闘機/パイロット系） */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
        <img
          src="/images/ContentImages/topgun1.jpg"
          alt="Fighter jet background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      <div className="absolute inset-0 hud-grid-overlay" />
      <div className="absolute inset-0 hud-scanlines" />

      {/* Hero */}
      <section className="relative container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 hud-glow leading-tight">
            <span className="hud-text">学ぶ・計画する・飛ぶ。</span>
          </h1>
          <p className="text-lg sm:text-xl text-[color:var(--text-muted)] mb-10 leading-relaxed">
            FlightAcademyは、学習コンテンツと試験対策、フライト計画がひとつになった
            モダンなパイロット学習プラットフォーム。今すぐ無料で始められます。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              to="/auth?mode=signup"
              className={`
                px-8 py-4 rounded-lg border-2 backdrop-blur-md
                focus-hud hud-glow w-full sm:w-auto text-center
                transform transition-all duration-300 ease-out
                hover:scale-105 hover:shadow-xl
                ${effectiveTheme === 'dark'
                  ? 'hud-border hud-surface border-red-500/60 shadow-red-900/20 hover:bg-white/10 hover:border-red-500/80'
                  : 'hud-border hud-surface border-green-500/50 shadow-green-900/10 hover:bg-white/10 hover:border-green-500/70'
                }
              `}
            >
              無料で始める
            </Link>
            <Link
              to="/planning"
              className={`
                px-8 py-4 rounded-lg border-2 backdrop-blur-md
                w-full sm:w-auto text-center
                transform transition-all duration-300 ease-out
                hover:scale-105 hover:bg-white/10
                ${effectiveTheme === 'dark'
                  ? 'border-red-500/40 hover:border-red-500/60'
                  : 'border-green-500/30 hover:border-green-500/50'
                }
              `}
            >
              デモを見る（計画マップ）
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-[color:var(--text-muted)]">
            <span className={`
              px-4 py-2 rounded-full backdrop-blur-sm border
              ${effectiveTheme === 'dark'
                ? 'border-red-500/30 bg-red-900/10'
                : 'border-green-500/30 bg-green-900/10'
              }
            `}>
              一部コンテンツは無料
            </span>
            <span className={`
              px-4 py-2 rounded-full backdrop-blur-sm border
              ${effectiveTheme === 'dark'
                ? 'border-red-500/30 bg-red-900/10'
                : 'border-green-500/30 bg-green-900/10'
              }
            `}>
              登録は3分で完了
            </span>
            <span className={`
              px-4 py-2 rounded-full backdrop-blur-sm border
              ${effectiveTheme === 'dark'
                ? 'border-red-500/30 bg-red-900/10'
                : 'border-green-500/30 bg-green-900/10'
              }
            `}>
              Supabaseで安全に管理
            </span>
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="relative container mx-auto px-4 pb-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 hud-text hud-glow">
            最新情報
          </h2>
          <p className="text-sm text-[color:var(--text-muted)]">
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
                    ${effectiveTheme === 'dark'
                    ? 'hud-surface border-red-500/30'
                    : 'hud-surface border-green-500/30'
                  }
                  `}
              >
                <div className={`h-6 rounded mb-3 ${effectiveTheme === 'dark' ? 'bg-red-900/30' : 'bg-green-900/30'}`} />
                <div className={`h-12 rounded ${effectiveTheme === 'dark' ? 'bg-red-900/20' : 'bg-green-900/20'}`} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className={`
                rounded-xl border-2 backdrop-blur-md p-6 text-center
                ${effectiveTheme === 'dark'
                ? 'hud-surface border-red-500/50'
                : 'hud-surface border-green-500/50'
              }
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
            <p className="text-sm text-[color:var(--text-muted)]">現在お知らせはありません</p>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="relative container mx-auto px-4 pb-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 hud-text hud-glow">
            主な機能
          </h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            FlightAcademyが提供する革新的な学習体験
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: '学習 × テスト連携',
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
            {
              title: 'フリーミアムではじめる',
              desc: '一部記事は無料公開。試して納得してから登録/継続利用が可能です。',
            },
          ].map((f, i) => (
            <div
              key={i}
              className={`
                reveal opacity-0 translate-y-4 transition-all duration-700 ease-out
                p-6 rounded-xl border-2 backdrop-blur-md shadow-lg
                transform hover:scale-[1.03] hover:shadow-xl
                ${effectiveTheme === 'dark'
                  ? 'hud-border hud-surface border-red-500/60 shadow-red-900/20 hover:bg-white/10 hover:border-red-500/80'
                  : 'hud-border hud-surface border-green-500/50 shadow-green-900/10 hover:bg-white/10 hover:border-green-500/70'
                }
              `}
            >
              <h3 className="font-bold text-lg mb-3 hud-text">{f.title}</h3>
              <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Try routes */}
      <section className="relative container mx-auto px-4 pb-20">
        <div className={`
          reveal opacity-0 translate-y-4 transition-all duration-700 ease-out
          rounded-2xl border-2 backdrop-blur-md shadow-lg
          p-6 sm:p-8 lg:p-10
          ${effectiveTheme === 'dark'
            ? 'hud-border hud-surface border-red-500/60 shadow-red-900/20'
            : 'hud-border hud-surface border-green-500/50 shadow-green-900/10'
          }
        `}>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 hud-text hud-glow">今すぐ体験</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Link
              to="/learning"
              className={`
                block p-5 rounded-xl border-2 backdrop-blur-sm
                transform transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-lg
                ${effectiveTheme === 'dark'
                  ? 'border-red-500/40 hover:bg-white/10 hover:border-red-500/60'
                  : 'border-green-500/30 hover:bg-white/10 hover:border-green-500/50'
                }
              `}
            >
              <div className="font-semibold mb-2 text-lg hud-text">LESSONS</div>
              <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">カテゴリ/検索/タグで学習をスタート</p>
            </Link>
            <Link
              to="/articles"
              className={`
                block p-5 rounded-xl border-2 backdrop-blur-sm
                transform transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-lg
                ${effectiveTheme === 'dark'
                  ? 'border-red-500/40 hover:bg-white/10 hover:border-red-500/60'
                  : 'border-green-500/30 hover:bg-white/10 hover:border-green-500/50'
                }
              `}
            >
              <div className="font-semibold mb-2 text-lg hud-text">ARTICLES</div>
              <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">記事を読む・いいね/コメントで交流</p>
            </Link>
            <Link
              to="/planning"
              className={`
                block p-5 rounded-xl border-2 backdrop-blur-sm
                transform transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-lg
                ${effectiveTheme === 'dark'
                  ? 'border-red-500/40 hover:bg-white/10 hover:border-red-500/60'
                  : 'border-green-500/30 hover:bg-white/10 hover:border-green-500/50'
                }
              `}
            >
              <div className="font-semibold mb-2 text-lg hud-text">PLANNING</div>
              <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">地図・気象を確認しながらルート設計</p>
            </Link>
          </div>
          <div className="text-right">
            <Link
              to="/auth?mode=signup"
              className={`
                hud-text underline text-sm
                transition-all duration-300 ease-out
                hover:no-underline
                ${effectiveTheme === 'dark'
                  ? 'hover:text-red-400'
                  : 'hover:text-green-400'
                }
              `}
            >
              登録して機能を解放する →
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="relative container mx-auto px-4 pb-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 hud-text hud-glow">
            ユーザーの声
          </h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            FlightAcademyを利用している方々からのフィードバック
          </p>
        </div>
        <div className="reveal opacity-0 translate-y-4 transition-all duration-700 ease-out grid sm:grid-cols-3 gap-6">
          {[
            '短時間で弱点が分かり、復習がはかどりました（CPL 受験生）',
            'HUDテーマで夜間でも見やすい。地図もサクサク動きます（学生）',
            '試験モードのタイマーと問題パレットが実戦的で良い（教官）',
          ].map((t, i) => (
            <div
              key={i}
              className={`
                p-6 rounded-xl border-2 backdrop-blur-md shadow-lg
                transform transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-xl
                ${effectiveTheme === 'dark'
                  ? 'border-red-500/40 bg-[color:var(--panel)]/60 hover:bg-white/5 hover:border-red-500/60'
                  : 'border-green-500/30 bg-[color:var(--panel)]/60 hover:bg-white/5 hover:border-green-500/50'
                }
              `}
            >
              <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">"{t}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative container mx-auto px-4 pb-24">
        <div className={`
          reveal opacity-0 translate-y-4 transition-all duration-700 ease-out
          text-center max-w-2xl mx-auto
          rounded-2xl border-2 backdrop-blur-md shadow-lg p-8 sm:p-10
          ${effectiveTheme === 'dark'
            ? 'hud-border hud-surface border-red-500/60 shadow-red-900/20'
            : 'hud-border hud-surface border-green-500/50 shadow-green-900/10'
          }
        `}>
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 hud-text hud-glow">3分で登録、今日からスタート</h3>
          <p className="text-[color:var(--text-muted)] mb-8 leading-relaxed">
            メール登録で学習進捗やテスト結果が保存されます。
          </p>
          <Link
            to="/auth?mode=signup"
            className={`
              px-8 py-4 rounded-lg border-2 backdrop-blur-md
              focus-hud hud-glow inline-block
              transform transition-all duration-300 ease-out
              hover:scale-105 hover:shadow-xl
              ${effectiveTheme === 'dark'
                ? 'hud-border hud-surface border-red-500/60 shadow-red-900/20 hover:bg-white/10 hover:border-red-500/80'
                : 'hud-border hud-surface border-green-500/50 shadow-green-900/10 hover:bg-white/10 hover:border-green-500/70'
              }
            `}
          >
            無料で始める
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;


