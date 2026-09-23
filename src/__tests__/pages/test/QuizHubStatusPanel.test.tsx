import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { QuizHubStatusPanel } from '../../../pages/test/components/QuizHubStatusPanel';

function renderPanel(overrides: Partial<React.ComponentProps<typeof QuizHubStatusPanel>> = {}) {
  const props = {
    tab: 'review' as const,
    diagnosticStarted: true,
    subjectSelected: false,
    message: null,
    isFetchFailure: false,
    onStartDiagnostic: vi.fn(),
    onGoToDiagnosticTab: vi.fn(),
    onGoToSubjectTab: vi.fn(),
    ...overrides,
  };
  return render(
    <MemoryRouter>
      <QuizHubStatusPanel {...props} />
    </MemoryRouter>,
  );
}

describe('QuizHubStatusPanel', () => {
  it('shows login CTA for review without auth', () => {
    renderPanel({ message: '弱点復習にはログインが必須です' });
    expect(screen.getByRole('link', { name: /ログイン/ })).toHaveAttribute('href', '/auth');
    expect(screen.getByRole('button', { name: '10問診断へ' })).toBeInTheDocument();
  });

  it('prompts diagnostic start before the session begins', () => {
    renderPanel({ tab: 'diagnostic', diagnosticStarted: false });
    expect(screen.getByRole('button', { name: '10問診断を開始' })).toBeInTheDocument();
  });

  it('suggests diagnostic when weak-area data is missing', () => {
    renderPanel({ message: '弱点データがありません。10問診断を試してください。' });
    expect(screen.getByRole('button', { name: '10問診断へ' })).toBeInTheDocument();
  });

  it('shows retry for fetch failures', () => {
    const onRetry = vi.fn();
    renderPanel({ isFetchFailure: true, message: 'network down', onRetry });
    expect(screen.getByRole('button', { name: '再読み込み' })).toBeInTheDocument();
  });
});
