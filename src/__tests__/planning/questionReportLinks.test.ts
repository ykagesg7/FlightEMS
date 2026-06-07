import { describe, expect, it } from 'vitest';
import {
  buildAdminQuestionPreviewUrl,
  getAdminReportSourcePageUrl,
  mergeReportContextWithLocation,
} from '../../pages/test/utils/questionReportLinks';

describe('questionReportLinks', () => {
  it('builds admin preview url', () => {
    expect(buildAdminQuestionPreviewUrl('abc-123')).toBe('/test?previewQuestion=abc-123&mode=practice');
  });

  it('reads saved page_url from context', () => {
    expect(getAdminReportSourcePageUrl({ page_url: 'http://localhost/test?tab=diagnostic' }))
      .toBe('http://localhost/test?tab=diagnostic');
  });

  it('merges location when window is unavailable', () => {
    const merged = mergeReportContextWithLocation({ mode: 'practice' }, 'quiz_results');
    expect(merged.mode).toBe('practice');
    expect(merged.report_source).toBe('quiz_results');
  });
});
