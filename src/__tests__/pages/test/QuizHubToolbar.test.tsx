import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuizHubToolbar } from '../../../pages/test/components/QuizHubToolbar';
import type { TestHubState } from '../../../pages/test/testHubFilters';

const baseState: TestHubState = {
  tab: 'diagnostic',
  count: 10,
  sort: 'priority',
  exam: 'all',
  mode: 'practice',
  subject: '',
  sub: 'all',
};

describe('QuizHubToolbar', () => {
  it('hides quick diagnostic card while a session is in progress', () => {
    render(
      <QuizHubToolbar
        state={baseState}
        visibleTabs={['diagnostic', 'review', 'subject']}
        onTabChange={vi.fn()}
        onSortChange={vi.fn()}
        onOpenFilters={vi.fn()}
        activeFilterCount={0}
        onStartDiagnostic={vi.fn()}
        diagnosticInProgress
      />,
    );
    expect(screen.queryByRole('button', { name: '10問診断を開始' })).not.toBeInTheDocument();
  });

  it('shows quick diagnostic card before the session starts', () => {
    render(
      <QuizHubToolbar
        state={baseState}
        visibleTabs={['diagnostic', 'review', 'subject']}
        onTabChange={vi.fn()}
        onSortChange={vi.fn()}
        onOpenFilters={vi.fn()}
        activeFilterCount={0}
        onStartDiagnostic={vi.fn()}
        diagnosticInProgress={false}
      />,
    );
    expect(screen.getByRole('button', { name: '10問診断を開始' })).toBeInTheDocument();
  });
});
