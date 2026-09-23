import React from 'react';
import { Link } from 'react-router-dom';
import type { TestHubTab } from '../testHubFilters';

export interface QuizHubStatusPanelProps {
  tab: TestHubTab;
  diagnosticStarted: boolean;
  subjectSelected: boolean;
  message: string | null;
  isFetchFailure: boolean;
  onStartDiagnostic: () => void;
  onGoToDiagnosticTab: () => void;
  onGoToSubjectTab: () => void;
  onRetry?: () => void;
}

function resolveCopy(props: QuizHubStatusPanelProps): { title: string; description: string } {
  const { tab, diagnosticStarted, subjectSelected, message, isFetchFailure } = props;

  if (isFetchFailure && message) {
    return {
      title: '問題の取得に失敗しました',
      description: message,
    };
  }

  if (tab === 'diagnostic' && !diagnosticStarted) {
    return {
      title: '上の「10問診断を開始」をタップしてください',
      description: '診断は全科目から重要度の高い問題を出題します。',
    };
  }

  if (tab === 'subject' && !subjectSelected) {
    return {
      title: '科目を選択してください',
      description: '科目を選ぶと、サブ科目と問題数で出題条件を絞り込めます。',
    };
  }

  if (message?.includes('ログインが必須')) {
    return {
      title: '弱点復習にはログインが必要です',
      description: 'ログイン後、復習待ちの問題と弱点データから出題します。まずは10問診断から始めることもできます。',
    };
  }

  if (message?.includes('10問診断')) {
    return {
      title: '弱点データがまだありません',
      description: message,
    };
  }

  if (message?.includes('復習対象はありません')) {
    return {
      title: '本日の復習対象はありません',
      description: 'お疲れさまです。実力診断や科目別練習で新しい弱点を見つけましょう。',
    };
  }

  if (message) {
    return {
      title: message,
      description: 'タブ・フィルタを変更して再度お試しください。',
    };
  }

  return {
    title: '出題できる問題が見つかりませんでした。',
    description: 'タブ・フィルタを変更して再度お試しください。',
  };
}

export const QuizHubStatusPanel: React.FC<QuizHubStatusPanelProps> = (props) => {
  const { tab, diagnosticStarted, subjectSelected, message, isFetchFailure, onStartDiagnostic, onGoToDiagnosticTab, onGoToSubjectTab, onRetry } =
    props;
  const { title, description } = resolveCopy(props);

  const showLoginCta = Boolean(message?.includes('ログインが必須'));
  const showDiagnosticCta =
    (tab === 'diagnostic' && !diagnosticStarted) ||
    showLoginCta ||
    Boolean(message?.includes('10問診断') || message?.includes('復習対象はありません'));
  const showSubjectCta = tab === 'subject' && !subjectSelected;
  const showRetry = isFetchFailure && onRetry;

  const borderClass = isFetchFailure
    ? 'border-hud-red/30 bg-hud-red/5'
    : 'border-brand-primary/15 bg-[var(--panel)]/80';

  return (
    <div
      className={`rounded-2xl border p-10 text-center shadow-lg ${borderClass}`}
      data-testid="quiz-hub-status-panel"
    >
      <p
        className={`text-lg font-semibold ${isFetchFailure ? 'text-hud-red' : 'text-[var(--text-primary)]'}`}
      >
        {title}
      </p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p>

      <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        {showLoginCta && (
          <Link
            to="/auth"
            className="rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-[var(--bg)] transition hover:bg-brand-primary-dark"
          >
            ログイン / 新規登録
          </Link>
        )}
        {showDiagnosticCta && (
          <button
            type="button"
            onClick={tab === 'diagnostic' && !diagnosticStarted ? onStartDiagnostic : onGoToDiagnosticTab}
            className="rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-[var(--bg)] transition hover:bg-brand-primary-dark"
          >
            {tab === 'diagnostic' && !diagnosticStarted ? '10問診断を開始' : '10問診断へ'}
          </button>
        )}
        {showSubjectCta && (
          <p className="text-sm text-[var(--text-muted)] sm:w-full">
            上の「科目」から主科目を選んでください。
          </p>
        )}
        {!showSubjectCta && tab !== 'subject' && message && !showLoginCta && !showDiagnosticCta && (
          <button
            type="button"
            onClick={onGoToSubjectTab}
            className="rounded-xl border border-brand-primary/40 px-6 py-3 text-sm font-medium text-brand-primary transition hover:bg-brand-primary/10"
          >
            科目別練習へ
          </button>
        )}
        {showRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl border border-brand-primary/40 px-6 py-3 text-sm font-medium text-brand-primary transition hover:bg-brand-primary/10"
          >
            再読み込み
          </button>
        )}
      </div>
    </div>
  );
};
