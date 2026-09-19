import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { lazy } from 'react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LocationKeyedOutlet } from '@/layouts/LocationKeyedOutlet';
import { withRouteSuspense } from '@/layouts/withRouteSuspense';

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

const NeverHome = withRouteSuspense(
  lazy(() => new Promise<{ default: typeof PlanningStub }>(() => {})),
);

function Shell() {
  return (
    <div>
      <LocationKeyedOutlet />
    </div>
  );
}

describe('LocationKeyedOutlet', () => {
  it('unmounts Planning when the path changes even if the next route suspends', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/planning']}>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<NeverHome />} />
            <Route path="planning" element={<PlanningStub />} />
            <Route path="auth" element={<div>AUTH_PAGE</div>} />
            <Route path="mission" element={<div>MISSION_PAGE</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('PLANNING_STAY')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'HOME' }));
    expect(screen.queryByText('PLANNING_STAY')).not.toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows LOGIN and Mission Dashboard destinations instead of Planning', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <MemoryRouter initialEntries={['/planning']}>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<div>HOME_PAGE</div>} />
            <Route path="planning" element={<PlanningStub />} />
            <Route path="auth" element={<div>AUTH_PAGE</div>} />
            <Route path="mission" element={<div>MISSION_PAGE</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: 'LOGIN' }));
    expect(screen.queryByText('PLANNING_STAY')).not.toBeInTheDocument();
    expect(screen.getByText('AUTH_PAGE')).toBeInTheDocument();
    unmount();

    render(
      <MemoryRouter initialEntries={['/planning']}>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<div>HOME_PAGE</div>} />
            <Route path="planning" element={<PlanningStub />} />
            <Route path="auth" element={<div>AUTH_PAGE</div>} />
            <Route path="mission" element={<div>MISSION_PAGE</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: 'Mission Dashboard' }));
    expect(screen.queryByText('PLANNING_STAY')).not.toBeInTheDocument();
    expect(screen.getByText('MISSION_PAGE')).toBeInTheDocument();
  });
});
