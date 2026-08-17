/**
 * 科目別正答率（通算）の水平棒。レーダーより比較しやすい。
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, Typography } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import { buildSubjectRadarData } from '../../../utils/chartData';

type Row = {
  subject: string;
  accuracyPct: number;
  attemptCount: number;
};

export const SubjectAccuracyChart: React.FC = () => {
  const { user } = useAuthStore();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        const data = await buildSubjectRadarData(user!.id);
        const mapped = data.labels.map((subject, index) => ({
          subject,
          accuracyPct: data.values[index] ?? 0,
          attemptCount: data.attemptCounts[index] ?? 0,
        }));
        setRows(mapped);
      } catch (err) {
        console.error('科目別正答率の取得エラー:', err);
        setRows(null);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [user]);

  const sorted = useMemo(() => {
    if (!rows) return [];
    return [...rows].sort((a, b) => a.accuracyPct - b.accuracyPct);
  }, [rows]);

  if (loading) {
    return (
      <Card variant="hud" padding="md" className="border-green-500/50">
        <CardContent>
          <Typography variant="h4" color="hud" className="mb-4">
            科目別正答率（通算）
          </Typography>
          <div className="h-48 bg-gray-700/30 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!sorted.length) return null;

  return (
    <Card variant="hud" padding="md" className="border-green-500/50">
      <CardContent>
        <Typography variant="h4" color="hud" className="mb-4">
          科目別正答率（通算）
        </Typography>
        <ul className="space-y-3">
          {sorted.map((row) => (
            <li key={row.subject}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="text-sm text-[var(--text-primary)]">{row.subject}</span>
                <span className="shrink-0 font-mono text-sm text-brand-primary">
                  {row.accuracyPct}%（{row.attemptCount}問）
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700/30">
                <div
                  className="h-full rounded-full bg-brand-primary"
                  style={{ width: `${Math.max(0, Math.min(100, row.accuracyPct))}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
