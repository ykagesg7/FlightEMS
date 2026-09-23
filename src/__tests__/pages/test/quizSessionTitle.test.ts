import { describe, expect, it } from 'vitest';
import { buildQuizSessionTitle } from '../../../pages/test/utils/quizSessionTitle';
import { PLACEHOLDER_SUBJECT } from '../../../pages/test/testHubFilters';

describe('buildQuizSessionTitle', () => {
  it('labels diagnostic sessions', () => {
    expect(
      buildQuizSessionTitle({
        tab: 'diagnostic',
        questionCount: 10,
        subject: PLACEHOLDER_SUBJECT,
        subjectSelected: false,
        retryIncorrectMode: false,
      }),
    ).toBe('実力診断 (10問)');
  });

  it('labels review sessions without placeholder subject leakage', () => {
    expect(
      buildQuizSessionTitle({
        tab: 'review',
        questionCount: 8,
        subject: PLACEHOLDER_SUBJECT,
        subjectSelected: false,
        retryIncorrectMode: false,
      }),
    ).toBe('弱点復習 (8問)');
  });

  it('labels content-linked sessions', () => {
    expect(
      buildQuizSessionTitle({
        tab: 'content',
        questionCount: 5,
        subject: '航空法規',
        subjectSelected: true,
        retryIncorrectMode: false,
      }),
    ).toBe('記事連動クイズ (5問)');
  });

  it('labels retry incorrect mode', () => {
    expect(
      buildQuizSessionTitle({
        tab: 'subject',
        questionCount: 3,
        subject: '航空法規',
        subjectSelected: true,
        retryIncorrectMode: true,
      }),
    ).toBe('不正解復習 (3問)');
  });
});
