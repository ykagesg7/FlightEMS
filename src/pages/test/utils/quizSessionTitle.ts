import type { TestHubTab } from '../testHubFilters';
import { PLACEHOLDER_SUBJECT } from '../testHubFilters';

export interface QuizSessionTitleInput {
  tab: TestHubTab;
  questionCount: number;
  subject: string;
  subjectSelected: boolean;
  retryIncorrectMode: boolean;
}

/** Session heading shown above the active question list. */
export function buildQuizSessionTitle(input: QuizSessionTitleInput): string {
  const { tab, questionCount, subject, subjectSelected, retryIncorrectMode } = input;
  const countLabel = `(${questionCount}問)`;

  if (retryIncorrectMode) {
    return `不正解復習 ${countLabel}`;
  }
  if (tab === 'diagnostic') {
    return `実力診断 ${countLabel}`;
  }
  if (tab === 'review') {
    return `弱点復習 ${countLabel}`;
  }
  if (tab === 'content') {
    return `記事連動クイズ ${countLabel}`;
  }
  if (subjectSelected && subject !== PLACEHOLDER_SUBJECT) {
    return `${subject} 4択テスト`;
  }
  return `4択テスト ${countLabel}`;
}
