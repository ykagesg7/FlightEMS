import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { GoogleAnalyticsTracker } from '../../components/GoogleAnalyticsTracker';

const sendGa4PageView = vi.fn();

vi.mock('../../lib/googleAnalytics', () => ({
  getGa4MeasurementId: () => 'G-TEST123',
  sendGa4PageView: (...args: unknown[]) => sendGa4PageView(...args),
}));

function renderTracker(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/*',
        element: (
          <>
            <GoogleAnalyticsTracker />
            <div data-testid="page" />
          </>
        ),
      },
    ],
    { initialEntries: [initialPath] },
  );
  return render(<RouterProvider router={router} />);
}

describe('GoogleAnalyticsTracker', () => {
  beforeEach(() => {
    sendGa4PageView.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends page_view exactly once on initial mount', async () => {
    renderTracker('/');

    await waitFor(() => {
      expect(sendGa4PageView).toHaveBeenCalledTimes(1);
    });
    expect(sendGa4PageView).toHaveBeenCalledWith('G-TEST123', '/');
  });

  it('sends page_view again with new path when route changes', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/*',
          element: (
            <>
              <GoogleAnalyticsTracker />
              <div data-testid="page" />
            </>
          ),
        },
      ],
      { initialEntries: ['/'] },
    );
    const { unmount } = render(<RouterProvider router={router} />);

    await waitFor(() => expect(sendGa4PageView).toHaveBeenCalledTimes(1));

    await router.navigate('/articles/IF-1-3_IMC_Scan');

    await waitFor(() => expect(sendGa4PageView).toHaveBeenCalledTimes(2));
    expect(sendGa4PageView).toHaveBeenLastCalledWith(
      'G-TEST123',
      '/articles/IF-1-3_IMC_Scan',
    );

    unmount();
  });

  it('includes search in page_path on route change', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/*',
          element: (
            <>
              <GoogleAnalyticsTracker />
              <div />
            </>
          ),
        },
      ],
      { initialEntries: ['/articles?utm=1'] },
    );
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(sendGa4PageView).toHaveBeenCalledWith('G-TEST123', '/articles?utm=1');
    });
  });
});
