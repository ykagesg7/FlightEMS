import React, { useEffect, useRef } from 'react';
import type { Database } from '../../../types/database.types';

type Announcement = Database['public']['Tables']['announcements']['Row'];

interface AnnouncementCardProps {
  announcement: Announcement;
  index?: number;
}

/**
 * お知らせカードコンポーネント
 * Home のトーンに合わせた上質なカードデザイン
 */
export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  index = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // 日付フォーマット
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // revealアニメーション用のスタイル（IntersectionObserverで制御される）
  const animationDelay = index * 100; // スタッガーアニメーション

  // カードがマウントされたら、すぐにアニメーションを確認
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let rafId2: number | null = null;

    // requestAnimationFrameを使って、DOMが確実に更新された後に実行
    const rafId = requestAnimationFrame(() => {
      // さらに1フレーム待つ
      rafId2 = requestAnimationFrame(() => {
        if (!cardRef.current) return;

        const checkVisibility = () => {
          const rect = cardRef.current?.getBoundingClientRect();
          if (!rect) return;

          const isVisible = rect.top < window.innerHeight + 200 && rect.bottom > -200;

          // 既に画面内にある場合は即座に表示
          if (isVisible && cardRef.current) {
            // 少し遅延を入れてアニメーション
            setTimeout(() => {
              if (cardRef.current) {
                cardRef.current.classList.add('opacity-100', 'translate-y-0');
                cardRef.current.classList.remove('opacity-0', 'translate-y-4');
              }
            }, animationDelay);
          }
        };

        // 即座にチェック
        checkVisibility();

        // 少し遅延して再度チェック（IntersectionObserverのフォールバック）
        timer = setTimeout(checkVisibility, 300 + animationDelay);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (rafId2 !== null) {
        cancelAnimationFrame(rafId2);
      }
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [animationDelay]);

  return (
    <div
      ref={cardRef}
      className={`
        reveal opacity-0 translate-y-4 transition-all duration-700 ease-out
        relative overflow-hidden rounded-xl border-2
        backdrop-blur-md
        transform hover:scale-[1.03] cursor-pointer group
        bg-[var(--panel)]/95 border-brand-primary/20 shadow-[0_18px_50px_rgba(3,8,20,0.35)]
        hover:border-brand-primary/45 hover:bg-[var(--panel)] hover:shadow-[0_22px_60px_rgba(3,8,20,0.45)]
      `}
      style={{
        transitionDelay: `${animationDelay}ms`,
      }}
      role="article"
      aria-label={`お知らせ: ${announcement.title}`}
      data-announcement-id={announcement.id}
    >
      {/* 上部アクセント */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/80 to-transparent"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,170,247,0.14),transparent_34%)] opacity-80 pointer-events-none" />

      {/* カードコンテンツ */}
      <div className="p-6 relative z-10">
        {/* 日付バッジ */}
        <div className="flex items-center justify-between mb-3">
          <time
            className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary"
            dateTime={announcement.date}
          >
            {formatDate(announcement.date)}
          </time>
        </div>

        {/* タイトル */}
        <h3
          className="mb-3 line-clamp-2 text-lg font-bold text-[var(--text-primary)] transition-colors duration-300 group-hover:text-brand-primary"
        >
          {announcement.title}
        </h3>

        {/* ホバー時のアクションヒント */}
        <div className="mt-5 flex items-center text-xs font-medium text-[color:var(--text-muted)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="mr-2 h-px w-6 bg-brand-primary/40" />
          <span
            className="text-brand-primary transform transition-transform duration-300 group-hover:translate-x-1"
          >
            View update →
          </span>
        </div>
      </div>
    </div>
  );
};

