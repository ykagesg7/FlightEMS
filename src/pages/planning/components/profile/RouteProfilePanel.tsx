import React, { useMemo } from 'react';
import type { FlightPlan } from '../../../../types';
import { buildRouteProfileSamples } from '../../profile/buildRouteSamples';

interface RouteProfilePanelProps {
  flightPlan: FlightPlan;
  embedded?: boolean;
}

export const RouteProfilePanel: React.FC<RouteProfilePanelProps> = ({ flightPlan, embedded = false }) => {
  const samples = useMemo(() => buildRouteProfileSamples(flightPlan), [flightPlan]);
  const maxDistance = Math.max(...samples.map((sample) => sample.distanceNm), 1);
  const maxAltitude = Math.max(...samples.map((sample) => sample.altitudeFt), flightPlan.altitude || 1);
  const points = samples.map((sample) => {
    const x = 8 + (sample.distanceNm / maxDistance) * 84;
    const y = 88 - (sample.altitudeFt / maxAltitude) * 70;
    return { ...sample, x, y };
  });

  return (
    <div className={embedded ? '' : 'rounded-lg border border-whiskyPapa-yellow/20 bg-gray-900/70 p-4'}>
      {!embedded ? (
        <>
          <h3 className="text-lg font-semibold text-whiskyPapa-yellow">Route Profile</h3>
          <p className="mt-1 text-xs text-gray-400">計画高度・TOC/TOD・ウェイポイントを距離軸で確認します。</p>
        </>
      ) : (
        <p className="text-xs text-gray-400">計画高度と TOC/TOD。地形標高は含みません。</p>
      )}
      {points.length > 1 ? (
        <div className="mt-4 overflow-x-auto">
          <svg viewBox="0 0 100 100" className="h-52 min-w-[420px] rounded border border-gray-700 bg-black/30">
            <line x1="8" y1="88" x2="92" y2="88" stroke="currentColor" className="text-gray-600" strokeWidth="0.4" />
            <line x1="8" y1="12" x2="8" y2="88" stroke="currentColor" className="text-gray-600" strokeWidth="0.4" />
            <polyline
              points={points.map((point) => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke="#39FF14"
              strokeWidth="1.2"
            />
            {points.map((point) => (
              <g key={`${point.label}-${point.distanceNm}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={point.marker ? 2.2 : 1.5}
                  fill={point.marker === 'toc' ? '#7DAAF7' : point.marker === 'tod' ? '#ffaa00' : '#FFD700'}
                />
                <text x={point.x + 1.5} y={point.y - 2} fontSize="3" fill="white">{point.label}</text>
              </g>
            ))}
          </svg>
          <div className="mt-3 grid gap-2 text-xs text-gray-300">
            {samples.map((sample) => (
              <div key={`${sample.label}-${sample.distanceNm}`} className="rounded border border-gray-700 bg-black/20 px-3 py-2">
                <span className="font-semibold text-gray-100">{sample.label}</span>
                <span className="ml-2">{sample.distanceNm.toFixed(1)} nm / {sample.altitudeFt.toFixed(0)} ft</span>
                {sample.marker ? <span className="ml-2 uppercase text-whiskyPapa-yellow">{sample.marker}</span> : null}
                {sample.windLabel ? <span className="ml-2">Wind {sample.windLabel}</span> : null}
                {sample.frequency ? <span className="ml-2">Freq {sample.frequency}</span> : null}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-400">ルートセグメント生成後に断面ビューを表示します。</p>
      )}
    </div>
  );
};
