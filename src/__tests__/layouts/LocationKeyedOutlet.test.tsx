import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Link, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LocationKeyedOutlet } from '@/layouts/LocationKeyedOutlet';

function PlanningStub() {
  return (
    <div>
      <h1>PLANNING_STAY</h1>
      <Link to="/">HOME</Link>
      <Link to="/auth">LOGIN</Link>
      <Link to="/mission">Mission Dashboard</Link>
    </div>
  );
}

function Shell() {
  return (
    <div>
      <LocationKeyedOutlet />
    </div>
  );
}

function renderPlanningRouter(options?: {
  homeLazyNever?: boolean;
}) {
  const homeRoute = options?.homeLazyNever
    ? {
        index: true,
        lazy: () => new Promise<{ Component: typeof PlanningStub }>(() => {}),
      }
    : { index: true, element: <div>HOME_PAGE</div> };

  const router = createMemoryRouter(
    [
      {
        element: <Shell />,
        children: [
          homeRoute,
          { path: 'planning', element: <PlanningStub /> },
          { path: 'auth', element: <div>AUTH_PAGE</div> },
          { path: 'mission', element: <div>MISSION_PAGE</div> },
        ],
      },
    ],
    { initialEntries: ['/planning'] },
  );

  return render(<RouterProvider router={router} />);
}

describe('LocationKeyedOutlet', () => {
  it('unmounts Planning when the path changes even if the next route is still loading', async () => {
    const user = userEvent.setup();
    renderPlanningRouter({ homeLazyNever: true });

    expect(screen.getByText('PLANNING_STAY')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'HOME' }));
    expect(screen.queryByText('PLANNING_STAY')).not.toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows LOGIN and Mission Dashboard destinations instead of Planning', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPlanningRouter();

    await user.click(screen.getByRole('link', { name: 'LOGIN' }));
    expect(screen.queryByText('PLANNING_STAY')).not.toBeInTheDocument();
    expect(screen.getByText('AUTH_PAGE')).toBeInTheDocument();
    unmount();

    renderPlanningRouter();

    await user.click(screen.getByRole('link', { name: 'Mission Dashboard' }));
    expect(screen.queryByText('PLANNING_STAY')).not.toBeInTheDocument();
    expect(screen.getByText('MISSION_PAGE')).toBeInTheDocument();
  });
});
