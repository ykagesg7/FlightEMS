import React from 'react';
import { Link } from 'react-router-dom';
import { buildDiagnosticHref, buildReviewHref } from '../../test/testHubFilters';
import { useAuth } from '../../../hooks/useAuth';

/** Home セクション用 — 10問診断・弱点復習への CTA */
export const HomeQuizDiagnostic: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto mb-6 max-w-md rounded-xl border border-brand-primary/30 bg-brand-secondary-dark/80 p-4 text-left backdrop-blur-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-primary">
        実力診断
      </p>
      <p className="mb-3 text-sm text-gray-200">
        重要度の高い問題 10 問で弱点を把握。記事と組み合わせて学習ループを回しましょう。
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          to={buildDiagnosticHref()}
          className="inline-flex items-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[var(--bg)] hover:bg-brand-primary-dark"
        >
          10問診断を開始
        </Link>
        {user && (
          <Link
            to={buildReviewHref()}
            className="inline-flex items-center rounded-lg border border-brand-primary/40 px-4 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10"
          >
            弱点復習
          </Link>
        )}
      </div>
    </div>
  );
};
