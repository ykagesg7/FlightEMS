/**
 * 今日の学習タスクコンポーネント
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import type { DailyTask, TaskType } from '../../../types/tasks';
import { generateDailyTasks } from '../../../utils/taskGenerator';

type DailyTasksProps = {
  variant?: 'card' | 'inline';
  types?: TaskType[];
  limit?: number;
};

const INLINE_TASK_TYPES: TaskType[] = ['review', 'lesson'];

export const DailyTasks: React.FC<DailyTasksProps> = ({
  variant = 'card',
  types,
  limit = 3,
}) => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const typeFilter = types ?? (variant === 'inline' ? INLINE_TASK_TYPES : undefined);
  const typeKey = typeFilter?.join(',') ?? '';

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadTasks() {
      if (!user) {
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await generateDailyTasks(user.id);
        const filtered = typeFilter ? data.filter((task) => typeFilter.includes(task.type)) : data;
        setTasks(filtered.slice(0, limit));
      } catch (err) {
        console.error('学習タスク取得エラー:', err);
        setError('タスクの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [user, limit, typeKey]);

  const borderColor = 'border-green-500/50';

  if (loading) {
    if (variant === 'inline') {
      return (
        <div className="mt-4 space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-gray-700/30 rounded animate-pulse" />
          ))}
        </div>
      );
    }
    return (
      <Card variant="hud" padding="md" className={borderColor}>
        <CardContent>
          <Typography variant="h4" color="hud" className="mb-4">
            今日の学習タスク
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
    return null;
  }

  const list = (
    <div className="space-y-2">
      {tasks.map((task) => (
        <Link
          key={task.id}
          to={task.linkTo}
          className={`
            block rounded-lg border px-3 py-2 transition-all duration-300
            hover:bg-white/5 ${borderColor}
          `}
        >
          <div className="flex items-center justify-between gap-3">
            <Typography variant="body-sm" color="hud" className="font-semibold">
              {task.title}
            </Typography>
            <Typography variant="caption" color="muted" className="shrink-0">
              目安 {task.estimatedMinutes}分
            </Typography>
          </div>
        </Link>
      ))}
    </div>
  );

  if (variant === 'inline') {
    return <div className="mt-4">{list}</div>;
  }

  return (
    <Card variant="hud" padding="md" className={borderColor}>
      <CardContent>
        <Typography variant="h4" color="hud" className="mb-4">
          今日の学習タスク
        </Typography>
        {list}
      </CardContent>
    </Card>
  );
};
