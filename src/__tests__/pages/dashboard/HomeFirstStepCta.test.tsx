import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HomeFirstStepCta } from '@/pages/dashboard/components/HomeFirstStepCta';

describe('HomeFirstStepCta', () => {
  it('renders primary CTA linking to quiz', () => {
    render(
      <MemoryRouter>
        <HomeFirstStepCta />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('home-first-step-cta')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: '最初の5問を解く' });
    expect(link).toHaveAttribute('href', '/quiz');
  });
});
