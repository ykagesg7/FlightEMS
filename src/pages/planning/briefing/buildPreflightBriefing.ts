import type { FlightPlan } from '../../../types';
import type { PreflightBriefing } from './briefingTypes';

function numberLabel(value: number | undefined, unit: string, digits = 1): string {
  return typeof value === 'number' && Number.isFinite(value) ? `${value.toFixed(digits)} ${unit}` : '--';
}

export function buildPreflightBriefing(plan: FlightPlan): PreflightBriefing {
  const routeSummary = [
    { label: '出発地', value: plan.departure?.label ?? '--', status: plan.departure ? 'ok' as const : 'warning' as const },
    { label: '到着地', value: plan.arrival?.label ?? '--', status: plan.arrival ? 'ok' as const : 'warning' as const },
    { label: 'ウェイポイント', value: `${plan.waypoints.length} 件`, status: 'info' as const },
    { label: '総距離', value: numberLabel(plan.totalDistance, 'nm'), status: 'info' as const },
    { label: 'ETE / ETA', value: `${plan.ete || '--'} / ${plan.eta || '--'}`, status: 'info' as const },
    { label: '計画高度', value: numberLabel(plan.altitude, 'ft', 0), status: 'info' as const },
  ];

  const navLog = plan.routeSegments.length
    ? plan.routeSegments.map((segment, index) => ({
      label: `${index + 1}. ${segment.from} -> ${segment.to}`,
      value: `${segment.bearing.toFixed(0)}° / ${segment.distance.toFixed(1)}nm / ${segment.duration || '--'} / ${segment.frequency || 'Freq --'}`,
      status: 'ok' as const,
    }))
    : [{ label: 'NavLog', value: '出発地・到着地・ウェイポイント設定後に生成されます', status: 'warning' as const }];

  const fuel = [
    { label: '初期燃料', value: numberLabel(plan.initialFuelLb, 'lb', 0), status: 'info' as const },
    { label: 'Taxi / Reserve', value: `${numberLabel(plan.taxiFuelLb, 'lb', 0)} / ${numberLabel(plan.reserveFuelLb, 'lb', 0)}`, status: 'info' as const },
    { label: '巡航FF', value: numberLabel(plan.cruiseFuelFlowLbPerHr, 'lb/hr', 0), status: 'info' as const },
    { label: '使用量 / 残量', value: `${numberLabel(plan.totalFuelUsedLb, 'lb', 0)} / ${numberLabel(plan.totalFuelRemainingLb, 'lb', 0)}`, status: 'info' as const },
  ];

  const weatherAndNotam = [
    { label: 'METAR/TAF', value: '地図の空港ポップアップで出発地・到着地を確認', status: 'info' as const },
    { label: 'SWIM NOTAM', value: '地図の空港/NAVAIDポップアップから有効NOTAMを確認', status: 'info' as const },
    { label: '上層風', value: plan.useOpenMeteoWind ? 'Open-Meteo風を計画計算に反映' : '未反映（必要に応じて計画タブで有効化）', status: 'info' as const },
  ];

  return {
    routeSummary,
    navLog,
    fuel,
    weatherAndNotam,
    limitations: [
      'Flight AcademyのPlanning/Debriefは学習・事前検討・飛行後解析向けの参考表示です。',
      '実運航では最新AIP、公式NOTAM、航空気象、機体性能表、運航者手順を必ず確認してください。',
    ],
  };
}
