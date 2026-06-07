import type { QuestionReportContext } from './questionReportTypes';

export type QuestionReportSource = 'quiz_active' | 'quiz_results';

/** 報告送信時にブラウザ位置を context へ付与 */
export function mergeReportContextWithLocation(
  context: QuestionReportContext | undefined,
  source: QuestionReportSource,
): QuestionReportContext {
  if (typeof window === 'undefined') {
    return { ...context, report_source: source };
  }
  return {
    ...context,
    report_source: source,
    page_url: window.location.href,
    page_path: window.location.pathname,
    page_search: window.location.search || undefined,
  };
}

/** 管理者向け: 報告元ページ URL（保存済みならそのまま） */
export function getAdminReportSourcePageUrl(context: QuestionReportContext | null | undefined): string | null {
  if (!context) return null;
  if (typeof context.page_url === 'string' && context.page_url.trim()) {
    return context.page_url.trim();
  }
  if (typeof context.page_path === 'string' && context.page_path.trim()) {
    const search = typeof context.page_search === 'string' ? context.page_search : '';
    return `${context.page_path}${search}`;
  }
  return null;
}

/** 管理者向け: 報告問題を1問プレビューする /test URL */
export function buildAdminQuestionPreviewUrl(questionId: string): string {
  const params = new URLSearchParams();
  params.set('previewQuestion', questionId);
  params.set('mode', 'practice');
  return `/test?${params.toString()}`;
}

export function parseQuestionReportContext(raw: unknown): QuestionReportContext {
  if (!raw || typeof raw !== 'object') return {};
  return raw as QuestionReportContext;
}
