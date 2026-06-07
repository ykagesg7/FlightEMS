import { sendGa4Event } from './googleAnalytics';

export function trackQuizFilterOpen(tab: string, exam?: string): void {
  sendGa4Event('quiz_filter_open', { tab, exam: exam ?? 'all' });
}

export function trackQuizSessionStart(params: {
  tab: string;
  mode: string;
  count: number;
  subject?: string;
}): void {
  sendGa4Event('quiz_session_start', {
    tab: params.tab,
    mode: params.mode,
    count: params.count,
    subject: params.subject ?? '',
  });
}

export function trackQuizSessionComplete(params: {
  score_pct: number;
  count: number;
  mode: string;
}): void {
  sendGa4Event('quiz_session_complete', {
    score_pct: Math.round(params.score_pct),
    count: params.count,
    mode: params.mode,
  });
}

export function trackArticleToQuizClick(contentId: string, subject: string): void {
  sendGa4Event('article_to_quiz_click', { content_id: contentId, subject });
}

export function trackReviewArticleClick(contentId: string, from: string): void {
  sendGa4Event('review_article_click', { content_id: contentId, from });
}

export function trackQuizQuestionReport(params: {
  report_type: string;
  main_subject?: string;
}): void {
  sendGa4Event('quiz_question_report', {
    report_type: params.report_type,
    main_subject: params.main_subject ?? '',
  });
}
