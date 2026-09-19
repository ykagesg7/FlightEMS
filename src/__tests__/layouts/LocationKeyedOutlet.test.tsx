import { render, screen, waitFor } from '@testing-library/react';
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

function AuthPage() {
  return <div>AUTH_PAGE</div>;
}

function MissionPage() {
  return <div>MISSION_PAGE</div>;
}

function HomePage() {
  return <div>HOME_PAGE</div>;
}

function Shell() {
  return (
    <div>
      <LocationKeyedOutlet />
    </div>
  );
}

/**
 * Same data-router path as production: createBrowserRouter + route.lazy.
 * createMemoryRouter shares that implementation without touching window.history.
 */
function renderPlanningRouter(options?: {
  homeLazyNever?: boolean;
}) {
  const homeRoute = options?.homeLazyNever
    ? {
        index: true,
        lazy: () => new Promise<{ Component: typeof HomePage }>(() => {}),
      }
    : {
        index: true,
        lazy: async () => ({ Component: HomePage }),
      };

  const router = createMemoryRouter(
    [
      {
        element: <Shell />,
        children: [
          homeRoute,
          { path: 'planning', element: <PlanningStub /> },
          { path: 'auth', lazy: async () => ({ Component: AuthPage }) },
          { path: 'mission', lazy: async () => ({ Component: MissionPage }) },
        ],
      },
    ],
    { initialEntries: ['/planning'] },
  );

  return render(<RouterProvider router={router} />);
}

describe('LocationKeyedOutlet', () => {
  it('constructs Request with AbortSignal the way the data router does', () => {
    expect(() => {
      void new Request('http://localhost/', { signal: new AbortController().signal });
    }).not.toThrow();
  });

  it('unmounts Planning when the path changes even if the next route is still loading', async () => {
    const user = userEvent.setup();
    renderPlanningRouter({ homeLazyNever: true });

    expect(screen.getByText('PLANNING_STAY')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'HOME' }));
    await waitFor(() => {
      expect(screen.queryByText('PLANNING_STAY')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows LOGIN and Mission Dashboard destinations instead of Planning', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPlanningRouter();

    expect(screen.getByText('PLANNING_STAY')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'LOGIN' }));
    await waitFor(() => {
      expect(screen.queryByText('PLANNING_STAY')).not.toBeInTheDocument();
    });
    expect(await screen.findByText('AUTH_PAGE')).toBeInTheDocument();
    unmount();

    renderPlanningRouter();

    expect(screen.getByText('PLANNING_STAY')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Mission Dashboard' }));
    await waitFor(() => {
      expect(screen.queryByText('PLANNING_STAY')).not.toBeInTheDocument();
    });
    expect(await screen.findByText('MISSION_PAGE')).toBeInTheDocument();
  });
});
