import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import ArticleDetailPage from '../../../pages/articles/ArticleDetailPage';
import { WITHDRAWN_ARTICLE_MESSAGE } from '../../../constants/withdrawnArticleIds';
import articleMetas from 'virtual:articles-index';
import { articleHrefForContentId } from '../../../utils/articleCanonicalPath';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('../../../hooks/useArticleStats', () => ({
  useArticleStats: () => ({
    comments: {},
    isLoading: false,
    loadArticleStats: vi.fn(),
    loadComments: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  }),
}));

vi.mock('../../../hooks/useLearningProgress', () => ({
  useLearningProgress: () => ({ learningContents: [] }),
}));

vi.mock('../../../hooks/useArticleProgress', () => ({
  useArticleProgress: () => ({ getArticleProgress: () => undefined }),
}));

function LearningToArticleRedirect() {
  const { contentId } = useParams<{ contentId: string }>();
  if (!contentId) return <Navigate to="/articles" replace />;
  return <Navigate to={articleHrefForContentId(contentId, articleMetas)} replace />;
}

function renderArticleAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/learning/:contentId" element={<LearningToArticleRedirect />} />
        <Route path="/articles/:contentId" element={<ArticleDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('withdrawn article detail routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['canonical slug', '/articles/thinking-vs-worrying-master'],
    ['legacy basename', '/articles/2.1.1_Thinking'],
    ['learning content id', '/learning/2.1.1_Thinking'],
  ])('shows withdrawn notice for %s', async (_label, path) => {
    renderArticleAt(path);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(WITHDRAWN_ARTICLE_MESSAGE);
    });
    expect(screen.queryByText(/の読み込みに失敗しました/)).not.toBeInTheDocument();
  });

  it('shows withdrawn notice for second sample article via canonical slug', async () => {
    renderArticleAt('/articles/concrete-abstract');

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(WITHDRAWN_ARTICLE_MESSAGE);
    });
  });
});