import React from 'react';

const SHIMMER_BLOCK = 'rounded bg-brand-primary/15 motion-safe:animate-pulse motion-reduce:animate-none';

/** 出題カードと同じ骨組みの読み込みプレースホルダ（CLS 抑止） */
export const QuizQuestionLoadingSkeleton: React.FC = () => (
  <div
    className="p-6 md:p-8 rounded-xl shadow-xl bg-[var(--panel)] border border-brand-primary/20"
    aria-busy="true"
    data-testid="quiz-question-loading-skeleton"
  >
    <p className="sr-only" role="status">
      問題を読み込み中
    </p>

    <div className={`mb-4 h-8 w-3/5 max-w-xs ${SHIMMER_BLOCK}`} aria-hidden />

    <div className="mb-4 space-y-2" aria-hidden>
      <div className={`h-4 w-28 mx-auto ${SHIMMER_BLOCK}`} />
      <div className={`h-2 w-full rounded-full bg-brand-primary/10`}>
        <div className={`h-full w-1/5 rounded-full ${SHIMMER_BLOCK}`} />
      </div>
      <div className="mb-4 grid grid-cols-5 gap-2 md:flex md:flex-wrap md:justify-center">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`h-11 w-full md:w-11 ${SHIMMER_BLOCK}`} />
        ))}
      </div>
    </div>

    <div className="space-y-3 mb-6" aria-hidden>
      <div className={`h-5 w-full ${SHIMMER_BLOCK}`} />
      <div className={`h-5 w-[92%] ${SHIMMER_BLOCK}`} />
      <div className={`h-5 w-[78%] ${SHIMMER_BLOCK}`} />
    </div>

    <div className="space-y-3 mb-8" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border-2 border-brand-primary/15`}>
          <div className={`h-10 w-10 shrink-0 ${SHIMMER_BLOCK}`} />
          <div className={`h-4 flex-1 ${SHIMMER_BLOCK}`} />
        </div>
      ))}
    </div>

    <div className="flex items-start justify-between gap-4" aria-hidden>
      <div className="space-y-2">
        <div className={`h-10 w-20 ${SHIMMER_BLOCK}`} />
        <div className={`h-3 w-48 max-w-full ${SHIMMER_BLOCK}`} />
      </div>
    </div>

    <div className={`mt-6 h-12 w-full rounded-xl ${SHIMMER_BLOCK}`} aria-hidden />
  </div>
);
