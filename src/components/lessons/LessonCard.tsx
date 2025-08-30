import React from 'react';
import { Link } from 'react-router-dom';
import { useAnimeInView } from '../../hooks/useAnimeInView';
import { LearningContent } from '../../types';
import ProgressRing from '../common/ProgressRing';

interface LessonCardProps {
  content: LearningContent;
  progressPercent: number;
}

const subjectFromId = (id: string): string => {
  if (id.startsWith('3.1.')) return '航空法規';
  if (id.startsWith('3.2.')) return '航空工学';
  if (id.startsWith('3.3.')) return '航空気象';
  return 'CPL学科';
};

const LessonCard: React.FC<LessonCardProps> = ({ content, progressPercent }) => {
  const ref = useAnimeInView({ translateY: 12 });
  const tag = content.sub_category || subjectFromId(content.id);

  const isCompleted = progressPercent >= 100;

  return (
    <div
      ref={ref as any}
      className={`w-full text-left p-5 rounded-xl border hud-border hud-surface hover:bg-white/5 transition`}
      role="article"
      aria-label={`${content.title}`}
    >
      <Link to={`/articles/${content.id}`} className="block">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold hud-text">{content.title}</h4>
          <span className="text-xs px-2 py-0.5 rounded-full border hud-border text-[color:var(--hud-primary)]">
            {tag}
          </span>
        </div>
        {content.description && (
          <p className="text-xs mt-2 text-[color:var(--text-primary)]">{content.description}</p>
        )}
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2" aria-label="進捗状況">
          <ProgressRing size={28} stroke={3} progress={progressPercent} />
          <span className="text-xs text-[color:var(--text-muted)]">{progressPercent}%</span>
          {isCompleted && (
            <span className="ml-1 inline-flex items-center text-xs px-2 py-0.5 rounded-full border hud-border text-[color:var(--hud-primary)]">
              完了
            </span>
          )}
        </div>
        <Link
          to={`/test?contentId=${encodeURIComponent(content.id)}&mode=practice&count=10`}
          className="inline-flex items-center px-3 py-1.5 rounded-md border hud-border text-[color:var(--hud-primary)] hover:bg-[color:var(--panel)]/60 transition text-xs font-semibold"
          aria-label={`${content.title} の関連テストへ`}
        >
          関連テスト
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default LessonCard;


