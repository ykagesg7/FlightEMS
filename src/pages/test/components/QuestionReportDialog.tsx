import React, { useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  QUESTION_REPORT_TYPES,
  QUESTION_REPORT_TYPE_LABELS,
  type QuestionReportContext,
  type QuestionReportType,
} from '../utils/questionReportTypes';
import { useQuestionReport } from '../hooks/useQuestionReport';
import { FilterListbox } from './FilterListbox';
import type { QuestionReportSource } from '../utils/questionReportLinks';

const REPORT_FIELD_CLASS =
  'quiz-text-field w-full rounded-xl border border-brand-primary/20 p-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-60';

type QuestionReportDialogProps = {
  open: boolean;
  questionId: string;
  mainSubject?: string;
  context?: QuestionReportContext;
  reportSource?: QuestionReportSource;
  onClose: () => void;
  onSuccess?: () => void;
};

export const QuestionReportDialog: React.FC<QuestionReportDialogProps> = ({
  open,
  questionId,
  mainSubject,
  context,
  reportSource = 'quiz_active',
  onClose,
  onSuccess,
}) => {
  const titleId = useId();
  const [reportType, setReportType] = useState<QuestionReportType>('wrong_explanation');
  const [comment, setComment] = useState('');
  const { submitting, errorMessage, submitReport, clearMessages } = useQuestionReport();

  const reportTypeOptions = useMemo(
    () =>
      QUESTION_REPORT_TYPES.map((type) => ({
        value: type,
        label: QUESTION_REPORT_TYPE_LABELS[type],
      })),
    [],
  );

  useEffect(() => {
    if (!open) return;
    setReportType('wrong_explanation');
    setComment('');
    clearMessages();
  }, [open, questionId, clearMessages]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await submitReport({
      questionId,
      reportType,
      comment,
      context,
      mainSubject,
      reportSource,
    });
    if (ok) {
      onSuccess?.();
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        aria-label="報告ダイアログを閉じる"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-brand-primary/25 bg-[var(--panel)] p-6 shadow-xl sm:rounded-2xl"
      >
        <h2 id={titleId} className="mb-3 text-lg font-bold text-brand-primary">
          問題を報告
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[var(--text-primary)]">
          正答・解説・問題文に誤りがある可能性がある場合、管理者に報告できます。内容は確認後に修正します。
        </p>

        {errorMessage?.includes('ログイン') ? (
          <div className="mb-4 rounded-lg border border-hud-red/40 bg-hud-red/10 p-3 text-sm text-hud-red">
            {errorMessage}
            <div className="mt-2">
              <Link
                to="/auth"
                className="inline-block rounded-lg border border-brand-primary/40 px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10"
              >
                ログイン / 新規登録
              </Link>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <span className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
              報告の種類
            </span>
            <FilterListbox
              value={reportType}
              options={reportTypeOptions}
              onChange={setReportType}
              disabled={submitting}
              truncateSelection={false}
            />
          </div>

          <div>
            <label htmlFor="report-comment" className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
              詳細（任意）
            </label>
            <textarea
              id="report-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="どこが問題か、参考情報があれば記入してください"
              className={REPORT_FIELD_CLASS}
              disabled={submitting}
            />
          </div>

          {errorMessage && !errorMessage.includes('ログイン') ? (
            <p className="text-sm text-hud-red" role="alert">{errorMessage}</p>
          ) : null}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 flex-1 rounded-xl border border-brand-primary/30 px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-brand-primary/10"
              disabled={submitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="min-h-11 flex-1 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-[var(--bg)] hover:bg-brand-primary-dark disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? '送信中…' : '報告する'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
