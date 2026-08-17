/**
 * 学習履歴カレンダー（ヒートマップ）
 * GitHubスタイル: 縦軸=曜日、横軸=週。日付は JST 暦日。
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, Typography } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import type { DailyStudyStat } from '../../../utils/heatmapData';
import { buildDailyStudyStats, HEATMAP_INTENSITY_LEGEND } from '../../../utils/heatmapData';
import { addJstCalendarDays, formatJstYmd, jstWeekday } from '../../../utils/jstDate';

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
const CELL_SIZE = 14;
const WEEKS = 13;
const LABEL_WIDTH = 28;
const MONTH_LABEL_HEIGHT = 18;

function formatDateLabel(ymd: string): string {
  const [, month, day] = ymd.split('-');
  return `${Number(month)}/${Number(day)}`;
}

function intensityLabel(minutes: number): string {
  const match = HEATMAP_INTENSITY_LEGEND.find((item) => {
    if (item.intensity === 0) return minutes === 0;
    if (item.intensity === 1) return minutes >= 1 && minutes <= 15;
    if (item.intensity === 2) return minutes >= 16 && minutes <= 45;
    return minutes >= 46;
  });
  return match?.label ?? `${minutes}分`;
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

    void loadStats();
  }, [user]);

  const borderColor = 'border-green-500/50';
  const todayStr = formatJstYmd(new Date());

  const { grid, monthLabels } = useMemo(() => {
    const todayYmd = todayStr;
    const startYmd = addJstCalendarDays(todayYmd, -90);
    const startWeekday = jstWeekday(startYmd);
    const firstSunday = addJstCalendarDays(startYmd, -startWeekday);

    const statsMap = new Map(stats.map((s) => [s.date, s]));
    const gridData: (DailyStudyStat & { isFuture?: boolean })[][] = [];
    const months: { weekIndex: number; label: string }[] = [];
    let lastMonth = -1;

    for (let weekIndex = 0; weekIndex < WEEKS; weekIndex++) {
      const weekRow: (DailyStudyStat & { isFuture?: boolean })[] = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const dateStr = addJstCalendarDays(firstSunday, weekIndex * 7 + dayOfWeek);
        const isFuture = dateStr > todayYmd;
        const stat = statsMap.get(dateStr);
        weekRow.push(
          stat
            ? { ...stat, isFuture }
            : { date: dateStr, minutes: 0, intensity: 0, sessionCount: 0, isFuture },
        );

        const month = Number(dateStr.slice(5, 7));
        if (month !== lastMonth && dateStr <= todayYmd) {
          lastMonth = month;
          months.push({ weekIndex, label: `${month}月` });
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

  const hoveredStat = hoveredDate ? stats.find((s) => s.date === hoveredDate) : null;
  const svgWidth = LABEL_WIDTH + WEEKS * CELL_SIZE + 8;
  const svgHeight = MONTH_LABEL_HEIGHT + 7 * CELL_SIZE + 8;

  return (
    <Card variant="hud" padding="md" className={borderColor}>
      <CardContent>
        <Typography variant="h4" color="hud" className="mb-2">
          過去90日の学習履歴
        </Typography>
        <Typography variant="caption" color="muted" className="mb-4 block">
          縦軸: 曜日（日〜土）、横軸: 週（左が古い、右が新しい）。日付は JST。
        </Typography>

        <div className="mb-3 flex flex-wrap items-center gap-3">
          {HEATMAP_INTENSITY_LEGEND.map((item) => (
            <div key={item.intensity} className="flex items-center gap-1">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: getIntensityColor(item.intensity) }}
              />
              <Typography variant="caption" color="muted">
                {item.label}
              </Typography>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <svg
            width="100%"
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="min-w-[280px]"
            role="img"
            aria-label="過去90日の学習時間ヒートマップ（JST）"
          >
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

            {grid.map((week, weekIndex) =>
              week.map((day, dayOfWeek) => {
                const x = LABEL_WIDTH + weekIndex * CELL_SIZE;
                const y = MONTH_LABEL_HEIGHT + dayOfWeek * CELL_SIZE;
                const label = day.isFuture
                  ? `${formatDateLabel(day.date)} 未来`
                  : `${formatDateLabel(day.date)} ${day.minutes}分（${intensityLabel(day.minutes)}）`;

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
                    tabIndex={day.isFuture ? undefined : 0}
                    role="img"
                    aria-label={label}
                    onMouseEnter={() => !day.isFuture && setHoveredDate(day.date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onFocus={() => !day.isFuture && setHoveredDate(day.date)}
                    onBlur={() => setHoveredDate(null)}
                    className={day.isFuture ? undefined : 'cursor-pointer transition-all'}
                  />
                );
              }),
            )}
          </svg>
        </div>

        {hoveredStat && hoveredDate && (
          <div className="mt-4 rounded-lg border border-gray-700 bg-[color:var(--panel)] p-3">
            <Typography variant="body-sm" color="hud" className="font-semibold">
              {formatDateLabel(hoveredDate)}
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
