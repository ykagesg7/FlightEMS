import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useLearningProgress } from '../../hooks/useLearningProgress';

interface BasicStats {
  totalContents: number;
  completedContents: number;
  totalStudyTime: number;
  averageProgress: number;
}

const BasicLearningDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { learningContents, userProgress, isLoading } = useLearningProgress();
  const [stats, setStats] = useState<BasicStats>({
    totalContents: 0,
    completedContents: 0,
    totalStudyTime: 0,
    averageProgress: 0
  });

  useEffect(() => {
    if (learningContents.length > 0) {
      const totalContents = learningContents.length;
      const progressValues = Object.values(userProgress);
      const completedContents = progressValues.filter(p => p.completed).length;
      const averageProgress = progressValues.length > 0
        ? Math.round(progressValues.reduce((sum, p) => sum + p.progress_percentage, 0) / progressValues.length)
        : 0;

      setStats({
        totalContents,
        completedContents,
        totalStudyTime: 0, // 簡略化
        averageProgress
      });
    }
  }, [learningContents, userProgress]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">学習データを読み込んでいます...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 rounded-lg bg-gray-50">
        <p className="text-center text-gray-600 dark:text-gray-400">
          ログインすると学習進捗が表示されます
        </p>
      </div>
    );
  }

  const completionRate = stats.totalContents > 0
    ? Math.round((stats.completedContents / stats.totalContents) * 100)
    : 0;

  return (
    <div className="p-6 rounded-lg bg-white shadow-lg mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        📊 学習進捗ダッシュボード
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-blue-50">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalContents}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">利用可能記事</div>
        </div>

        <div className="p-4 rounded-lg bg-green-50">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.completedContents}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">完了記事</div>
        </div>

        <div className="p-4 rounded-lg bg-purple-50">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {completionRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">完了率</div>
        </div>

        <div className="p-4 rounded-lg bg-orange-50">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.averageProgress}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">平均進捗</div>
        </div>
      </div>

      {user && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          ユーザー: {user.email}
        </div>
      )}
    </div>
  );
};

export default BasicLearningDashboard;
