/**
 * 今日の学習タスクコンポーネント
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { generateDailyTasks } from '../../utils/taskGenerator';
import type { DailyTask } from '../../types/tasks';

export const DailyTasks: React.FC = () => {
  const { user } = useAuthStore();
  const { effectiveTheme } = useTheme();
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

  const borderColor = effectiveTheme === 'dark'
    ? 'border-red-500/60'
    : 'border-green-500/50';
  const bgColor = effectiveTheme === 'dark'
    ? 'bg-red-900/10'
    : 'bg-green-900/10';
  const textColor = effectiveTheme === 'dark'
    ? 'text-red-400'
    : 'text-green-400';

  if (loading) {
    return (
      <div className={`rounded-xl border-2 p-6 ${borderColor} ${bgColor}`}>
        <h3 className="text-lg font-bold hud-text mb-4">📝 今日の学習タスク</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-700/30 rounded animate-pulse" />
          ))}
        </div>
      </div>
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
    <div className={`rounded-xl border-2 p-6 ${borderColor} ${bgColor}`}>
      <h3 className="text-lg font-bold hud-text mb-4">📝 今日の学習タスク</h3>
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
                    <span className="font-semibold hud-text text-sm">{task.title}</span>
                  </div>
                  <span className={`text-xs ${textColor}`}>
                    推定 {task.estimatedMinutes}分
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

