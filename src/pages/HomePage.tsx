import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const useReveal = () => {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('opacity-100', 'translate-y-0');
          e.target.classList.remove('opacity-0', 'translate-y-4');
        }
      });
    }, { threshold: 0.2 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

const HomePage: React.FC = () => {
  const { effectiveTheme } = useTheme();
  useReveal();

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
      <section className="relative container mx-auto px-4 pt-16 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 hud-glow">
            <span className="hud-text">学ぶ・計画する・飛ぶ。</span>
          </h1>
          <p className="text-lg text-[color:var(--text-muted)] mb-8">
            FlightAcademyは、学習コンテンツと試験対策、フライト計画がひとつになった
            モダンなパイロット学習プラットフォーム。今すぐ無料で始められます。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth?mode=signup"
              className="px-6 py-3 rounded-lg border hud-border hud-surface focus-hud hud-glow w-full sm:w-auto text-center"
            >
              無料で始める
            </Link>
            <Link
              to="/planning"
              className="px-6 py-3 rounded-lg border border-[color:var(--hud-dim)] hover:bg-white/5 transition w-full sm:w-auto text-center"
            >
              デモを見る（計画マップ）
            </Link>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-[color:var(--text-muted)]">
            <span className="px-3 py-1 rounded hud-border border">一部コンテンツは無料</span>
            <span className="px-3 py-1 rounded hud-border border">登録は3分で完了</span>
            <span className="px-3 py-1 rounded hud-border border">Supabaseで安全に管理</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative container mx-auto px-4 pb-16">
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
              className="reveal opacity-0 translate-y-4 transition-all duration-700 p-6 rounded-xl border hud-border hud-surface"
            >
              <h3 className="font-bold text-lg mb-2 hud-text">{f.title}</h3>
              <p className="text-sm text-[color:var(--text-muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Try routes */}
      <section className="relative container mx-auto px-4 pb-16">
        <div className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border hud-border hud-surface p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-4 hud-text">今すぐ体験</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link to="/learning" className="block p-4 rounded-lg border border-[color:var(--hud-dim)] hover:bg-white/5 transition">
              <div className="font-semibold mb-1">LESSONS</div>
              <p className="text-sm text-[color:var(--text-muted)]">カテゴリ/検索/タグで学習をスタート</p>
            </Link>
            <Link to="/articles" className="block p-4 rounded-lg border border-[color:var(--hud-dim)] hover:bg:white/5 transition">
              <div className="font-semibold mb-1">ARTICLES</div>
              <p className="text-sm text-[color:var(--text-muted)]">記事を読む・いいね/コメントで交流</p>
            </Link>
            <Link to="/planning" className="block p-4 rounded-lg border border-[color:var(--hud-dim)] hover:bg-white/5 transition">
              <div className="font-semibold mb-1">PLANNING</div>
              <p className="text-sm text-[color:var(--text-muted)]">地図・気象を確認しながらルート設計</p>
            </Link>
          </div>
          <div className="mt-6 text-right">
            <Link to="/auth?mode=signup" className="hud-text underline">登録して機能を解放する →</Link>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="relative container mx-auto px-4 pb-20">
        <div className="reveal opacity-0 translate-y-4 transition-all duration-700 grid sm:grid-cols-3 gap-4">
          {[
            '短時間で弱点が分かり、復習がはかどりました（CPL 受験生）',
            'HUDテーマで夜間でも見やすい。地図もサクサク動きます（学生）',
            '試験モードのタイマーと問題パレットが実戦的で良い（教官）',
          ].map((t, i) => (
            <div key={i} className="p-4 rounded-lg border border-[color:var(--hud-dim)] bg-[color:var(--panel)]/60">
              <p className="text-sm text-[color:var(--text-muted)]">“{t}”</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative container mx-auto px-4 pb-24">
        <div className="reveal opacity-0 translate-y-4 transition-all duration-700 text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-3 hud-text">3分で登録、今日からスタート</h3>
          <p className="text-[color:var(--text-muted)] mb-6">メール登録で学習進捗やテスト結果が保存されます。</p>
          <Link to="/auth?mode=signup" className="px-6 py-3 rounded-lg border hud-border hud-surface focus-hud inline-block">
            無料で始める
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;


