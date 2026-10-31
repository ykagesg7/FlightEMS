import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { LoggedInHomeLatestNews } from '@/pages/dashboard/components/LoggedInHomeLatestNews';

const mockUseGuestHomeLatestItems = vi.fn();

vi.mock('@/hooks/useGuestHomeLatestItems', () => ({
  useGuestHomeLatestItems: () => mockUseGuestHomeLatestItems(),
}));

describe('LoggedInHomeLatestNews', () => {
  beforeEach(() => {
    mockUseGuestHomeLatestItems.mockReturnValue({
      items: [
        { id: 'lesson-a', title: '記事A', date: '2026-10-01', href: '/articles/lesson-a' },
        { id: 'lesson-b', title: '記事B', date: '2026-09-01', href: '/articles/lesson-b' },
        { id: 'lesson-c', title: '記事C', date: '2026-08-01', href: '/articles/lesson-c' },
        { id: 'lesson-d', title: '記事D', date: '2026-07-01', href: '/articles/lesson-d' },
      ],
      isLoading: false,
      error: null,
    });
  });

  it('renders three one-line links and view-all to /articles', async () => {
    render(
      <MemoryRouter>
        <LoggedInHomeLatestNews />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-latest-news')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: '最新情報' })).toBeInTheDocument();
    expect(screen.getByTestId('home-latest-news-view-all')).toHaveAttribute('href', '/articles');
    expect(screen.getByRole('link', { name: 'すべて見る' })).toBeInTheDocument();

    const links = screen.getAllByTestId('home-latest-news-item');
    expect(links).toHaveLength(3);
    expect(links.map((el) => el.textContent)).toEqual(['記事A', '記事B', '記事C']);
  });

  it('excludes the lesson banner article id from the list', async () => {
    render(
      <MemoryRouter>
        <LoggedInHomeLatestNews excludeContentId="lesson-a" />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-latest-news-list')).toBeInTheDocument();
    });

    const links = screen.getAllByTestId('home-latest-news-item');
    expect(links).toHaveLength(3);
    expect(links.map((el) => el.getAttribute('data-content-id'))).toEqual([
      'lesson-b',
      'lesson-c',
      'lesson-d',
    ]);
  });

  it('renders nothing on load error', () => {
    mockUseGuestHomeLatestItems.mockReturnValue({
      items: [],
      isLoading: false,
      error: new Error('fail'),
    });

    const { container } = render(
      <MemoryRouter>
        <LoggedInHomeLatestNews />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
