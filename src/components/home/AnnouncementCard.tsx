import React, { useEffect, useRef } from 'react';
import type { Database } from '../../types/database.types';

type Announcement = Database['public']['Tables']['announcements']['Row'];

interface AnnouncementCardProps {
  announcement: Announcement;
  index?: number;
}

/**
 * お知らせカードコンポーネント
 * モダンなカードデザインでお知らせを表示
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
        backdrop-blur-md shadow-lg hover:shadow-xl
        transform hover:scale-[1.03] cursor-pointer group
        hud-surface border-green-500/50 shadow-green-900/10 hover:bg-white/10 hover:border-green-500/70
      `}
      style={{
        transitionDelay: `${animationDelay}ms`,
      }}
      role="article"
      aria-label={`お知らせ: ${announcement.title}`}
      data-announcement-id={announcement.id}
    >
      {/* グラデーションボーダー効果（上部アクセント） */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/0 via-green-500/80 to-green-500/0"
      />

      {/* カードコンテンツ */}
      <div className="p-6 relative z-10">
        {/* 日付バッジ */}
        <div className="flex items-center justify-between mb-3">
          <time
            className="text-xs font-medium px-3 py-1 rounded-full bg-green-100/50 text-green-700 border border-green-300/50"
            dateTime={announcement.date}
          >
            {formatDate(announcement.date)}
          </time>
        </div>

        {/* タイトル */}
        <h3
          className="text-lg font-bold mb-2 line-clamp-2 transition-colors duration-300 hud-text hover:text-[color:var(--hud-primary)]"
        >
          {announcement.title}
        </h3>

        {/* ホバー時のアクションヒント */}
        <div className="mt-4 flex items-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span
            className="text-green-600 transform group-hover:translate-x-1 transition-transform duration-300"
          >
            →
          </span>
        </div>
      </div>

      {/* グロー効果（ホバー時） */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 hover:opacity-20 transition-opacity duration-300 pointer-events-none bg-green-500"
      />
    </div>
  );
};

