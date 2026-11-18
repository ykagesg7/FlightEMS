import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ArticleDetailRoute from '../../../pages/articles/ArticleDetailRoute';

describe('ArticleDetailRoute', () => {
  it('redirects legacy filename params during render', async () => {
    render(
      <MemoryRouter initialEntries={['/articles/CPL-Hub-Navigation']}>
        <Routes>
          <Route path="/articles/:contentId" element={<ArticleDetailRoute />} />
          <Route path="/articles/cpl-hub-navigation" element={<div data-testid="canonical" />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('canonical')).toBeInTheDocument();
    });
  });
});