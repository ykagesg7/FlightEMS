/**
 * 学習履歴カレンダー（ヒートマップ）コンポーネント
 * GitHubスタイルのヒートマップ表示
 */

import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import type { DailyStudyStat } from '../../utils/heatmapData';
import { buildDailyStudyStats } from '../../utils/heatmapData';
import { Card, CardContent, Typography } from '../ui';

export const LearningHeatmap: React.FC = () => {
  const { user } = useAuthStore();
  const { effectiveTheme } = useTheme();
  const [stats, setStats] = useState<DailyStudyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadStats() {
      try {
        setLoading(true);
        setError(null);
        const data = await buildDailyStudyStats(user!.id, 90);
        setStats(data);
      } catch (err) {
        console.error('ヒートマップデータ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user]);

  const borderColor = effectiveTheme === 'dark'
    ? 'border-red-500/60'
    : 'border-green-500/50';
  const bgColor = effectiveTheme === 'dark'
    ? 'bg-red-900/10'
    : 'bg-green-900/10';

  // 強度に応じた色を取得
  const getIntensityColor = (intensity: DailyStudyStat['intensity']) => {
    const colors = effectiveTheme === 'dark'
      ? [
        'rgba(239, 68, 68, 0.1)',   // 0: なし
        'rgba(239, 68, 68, 0.3)',   // 1: 軽い
        'rgba(239, 68, 68, 0.6)',   // 2: 中
        'rgba(239, 68, 68, 0.9)',   // 3: 高
      ]
      : [
        'rgba(57, 255, 20, 0.1)',   // 0: なし (#39FF14)
        'rgba(57, 255, 20, 0.3)',   // 1: 軽い
        'rgba(57, 255, 20, 0.6)',   // 2: 中
        'rgba(57, 255, 20, 0.9)',   // 3: 高
      ];
    return colors[intensity];
  };

  // 週ごとにデータをグループ化（過去13週分）
  const weeks: DailyStudyStat[][] = [];
  const today = new Date();

  // 過去90日間（約13週）のデータを週ごとに分割
  for (let weekIndex = 0; weekIndex < 13; weekIndex++) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (weekIndex * 7 + 6));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() - (weekIndex * 7));
    weekEnd.setHours(23, 59, 59, 999);

    const weekData: DailyStudyStat[] = [];
    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + dayOffset);
      const dateStr = formatDate(day);
      const stat = stats.find(s => s.date === dateStr);
      weekData.push(stat || { date: dateStr, minutes: 0, intensity: 0 });
    }
    weeks.push(weekData);
  }

  if (loading) {
    return (
      <Card variant="hud" padding="md" className={borderColor}>
        <CardContent>
          <Typography variant="h4" color="hud" className="mb-4">
            過去90日の学習履歴
          </Typography>
          <div className="h-32 bg-gray-700/30 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error || stats.length === 0) {
    return null; // エラーまたはデータがない場合は非表示
  }

  const hoveredStat = hoveredDate ? stats.find(s => s.date === hoveredDate) : null;

  return (
    <Card variant="hud" padding="md" className={borderColor}>
      <CardContent>
        <Typography variant="h4" color="hud" className="mb-4">
          過去90日の学習履歴
        </Typography>

        {/* 凡例 */}
        <div className="flex items-center justify-between mb-4">
          <Typography variant="caption" color="muted">
            学習時間が少ない
          </Typography>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getIntensityColor(0) }} />
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getIntensityColor(1) }} />
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getIntensityColor(2) }} />
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getIntensityColor(3) }} />
          </div>
          <Typography variant="caption" color="muted">
            学習時間が多い
          </Typography>
        </div>

        {/* ヒートマップ */}
        <div className="overflow-x-auto">
          <svg width="100%" height="120" viewBox="0 0 800 120" className="min-w-[600px]">
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const x = weekIndex * 14 + 20;
                const y = dayIndex * 14 + 20;

                return (
                  <rect
                    key={`${day.date}-${weekIndex}-${dayIndex}`}
                    x={x}
                    y={y}
                    width="12"
                    height="12"
                    rx="2"
                    fill={getIntensityColor(day.intensity)}
                    stroke={hoveredDate === day.date ? (effectiveTheme === 'dark' ? '#ef4444' : '#39FF14') : 'transparent'}
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredDate(day.date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    className="cursor-pointer transition-all"
                  />
                );
              })
            )}
          </svg>
        </div>

        {/* ツールチップ */}
        {hoveredStat && hoveredDate && (
          <div className="mt-4 p-3 rounded-lg bg-[color:var(--panel)] border border-gray-700">
            <Typography variant="body-sm" color="hud" className="font-semibold">
              {formatDateLabel(parseDate(hoveredDate))}
            </Typography>
            <Typography variant="caption" color="muted">
              {hoveredStat.minutes}分 学習
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * 日付をYYYY-MM-DD形式からDateオブジェクトに変換
 */
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 日付を表示用ラベルに変換（例: "1月1日"）
 */
function formatDateLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 日付をYYYY-MM-DD形式に変換
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

