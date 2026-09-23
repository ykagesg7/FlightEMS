import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DashboardCourseSection } from '@/pages/dashboard/components/DashboardCourseSection';

vi.mock('@/hooks/useCohortProfile', () => ({
  useCohortProfile: vi.fn(),
}));

vi.mock('@/hooks/useLearningProgress', () => ({
  useLearningProgress: vi.fn(),
}));

vi.mock('@/hooks/useArticleProgress', () => ({
  useArticleProgress: vi.fn(),
}));

vi.mock('@/utils/articlesIndex', () => ({
  getArticleIndex: vi.fn(),
}));

import { useCohortProfile } from '@/hooks/useCohortProfile';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useArticleProgress } from '@/hooks/useArticleProgress';
import { getArticleIndex } from '@/utils/articlesIndex';

const mockUseCohortProfile = vi.mocked(useCohortProfile);
const mockUseLearningProgress = vi.mocked(useLearningProgress);
const mockUseArticleProgress = vi.mocked(useArticleProgress);
const mockGetArticleIndex = vi.mocked(getArticleIndex);

describe('DashboardCourseSection', () => {
  beforeEach(() => {
    mockUseCohortProfile.mockReturnValue({
      profile: { license_target: 'PPL' },
    } as never);
    mockUseArticleProgress.mockReturnValue({
      getArticleProgress: () => null,
    } as never);
    mockGetArticleIndex.mockResolvedValue([]);
    mockUseLearningProgress.mockReturnValue({
      learningContents: [
        {
          id: 'ppl-eng-1',
          title: 'PPL 工学入門',
          category: 'PPL',
          sub_category: '航空工学',
          description: null,
          order_index: 1,
          parent_id: null,
          content_type: 'article',
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
          is_published: true,
        },
      ],
    } as never);
  });

  it('shows fallback card when course articles are unavailable', async () => {
    mockUseLearningProgress.mockReturnValue({
      learningContents: [],
    } as never);

    render(
      <MemoryRouter>
        <DashboardCourseSection />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-course-fallback')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'PPL 学科コースへ' })).toHaveAttribute(
      'href',
      '/articles?course=ppl'
    );
  });

  it('shows continue link for the next course article', async () => {
    render(
      <MemoryRouter>
        <DashboardCourseSection />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-course-continue')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('dashboard-course-fallback')).not.toBeInTheDocument();
  });

  it('forces fallback card when metrics failed', async () => {
    render(
      <MemoryRouter>
        <DashboardCourseSection forceFallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-course-fallback')).toBeInTheDocument();
    });
  });
});
