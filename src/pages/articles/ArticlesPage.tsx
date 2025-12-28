import { useLearningProgress } from '../../hooks/useLearningProgress';
import { ArticleDashboard } from './components/ArticleDashboard';

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
