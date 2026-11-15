import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PlanningModeSegment } from '@/pages/planning/components/PlanningModeSegment';
import { PLANNING_MODE_LABELS } from '@/pages/planning/components/PlanningModeSegment';

function renderSegment(initialEntry = '/planning') {
  const router = createMemoryRouter(
    [
      {
        path: 'planning',
        element: <PlanningModeSegment useSelectOnMobile={false} />,
      },
    ],
    { initialEntries: [initialEntry] },
  );
  return { ...render(<RouterProvider router={router} />), router };
}

describe('PlanningModeSegment', () => {
  it('syncs tab selection with ?mode= on same-path navigation', async () => {
    const user = userEvent.setup();
    renderSegment();

    const planTab = screen.getByRole('tab', { name: PLANNING_MODE_LABELS.plan });
    const briefTab = screen.getByRole('tab', { name: PLANNING_MODE_LABELS.brief });

    expect(planTab).toHaveAttribute('aria-selected', 'true');
    expect(briefTab).toHaveAttribute('aria-selected', 'false');

    await user.click(briefTab);

    expect(briefTab).toHaveAttribute('aria-selected', 'true');
    expect(planTab).toHaveAttribute('aria-selected', 'false');
  });

  it('selects brief when opened with ?mode=brief', () => {
    renderSegment('/planning?mode=brief');

    expect(screen.getByRole('tab', { name: PLANNING_MODE_LABELS.brief })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});