import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardMetrics } from '@/types/dashboard';

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/utils/dashboard', () => ({
  fetchDashboardMetrics: vi.fn(),
}));

vi.mock('@/hooks/useDashboardCourseNext', () => ({
  useDashboardCourseNext: vi.fn(),
}));

vi.mock('@/pages/dashboard/components/LoggedInHomeLatestNews', () => ({
  LoggedInHomeLatestNews: () => null,
}));

vi.mock('@/pages/dashboard/components/DashboardCourseSection', () => ({
  DashboardCourseSection: () => <div data-testid="dashboard-course-section" />,
}));

vi.mock('@/pages/dashboard/components/LearningJourneyCard', () => ({
  LearningJourneyCard: () => null,
}));

vi.mock('@/pages/dashboard/components/DailyTasks', () => ({
  DailyTasks: () => null,
}));

vi.mock('@/components/profile/ProfileCompletionNudge', () => ({
  ProfileCompletionNudge: () => null,
}));

vi.mock('@/components/learning/InAppNotificationBell', () => ({
  InAppNotificationBell: () => null,
}));

import { useAuthStore } from '@/stores/authStore';
import { fetchDashboardMetrics } from '@/utils/dashboard';
import { useDashboardCourseNext } from '@/hooks/useDashboardCourseNext';
import HomePage from '@/pages/dashboard/HomePage';

const mockUseAuthStore = vi.mocked(useAuthStore);
const mockFetchDashboardMetrics = vi.mocked(fetchDashboardMetrics);
const mockUseDashboardCourseNext = vi.mocked(useDashboardCourseNext);

const freshMetrics = (): DashboardMetrics => ({
  overallProgressPct: 0,
  testAccuracyPct: 0,
  testTotalAttempts: 0,
  todayStudyMinutes: 0,
  weeklyStudyMinutes: 0,
  streakDays: 0,
  weakTopics: [],
  publicLeaderboard: [],
});

describe('HomePage logged-in first-step CTA', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      user: { id: 'user-1' },
      profile: { xp_points: 0 },
    } as never);
    mockFetchDashboardMetrics.mockResolvedValue(freshMetrics());
    mockUseDashboardCourseNext.mockReturnValue({
      courseId: 'ppl',
      next: null,
      complete: false,
      metasLoading: false,
    });
  });

  it('shows first-step CTA for users with no learning progress', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-first-step-cta')).toBeInTheDocument();
    });
  });

  it('hides first-step CTA after quiz attempts', async () => {
    mockFetchDashboardMetrics.mockResolvedValue({
      ...freshMetrics(),
      testTotalAttempts: 3,
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-course-section')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('home-first-step-cta')).not.toBeInTheDocument();
  });
});
