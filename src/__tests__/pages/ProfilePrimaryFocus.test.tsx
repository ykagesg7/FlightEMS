import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ProfilePrimaryFocus } from '@/pages/profile/components/ProfilePrimaryFocus';

vi.mock('@/hooks/useCohortProfile', () => ({
  useCohortProfile: () => ({
    profile: null,
    isLoading: false,
    fetchError: null,
  }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: {
      journey: {
        license_target: 'CPL',
        stage: 'preparation',
        stage_order: 1,
        cohort_phase: 'active',
        target_test_date: null,
        article_comprehension_count: 0,
        delayed_retention_count: 0,
        srs_due_count: 0,
        mastered_subject_count: 0,
      },
    },
    isLoading: false,
    isError: false,
  }),
}));

describe('ProfilePrimaryFocus', () => {
  it('shows exam setup empty state and next study step', () => {
    render(
      <MemoryRouter>
        <ProfilePrimaryFocus onEditExam={() => undefined} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('profile-primary-focus')).toBeInTheDocument();
    expect(screen.getByText('受験目標')).toBeInTheDocument();
    expect(screen.getByText('次の学習ステップ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '受験予定を設定する' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '受験予定を設定' })).toHaveAttribute(
      'href',
      '/profile?tab=learning',
    );
  });
});
