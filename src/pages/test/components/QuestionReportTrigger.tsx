import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import type { QuestionReportContext } from '../utils/questionReportTypes';
import type { QuestionReportSource } from '../utils/questionReportLinks';
import { QuestionReportDialog } from './QuestionReportDialog';

type QuestionReportTriggerProps = {
  questionId: string;
  mainSubject?: string;
  context?: QuestionReportContext;
  reportSource?: QuestionReportSource;
  className?: string;
  variant?: 'inline' | 'button';
};

export const QuestionReportTrigger: React.FC<QuestionReportTriggerProps> = ({
  questionId,
  mainSubject,
  context,
  reportSource = 'quiz_active',
  className = '',
  variant = 'inline',
}) => {
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const baseClass =
    variant === 'button'
      ? 'inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-primary/30 px-3 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10'
      : 'inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline';

  return (
    <>
      {acknowledged ? (
        <p className={`text-xs text-[var(--text-muted)] ${className}`.trim()} role="status">
          報告を受け付けました。確認後に修正します。
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${baseClass} ${className}`.trim()}
          aria-label="この問題を報告"
        >
          <Flag className="h-4 w-4 shrink-0" aria-hidden />
          問題を報告
        </button>
      )}
      <QuestionReportDialog
        open={open}
        questionId={questionId}
        mainSubject={mainSubject}
        context={context}
        reportSource={reportSource}
        onClose={() => setOpen(false)}
        onSuccess={() => setAcknowledged(true)}
      />
    </>
  );
};
