/**
 * 科目別レーダーチャートコンポーネント
 */

import { Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, RadialLinearScale, Tooltip } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import { useAuthStore } from '../../stores/authStore';
import { buildSubjectRadarData } from '../../utils/chartData';
import type { SubjectRadarData } from '../../utils/chartData';
import { Card, CardContent, Typography } from '../ui';

// Chart.jsコンポーネントの登録
ChartJS.register(
  RadialLinearScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export const SubjectRadarChart: React.FC = () => {
  const { user } = useAuthStore();
  const [chartData, setChartData] = useState<SubjectRadarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadChartData() {
      try {
        setLoading(true);
        setError(null);
        const data = await buildSubjectRadarData(user.id);
        setChartData(data);
      } catch (err) {
        console.error('レーダーチャートデータ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    loadChartData();
  }, [user]);

  const borderColor = 'border-green-500/50';
  const bgColor = 'bg-green-900/10';
  const chartColor = 'rgba(57, 255, 20, 0.6)'; // HUD green (#39FF14)
  const chartBorderColor = 'rgb(57, 255, 20)';

  if (loading) {
    return (
      <Card variant="hud" padding="md" className={borderColor}>
        <CardContent>
          <Typography variant="h4" color="hud" className="mb-4">
            科目別理解度
          </Typography>
          <div className="h-64 bg-gray-700/30 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error || !chartData) {
    return null; // エラーまたはデータがない場合は非表示
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: '理解度 (%)',
        data: chartData.values,
        backgroundColor: chartColor,
        borderColor: chartBorderColor,
        borderWidth: 2,
        pointBackgroundColor: chartBorderColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: chartBorderColor,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          color: 'rgba(57, 255, 20, 0.8)',
          backdropColor: 'transparent',
        },
        grid: {
          color: 'rgba(57, 255, 20, 0.2)',
        },
        pointLabels: {
          color: 'rgba(57, 255, 20, 0.9)',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: { parsed: { r: number } }) => {
            return `理解度: ${context.parsed.r}%`;
          },
        },
      },
    },
  };

  return (
    <Card variant="hud" padding="md" className={borderColor}>
      <CardContent>
        <Typography variant="h4" color="hud" className="mb-4">
          科目別理解度
        </Typography>
        <div className="h-64">
          <Radar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

