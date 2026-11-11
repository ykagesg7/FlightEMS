import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QuizQuestionLoadingSkeleton } from '../../../pages/test/components/QuizQuestionLoadingSkeleton';

describe('QuizQuestionLoadingSkeleton', () => {
  it('exposes busy state and status text for assistive tech', () => {
    render(<QuizQuestionLoadingSkeleton />);
    expect(screen.getByTestId('quiz-question-loading-skeleton')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('問題を読み込み中');
  });
});
