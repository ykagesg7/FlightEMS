import React from 'react';
import { Link } from 'react-router-dom';

export type AnnouncementCardProps = {
  id: string;
  title: string;
  date: string;
  href?: string;
  index?: number;
};

/**
 * ゲスト HOME「最新情報」カード
 */
export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  id,
  title,
  date,
  href,
  index = 0,
}) => {
  const formatDate = (dateString: string): string => {
    try {
      const parsed = new Date(dateString);
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(parsed);
    } catch {
      return dateString;
    }
  };

  const animationDelay = index * 100;

  const cardInner = (
    <>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/80 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,170,247,0.14),transparent_34%)] opacity-80 pointer-events-none" />
      <div className="relative z-10 p-6">
        <div className="mb-3 flex items-center justify-between">
          <time
            className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary"
            dateTime={date}
          >
            {formatDate(date)}
          </time>
        </div>
        <h3 className="mb-3 line-clamp-2 text-lg font-bold text-[var(--text-primary)] transition-colors duration-300 group-hover:text-brand-primary">
          {title}
        </h3>
        {href ? (
          <div className="mt-5 flex items-center text-xs font-medium text-[color:var(--text-muted)] opacity-80 transition-opacity duration-300 group-hover:opacity-100">
            <span className="mr-2 h-px w-6 bg-brand-primary/40" />
            <span className="text-brand-primary transform transition-transform duration-300 group-hover:translate-x-1">
              記事を読む →
            </span>
          </div>
        ) : null}
      </div>
    </>
  );

  const className = `
    reveal translate-y-0 opacity-100 transition-all duration-700 ease-out
    group relative overflow-hidden rounded-xl border-2
    backdrop-blur-md transform hover:scale-[1.03] cursor-pointer
    bg-[var(--panel)]/95 border-brand-primary/20 shadow-[0_18px_50px_rgba(3,8,20,0.35)]
    hover:border-brand-primary/45 hover:bg-[var(--panel)] hover:shadow-[0_22px_60px_rgba(3,8,20,0.45)]
  `;

  if (href) {
    return (
      <Link
        to={href}
        className={className}
        style={{ transitionDelay: `${animationDelay}ms` }}
        aria-label={`最新情報: ${title}`}
        data-announcement-id={id}
      >
        {cardInner}
      </Link>
    );
  }

  return (
    <div
      className={className}
      style={{ transitionDelay: `${animationDelay}ms` }}
      role="article"
      aria-label={`最新情報: ${title}`}
      data-announcement-id={id}
    >
      {cardInner}
    </div>
  );
};
