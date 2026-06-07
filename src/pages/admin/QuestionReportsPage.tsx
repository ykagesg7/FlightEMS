import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import {
  QUESTION_REPORT_STATUS_LABELS,
  QUESTION_REPORT_TYPE_LABELS,
  canDeleteQuestionReport,
  type QuestionReportStatus,
  type QuestionReportType,
} from '../test/utils/questionReportTypes';
import {
  buildAdminQuestionPreviewUrl,
  getAdminReportSourcePageUrl,
  parseQuestionReportContext,
} from '../test/utils/questionReportLinks';
import { FilterListbox } from '../test/components/FilterListbox';
import { ADMIN_CARD_CLASS, ADMIN_INPUT_CLASS, AdminPageShell } from './components/AdminPageShell';

type AdminReportRow = {
  id: string;
  question_id: string;
  report_type: QuestionReportType;
  comment: string | null;
  status: QuestionReportStatus;
  admin_note: string | null;
  created_at: string;
  context: Record<string, unknown> | null;
  unified_cpl_questions: {
    question_text: string;
    main_subject: string;
    sub_subject: string;
    verification_status: string | null;
  } | null;
};

const STATUS_OPTIONS: QuestionReportStatus[] = ['open', 'triaged', 'resolved', 'dismissed'];

const STATUS_FILTER_OPTIONS: Array<{ value: QuestionReportStatus | 'all'; label: string }> = [
  { value: 'all', label: 'すべて' },
  ...STATUS_OPTIONS.map((s) => ({ value: s, label: QUESTION_REPORT_STATUS_LABELS[s] })),
];

const STATUS_SELECT_OPTIONS = STATUS_OPTIONS.map((s) => ({
  value: s,
  label: QUESTION_REPORT_STATUS_LABELS[s],
}));

export const QuestionReportsPage: React.FC = () => {
  const [reports, setReports] = useState<AdminReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<QuestionReportStatus | 'all'>('all');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('question_issue_reports')
        .select(`
          id,
          question_id,
          report_type,
          comment,
          status,
          admin_note,
          created_at,
          context,
          unified_cpl_questions (
            question_text,
            main_subject,
            sub_subject,
            verification_status
          )
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setReports((data ?? []) as AdminReportRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '報告一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const statusCounts = useMemo(() => {
    const counts: Record<QuestionReportStatus, number> = {
      open: 0,
      triaged: 0,
      resolved: 0,
      dismissed: 0,
    };
    for (const report of reports) {
      counts[report.status] += 1;
    }
    return counts;
  }, [reports]);

  const updateReport = async (
    id: string,
    patch: { status?: QuestionReportStatus; admin_note?: string | null },
  ) => {
    setSavingId(id);
    try {
      const { error: updateError } = await supabase
        .from('question_issue_reports')
        .update(patch)
        .eq('id', id);
      if (updateError) throw updateError;
      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setSavingId(null);
    }
  };

  const deleteReport = async (report: AdminReportRow) => {
    if (!canDeleteQuestionReport(report.status)) return;
    const label = QUESTION_REPORT_STATUS_LABELS[report.status];
    if (!window.confirm(`この報告（${label}）を削除しますか？この操作は取り消せません。`)) return;

    setDeletingId(report.id);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('question_issue_reports')
        .delete()
        .eq('id', report.id);
      if (deleteError) throw deleteError;
      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminPageShell
      title="問題報告一覧"
      description="ユーザーからの問題・解説の報告を確認し、ステータスを更新します。修正済み・却下の報告は削除できます。"
    >
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STATUS_OPTIONS.map((status) => (
          <div key={status} className={`${ADMIN_CARD_CLASS} px-4 py-3`}>
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              {QUESTION_REPORT_STATUS_LABELS[status]}
            </p>
            <p className="mt-1 text-xl font-bold text-brand-primary">{statusCounts[status]}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-[var(--text-primary)]">ステータス</span>
        <FilterListbox
          value={statusFilter}
          options={STATUS_FILTER_OPTIONS}
          onChange={setStatusFilter}
        />
        <button
          type="button"
          onClick={() => void loadReports()}
          className="rounded-lg border border-brand-primary/30 px-3 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10"
        >
          再読み込み
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-hud-red/40 bg-hud-red/10 p-3 text-sm text-hud-red">{error}</div>
      ) : null}

      {loading ? (
        <p className="text-center text-[var(--text-muted)]">読み込み中…</p>
      ) : reports.length === 0 ? (
        <p className="text-center text-sm text-[var(--text-primary)]">該当する報告はありません。</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const q = report.unified_cpl_questions;
            const reportContext = parseQuestionReportContext(report.context);
            const sourcePageUrl = getAdminReportSourcePageUrl(reportContext);
            const previewUrl = buildAdminQuestionPreviewUrl(report.question_id);
            const deletable = canDeleteQuestionReport(report.status);
            const busy = savingId === report.id || deletingId === report.id;

            return (
              <article key={report.id} className={`${ADMIN_CARD_CLASS} p-4`}>
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
                      {QUESTION_REPORT_TYPE_LABELS[report.report_type]}
                      <span className="ml-2 text-[var(--text-muted)]">
                        {QUESTION_REPORT_STATUS_LABELS[report.status]}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {new Date(report.created_at).toLocaleString('ja-JP')}
                      {q ? ` · ${q.main_subject} / ${q.sub_subject}` : ''}
                      {q?.verification_status ? ` · ${q.verification_status}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={previewUrl}
                      className="inline-flex min-h-9 items-center rounded-lg border border-brand-primary/35 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/15"
                    >
                      問題をプレビュー
                    </Link>
                    {sourcePageUrl ? (
                      <a
                        href={sourcePageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-9 items-center rounded-lg border border-brand-primary/25 px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-brand-primary/10"
                      >
                        報告元ページ
                      </a>
                    ) : null}
                    {deletable ? (
                      <button
                        type="button"
                        onClick={() => void deleteReport(report)}
                        disabled={busy}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-hud-red/35 bg-hud-red/10 px-3 py-1.5 text-xs font-semibold text-hud-red hover:bg-hud-red/15 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        削除
                      </button>
                    ) : null}
                  </div>
                </div>

                {q ? (
                  <p className="mb-3 whitespace-pre-line text-sm leading-relaxed text-[var(--text-primary)]">
                    {q.question_text}
                  </p>
                ) : null}

                {report.comment ? (
                  <p className="mb-3 rounded-lg border border-brand-primary/15 bg-brand-primary/5 p-3 text-sm text-[var(--text-primary)]">
                    <span className="font-semibold text-brand-primary">ユーザーコメント: </span>
                    {report.comment}
                  </p>
                ) : null}

                {sourcePageUrl ? (
                  <p className="mb-3 break-all text-xs text-[var(--text-muted)]">
                    報告元: {sourcePageUrl}
                  </p>
                ) : null}

                {report.context && Object.keys(report.context).length > 0 ? (
                  <details className="mb-3 rounded-lg border border-brand-primary/10 bg-[var(--panel)]/50 p-2">
                    <summary className="cursor-pointer text-xs font-semibold text-[var(--text-muted)]">
                      コンテキスト（JSON）
                    </summary>
                    <pre className="mt-2 overflow-x-auto text-xs text-[var(--text-muted)]">
                      {JSON.stringify(report.context, null, 2)}
                    </pre>
                  </details>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">ステータス</span>
                    <FilterListbox
                      value={report.status}
                      options={STATUS_SELECT_OPTIONS}
                      onChange={(next) => void updateReport(report.id, { status: next })}
                      disabled={busy}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">管理者メモ</label>
                    <textarea
                      defaultValue={report.admin_note ?? ''}
                      rows={2}
                      disabled={busy}
                      onBlur={(e) => {
                        const next = e.target.value.trim();
                        if (next === (report.admin_note ?? '')) return;
                        void updateReport(report.id, { admin_note: next || null });
                      }}
                      className={ADMIN_INPUT_CLASS}
                      placeholder="対応内容・却下理由など"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AdminPageShell>
  );
};

export default QuestionReportsPage;
