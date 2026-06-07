import { describe, expect, it } from 'vitest';
import {
  QUESTION_REPORT_TYPE_LABELS,
  formatQuestionReportError,
  isDuplicateOpenReportError,
} from '../../pages/test/utils/questionReportTypes';

describe('questionReportTypes', () => {
  it('maps report type labels', () => {
    expect(QUESTION_REPORT_TYPE_LABELS.wrong_answer).toBe('正答が違う');
    expect(QUESTION_REPORT_TYPE_LABELS.outdated).toBe('法令・情報が古い');
  });

  it('detects duplicate open report errors', () => {
    expect(isDuplicateOpenReportError('duplicate key value violates unique constraint "idx_question_issue_reports_open_unique"')).toBe(true);
  });

  it('formats duplicate report as user-friendly message', () => {
    expect(formatQuestionReportError({ message: 'duplicate key value violates unique constraint' }))
      .toBe('この問題は既に報告済みです。対応をお待ちください。');
  });
});
