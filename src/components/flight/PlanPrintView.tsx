import React, { useMemo } from 'react';
import { FlightPlan } from '../../types';

interface PlanPrintViewProps {
  flightPlan: FlightPlan;
}

const numberOrDash = (value: number | undefined, digits = 1) =>
  typeof value === 'number' && !Number.isNaN(value) ? value.toFixed(digits) : '--';

const klb = (value: number | undefined) =>
  typeof value === 'number' && !Number.isNaN(value) ? (value / 1000).toFixed(1) : '--';

export const PlanPrintView: React.FC<PlanPrintViewProps> = ({ flightPlan }) => {
  const routePoints = useMemo(() => {
    const points: Array<[number, number]> = [];
    if (flightPlan.departure) points.push([flightPlan.departure.longitude, flightPlan.departure.latitude]);
    flightPlan.waypoints.forEach((w) => points.push([w.longitude, w.latitude]));
    if (flightPlan.arrival) points.push([flightPlan.arrival.longitude, flightPlan.arrival.latitude]);
    return points;
  }, [flightPlan]);

  const svgData = useMemo(() => {
    if (routePoints.length < 2) return null;
    const lons = routePoints.map((p) => p[0]);
    const lats = routePoints.map((p) => p[1]);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const padding = 5;
    const width = 100;
    const height = 100;
    const lonRange = maxLon - minLon || 1;
    const latRange = maxLat - minLat || 1;

    const toXY = (lon: number, lat: number) => {
      const x = ((lon - minLon) / lonRange) * (width - padding * 2) + padding;
      const y = height - (((lat - minLat) / latRange) * (height - padding * 2) + padding);
      return { x, y };
    };

    const points = routePoints.map(([lon, lat]) => toXY(lon, lat));
    const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

    return { points, polyline, viewBox: `0 0 ${width} ${height}` };
  }, [routePoints]);

  return (
    <div className="print-wrapper print-show">
      <div className="print-grid">
        {/* 1ページ目: NavLog */}
        <section className="print-page">
          <div className="print-section">
            <h2>NavLog</h2>
            <table className="print-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>From</th>
                  <th>To</th>
                  <th>CAS</th>
                  <th>BRG</th>
                  <th>ALT</th>
                  <th>DIST</th>
                  <th>ETA</th>
                  <th>Dur</th>
                  <th>FuelUsed</th>
                  <th>FuelRem(k)</th>
                  <th>Freq</th>
                </tr>
              </thead>
              <tbody>
                {flightPlan.routeSegments?.length ? (
                  flightPlan.routeSegments.map((seg, idx) => (
                    <tr key={`${seg.from}-${seg.to}-${idx}`}>
                      <td>{idx + 1}</td>
                      <td>{seg.from}</td>
                      <td>{seg.to}</td>
                      <td className="num">{seg.speed}</td>
                      <td className="num">{seg.bearing.toFixed(0)}</td>
                      <td className="num">{seg.altitude}</td>
                      <td className="num">{seg.distance.toFixed(1)}</td>
                      <td className="num">{seg.eta}</td>
                      <td className="num">{seg.duration || '--'}</td>
                      <td className="num">{numberOrDash(seg.fuelUsedLb, 0)}</td>
                      <td className="num">{klb(seg.fuelRemainingLb)}</td>
                      <td>{seg.frequency || '--'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="print-placeholder">
                      ルートセグメントがありません（出発/到着/ウェイポイントを設定してください）
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2ページ目: 経路図 */}
        <section className="print-page print-map-page">
          <div className="print-section">
            <h2>Route Sketch</h2>
          </div>
          {svgData ? (
            <svg viewBox={svgData.viewBox} className="print-map" preserveAspectRatio="xMidYMid meet">
              <polyline points={svgData.polyline} fill="none" stroke="black" strokeWidth="0.6" />
              {svgData.points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={1.2}
                    fill={idx === 0 ? 'green' : idx === svgData.points.length - 1 ? 'red' : 'black'}
                  />
                  <text x={p.x + 1.5} y={p.y - 1} fontSize="3">
                    {idx + 1}
                  </text>
                </g>
              ))}
            </svg>
          ) : (
            <p className="print-placeholder">十分なポイントがありません</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default PlanPrintView;

