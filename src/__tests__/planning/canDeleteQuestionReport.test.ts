import { describe, expect, it } from 'vitest';
import { canDeleteQuestionReport } from '../../pages/test/utils/questionReportTypes';

describe('canDeleteQuestionReport', () => {
  it('allows delete for resolved and dismissed only', () => {
    expect(canDeleteQuestionReport('resolved')).toBe(true);
    expect(canDeleteQuestionReport('dismissed')).toBe(true);
    expect(canDeleteQuestionReport('open')).toBe(false);
    expect(canDeleteQuestionReport('triaged')).toBe(false);
  });
});
