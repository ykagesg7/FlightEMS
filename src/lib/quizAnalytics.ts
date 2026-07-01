import { sendGa4Event } from './googleAnalytics';

export function trackQuizHubView(params: {
  tab: string;
  exam: string;
  content_id?: string;
}): void {
  sendGa4Event('quiz_hub_view', {
    tab: params.tab,
    exam: params.exam,
    content_id: params.content_id ?? '',
  });
}

export function trackQuizFilterOpen(tab: string, exam?: string): void {
  sendGa4Event('quiz_filter_open', { tab, exam: exam ?? 'all' });
}

export function trackQuizSessionStart(params: {
  tab: string;
  mode: string;
  count: number;
  subject?: string;
  content_id?: string;
  exam?: string;
}): void {
  const payload = {
    tab: params.tab,
    mode: params.mode,
    count: params.count,
    subject: params.subject ?? '',
    content_id: params.content_id ?? '',
    exam: params.exam ?? 'all',
  };
  sendGa4Event('quiz_session_start', payload);
  sendGa4Event('quiz_start', payload);
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
