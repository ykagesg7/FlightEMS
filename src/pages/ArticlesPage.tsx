import { ArticleDashboard } from '../components/articles/ArticleDashboard';
import { useLearningProgress } from '../hooks/useLearningProgress';

function ArticlesPage() {
  const { learningContents, isLoading } = useLearningProgress();

  return (
    <ArticleDashboard
      learningContents={learningContents}
      isLoading={isLoading}
    />
  );
}

export default ArticlesPage;
