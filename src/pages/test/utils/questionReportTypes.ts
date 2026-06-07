export const QUESTION_REPORT_TYPES = [
  'wrong_answer',
  'wrong_explanation',
  'typo',
  'outdated',
  'unclear',
  'other',
] as const;

export type QuestionReportType = (typeof QUESTION_REPORT_TYPES)[number];

export const QUESTION_REPORT_STATUSES = [
  'open',
  'triaged',
  'resolved',
  'dismissed',
] as const;

export type QuestionReportStatus = (typeof QUESTION_REPORT_STATUSES)[number];

export const QUESTION_REPORT_TYPE_LABELS: Record<QuestionReportType, string> = {
  wrong_answer: '正答が違う',
  wrong_explanation: '解説が違う・不十分',
  typo: '誤字・表記ミス',
  outdated: '法令・情報が古い',
  unclear: '問題文が分かりにくい',
  other: 'その他',
};

export const QUESTION_REPORT_STATUS_LABELS: Record<QuestionReportStatus, string> = {
  open: '未対応',
  triaged: '確認中',
  resolved: '修正済み',
  dismissed: '却下',
};

export type QuestionReportContext = {
  user_answer?: string | number | null;
  mode?: string;
  tab?: string;
  content_id?: string | null;
  session_id?: string | null;
  /** 報告送信時のフル URL（管理者が報告元ページへ戻る用） */
  page_url?: string;
  page_path?: string;
  page_search?: string;
  report_source?: 'quiz_active' | 'quiz_results';
};

export type QuestionIssueReportRow = {
  id: string;
  user_id: string;
  question_id: string;
  report_type: QuestionReportType;
  comment: string | null;
  context: QuestionReportContext;
  status: QuestionReportStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export function canDeleteQuestionReport(status: QuestionReportStatus): boolean {
  return status === 'resolved' || status === 'dismissed';
}

export function isDuplicateOpenReportError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('idx_question_issue_reports_open_unique')
    || lower.includes('duplicate key')
    || lower.includes('unique constraint');
}

export function formatQuestionReportError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string') {
      if (isDuplicateOpenReportError(message)) {
        return 'この問題は既に報告済みです。対応をお待ちください。';
      }
      return message;
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return '報告の送信に失敗しました';
}
