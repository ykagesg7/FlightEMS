/**
 * 今日の学習タスクコンポーネント
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { generateDailyTasks } from '../../utils/taskGenerator';
import type { DailyTask } from '../../types/tasks';
import { Card, CardContent, Typography } from '../ui';

export const DailyTasks: React.FC = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadTasks() {
      try {
        setLoading(true);
        setError(null);
        const data = await generateDailyTasks(user.id);
        setTasks(data);
      } catch (err) {
        console.error('学習タスク取得エラー:', err);
        setError('タスクの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [user]);

  const borderColor = 'border-green-500/50';
  const bgColor = 'bg-green-900/10';
  const textColor = 'text-green-400';

  if (loading) {
    return (
      <Card variant="hud" padding="md" className={borderColor}>
        <CardContent>
          <Typography variant="h4" color="hud" className="mb-4">
            📝 今日の学習タスク
          </Typography>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-700/30 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || tasks.length === 0) {
    return null; // エラーまたはタスクがない場合は非表示
  }

  const getTaskIcon = (type: DailyTask['type']) => {
    switch (type) {
      case 'weakness':
        return '🎯';
      case 'review':
        return '🔄';
      case 'lesson':
        return '📚';
      default:
        return '✓';
    }
  };

  return (
    <Card variant="hud" padding="md" className={borderColor}>
      <CardContent>
        <Typography variant="h4" color="hud" className="mb-4">
          📝 今日の学習タスク
        </Typography>
        <div className="space-y-3">
          {tasks.map((task) => (
            <Link
              key={task.id}
              to={task.linkTo}
              className={`
                block p-4 rounded-lg border transition-all duration-300
                hover:scale-[1.02] hover:shadow-lg
                ${task.completed
                  ? 'opacity-50 cursor-default'
                  : `${borderColor} hover:bg-white/5`
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{getTaskIcon(task.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {task.completed && (
                        <span className="text-sm">✓</span>
                      )}
                      <Typography variant="body-sm" color="hud" className="font-semibold">
                        {task.title}
                      </Typography>
                    </div>
                    <Typography variant="caption" color="hud">
                      推定 {task.estimatedMinutes}分
                    </Typography>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

