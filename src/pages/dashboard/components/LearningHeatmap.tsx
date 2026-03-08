/**
 * 学習履歴カレンダー（ヒートマップ）コンポーネント
 * GitHubスタイル: 縦軸=曜日、横軸=週のカレンダー型表示
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, Typography } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import type { DailyStudyStat } from '../../../utils/heatmapData';
import { buildDailyStudyStats } from '../../../utils/heatmapData';

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
const CELL_SIZE = 14;
const WEEKS = 13;
const LABEL_WIDTH = 28;
const MONTH_LABEL_HEIGHT = 18;

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export const LearningHeatmap: React.FC = () => {
  const { user } = useAuthStore();
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

  const borderColor = 'border-green-500/50';
  const todayStr = formatDate(new Date());

  // 縦=曜日(日〜土)、横=週(左=古い、右=新しい)のグリッドを構築
  const { grid, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDate = new Date(today);
    firstDate.setDate(firstDate.getDate() - 90);
    const firstSunday = new Date(firstDate);
    firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());

    const gridData: (DailyStudyStat & { isFuture?: boolean })[][] = [];
    const months: { weekIndex: number; label: string }[] = [];
    let lastMonth = -1;

    for (let weekIndex = 0; weekIndex < WEEKS; weekIndex++) {
      const weekRow: (DailyStudyStat & { isFuture?: boolean })[] = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const date = new Date(firstSunday);
        date.setDate(firstSunday.getDate() + weekIndex * 7 + dayOfWeek);
        const dateStr = formatDate(date);
        const isFuture = dateStr > todayStr;
        const stat = stats.find(s => s.date === dateStr);
        weekRow.push(
          stat
            ? { ...stat, isFuture }
            : { date: dateStr, minutes: 0, intensity: 0, sessionCount: 0, isFuture },
        );

        const m = date.getMonth();
        if (m !== lastMonth && dateStr <= todayStr) {
          lastMonth = m;
          months.push({ weekIndex, label: `${m + 1}月` });
        }
      }
      gridData.push(weekRow);
    }

    return { grid: gridData, monthLabels: months };
  }, [stats, todayStr]);

  const getIntensityColor = (intensity: DailyStudyStat['intensity'], isFuture?: boolean) => {
    if (isFuture) return 'rgba(100, 100, 100, 0.15)';
    const colors = [
      'rgba(57, 255, 20, 0.1)',
      'rgba(57, 255, 20, 0.3)',
      'rgba(57, 255, 20, 0.6)',
      'rgba(57, 255, 20, 0.9)',
    ];
    return colors[intensity];
  };

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
    return null;
  }

  const hoveredStat = hoveredDate ? stats.find(s => s.date === hoveredDate) : null;
  const svgWidth = LABEL_WIDTH + WEEKS * CELL_SIZE + 8;
  const svgHeight = MONTH_LABEL_HEIGHT + 7 * CELL_SIZE + 8;

  return (
    <Card variant="hud" padding="md" className={borderColor}>
      <CardContent>
        <Typography variant="h4" color="hud" className="mb-2">
          過去90日の学習履歴
        </Typography>
        <Typography variant="caption" color="muted" className="mb-4 block">
          縦軸: 曜日（日〜土）、横軸: 週（左が古い、右が新しい）
        </Typography>

        {/* 凡例 */}
        <div className="flex items-center justify-between mb-3">
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
          <svg
            width="100%"
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="min-w-[280px]"
          >
            {/* 月ラベル */}
            {monthLabels.map(({ weekIndex, label }) => (
              <text
                key={`month-${weekIndex}`}
                x={LABEL_WIDTH + weekIndex * CELL_SIZE}
                y={12}
                className="fill-[color:var(--text-muted)]"
                style={{ fontSize: 10 }}
              >
                {label}
              </text>
            ))}

            {/* 曜日ラベル */}
            {WEEKDAY_LABELS.map((label, dayOfWeek) => (
              <text
                key={`day-${dayOfWeek}`}
                x={LABEL_WIDTH - 4}
                y={MONTH_LABEL_HEIGHT + dayOfWeek * CELL_SIZE + CELL_SIZE - 3}
                textAnchor="end"
                className="fill-[color:var(--text-muted)]"
                style={{ fontSize: 10 }}
              >
                {label}
              </text>
            ))}

            {/* セル */}
            {grid.map((week, weekIndex) =>
              week.map((day, dayOfWeek) => {
                const x = LABEL_WIDTH + weekIndex * CELL_SIZE;
                const y = MONTH_LABEL_HEIGHT + dayOfWeek * CELL_SIZE;

                return (
                  <rect
                    key={`${day.date}-${weekIndex}-${dayOfWeek}`}
                    x={x}
                    y={y}
                    width={CELL_SIZE - 1}
                    height={CELL_SIZE - 1}
                    rx="2"
                    fill={getIntensityColor(day.intensity, day.isFuture)}
                    stroke={hoveredDate === day.date ? '#39FF14' : 'transparent'}
                    strokeWidth="2"
                    onMouseEnter={() => !day.isFuture && setHoveredDate(day.date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    className="cursor-pointer transition-all"
                  />
                );
              }),
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
              {typeof hoveredStat.sessionCount === 'number' && hoveredStat.sessionCount > 0 && (
                <>（{hoveredStat.sessionCount}セッション）</>
              )}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
