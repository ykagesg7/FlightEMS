import { render, screen } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProgressProvider } from '@/contexts/ProgressContext';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('@/utils/supabase', () => ({
  default: {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  },
  createPublicSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
    }),
  }),
}));

function QuizProbe() {
  return <div>QUIZ_ROUTE_OK</div>;
}

function RouterShellWithProgress() {
  return (
    <ProgressProvider>
      <Outlet />
    </ProgressProvider>
  );
}

describe('ProgressProvider router placement', () => {
  it('mounts ProgressProvider under RouterProvider (useLearningProgress uses useLocation)', async () => {
    const router = createMemoryRouter(
      [
        {
          element: <RouterShellWithProgress />,
          children: [{ path: 'quiz', element: <QuizProbe /> }],
        },
      ],
      { initialEntries: ['/quiz'] },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByText('QUIZ_ROUTE_OK')).toBeInTheDocument();
  });

  it('throws when ProgressProvider wraps RouterProvider (regression guard)', () => {
    const router = createMemoryRouter(
      [{ path: 'quiz', element: <QuizProbe /> }],
      { initialEntries: ['/quiz'] },
    );

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      render(
        <ProgressProvider>
          <RouterProvider router={router} />
        </ProgressProvider>,
      ),
    ).toThrow(/useLocation\(\) may be used only in the context of a <Router>/);

    consoleError.mockRestore();
  });
});
