import React from 'react';
import { Link } from 'react-router-dom';

type AdminPageShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  showHubLink?: boolean;
};

export const ADMIN_INPUT_CLASS =
  'quiz-text-field w-full rounded-xl border border-brand-primary/20 px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-60';

export const ADMIN_CARD_CLASS =
  'rounded-xl border border-brand-primary/20 bg-[var(--panel)] p-5 shadow-sm';

export const AdminPageShell: React.FC<AdminPageShellProps> = ({
  title,
  description,
  children,
  headerAction,
  showHubLink = true,
}) => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">{title}</h1>
          <p className="mt-1 text-sm text-[var(--text-primary)]">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {headerAction}
          {showHubLink ? (
            <Link
              to="/admin"
              className="rounded-lg border border-brand-primary/30 px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10"
            >
              管理 Hub
            </Link>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
};
