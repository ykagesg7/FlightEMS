import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendGa4Event = vi.fn();

vi.mock('../../lib/googleAnalytics', () => ({
  sendGa4Event: (...args: unknown[]) => sendGa4Event(...args),
}));

import {
  trackArticleToQuizClick,
  trackQuizFilterOpen,
  trackQuizHubView,
  trackQuizQuestionReport,
  trackQuizSessionComplete,
  trackQuizSessionStart,
  trackReviewArticleClick,
} from '../../lib/quizAnalytics';

describe('quizAnalytics', () => {
  beforeEach(() => {
    sendGa4Event.mockClear();
  });

  it('trackQuizHubView sends quiz_hub_view with defaults', () => {
    trackQuizHubView({ tab: 'random', exam: 'cpl' });

    expect(sendGa4Event).toHaveBeenCalledWith('quiz_hub_view', {
      tab: 'random',
      exam: 'cpl',
      content_id: '',
    });
  });

  it('trackQuizFilterOpen sends quiz_filter_open', () => {
    trackQuizFilterOpen('subject', 'ppl');

    expect(sendGa4Event).toHaveBeenCalledWith('quiz_filter_open', {
      tab: 'subject',
      exam: 'ppl',
    });
  });

  it('trackQuizSessionStart sends quiz_session_start and quiz_start', () => {
    trackQuizSessionStart({
      tab: 'article',
      mode: 'review',
      count: 10,
      subject: '航空気象',
      content_id: '3.3.1_StandardAtmosphere',
      exam: 'cpl',
    });

    const payload = {
      tab: 'article',
      mode: 'review',
      count: 10,
      subject: '航空気象',
      content_id: '3.3.1_StandardAtmosphere',
      exam: 'cpl',
    };

    expect(sendGa4Event).toHaveBeenCalledTimes(2);
    expect(sendGa4Event).toHaveBeenNthCalledWith(1, 'quiz_session_start', payload);
    expect(sendGa4Event).toHaveBeenNthCalledWith(2, 'quiz_start', payload);
  });

  it('trackQuizSessionComplete rounds score_pct', () => {
    trackQuizSessionComplete({
      score_pct: 66.7,
      count: 5,
      mode: 'random',
    });

    expect(sendGa4Event).toHaveBeenCalledWith('quiz_session_complete', {
      score_pct: 67,
      count: 5,
      mode: 'random',
    });
  });

  it('trackArticleToQuizClick sends article_to_quiz_click', () => {
    trackArticleToQuizClick('PPL-2-1-1_AtmosphereAndIsaBasics', '航空気象');

    expect(sendGa4Event).toHaveBeenCalledWith('article_to_quiz_click', {
      content_id: 'PPL-2-1-1_AtmosphereAndIsaBasics',
      subject: '航空気象',
    });
  });

  it('trackReviewArticleClick sends review_article_click', () => {
    trackReviewArticleClick('3.2.7_LiftAndDrag', 'quiz_result');

    expect(sendGa4Event).toHaveBeenCalledWith('review_article_click', {
      content_id: '3.2.7_LiftAndDrag',
      from: 'quiz_result',
    });
  });

  it('trackQuizQuestionReport sends quiz_question_report with defaults', () => {
    trackQuizQuestionReport({ report_type: 'typo' });

    expect(sendGa4Event).toHaveBeenCalledWith('quiz_question_report', {
      report_type: 'typo',
      main_subject: '',
    });
  });
});
