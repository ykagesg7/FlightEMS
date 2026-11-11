import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QuizHubLoggedInSummary } from '../../../pages/test/components/QuizHubLoggedInSummary';

const mockFetchSrsDueReviewCount = vi.fn();
const mockFrom = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock('../../../pages/test/testQuizFetch', () => ({
  fetchSrsDueReviewCount: (...args: unknown[]) => mockFetchSrsDueReviewCount(...args),
}));

vi.mock('../../../utils/supabase', () => ({
  default: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('QuizHubLoggedInSummary', () => {
  beforeEach(() => {
    mockFetchSrsDueReviewCount.mockReset();
    mockFrom.mockReset();
    mockMaybeSingle.mockReset();
    mockFetchSrsDueReviewCount.mockResolvedValue(3);
    mockMaybeSingle.mockResolvedValue({ data: { current_streak_days: 5 }, error: null });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: () => mockMaybeSingle(),
        }),
      }),
    });
  });

  it('shows due count and review CTA when cards are due', async () => {
  const onStartReview = vi.fn();
    render(<QuizHubLoggedInSummary userId="u1" onStartReview={onStartReview} />);
    await waitFor(() => {
      expect(screen.getByText(/今日の復習/)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: '復習を始める' }));
    expect(onStartReview).toHaveBeenCalled();
  });

  it('shows streak without shame copy when streak is positive', async () => {
    render(<QuizHubLoggedInSummary userId="u1" onStartReview={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByLabelText('連続学習 5 日')).toBeInTheDocument();
    });
  });
});
