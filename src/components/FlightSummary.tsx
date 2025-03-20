import React from 'react';
import { FlightPlan } from '../types';
import { formatBearing } from '../utils/format';

interface FlightSummaryProps {
  flightPlan: FlightPlan;
}

/**
 * Flight Summary コンポーネント
 * 総距離、ETE、ETAの表示を行う
 */
const FlightSummary: React.FC<FlightSummaryProps> = ({ flightPlan }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-50">Flight Summary</h2>
      <dl className="space-y-4">
        <div className="border-b border-gray-700 pb-2">
          <dt className="text-sm font-medium text-gray-400">Departure</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-50">
            {flightPlan.departure && `${flightPlan.departure.label}`}
          </dd>
        </div>
        <div className="border-b border-gray-700 pb-2">
          <dt className="text-sm font-medium text-gray-400">Arrival</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-50">
            {flightPlan.arrival && `${flightPlan.arrival.label}`}
          </dd>
        </div>
        <div className="border-b border-gray-700 pb-2">
          <dt className="text-sm font-medium text-gray-400">Total Distance</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-50">{flightPlan.totalDistance ? flightPlan.totalDistance.toFixed(1) : '0'} NM</dd>
        </div>
        <div className="border-b border-gray-700 pb-2">
          <dt className="text-sm font-medium text-gray-400">Estimated Time Enroute</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-50">{flightPlan.ete || '00:00'}</dd>
        </div>
        <div className="border-b border-gray-700 pb-2">
          <dt className="text-sm font-medium text-gray-400">Estimated Arrival Time</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-50">{flightPlan.eta || '--:--'}</dd>
        </div>

        {/* ルートセグメント情報の表示 */}
        {flightPlan.routeSegments && flightPlan.routeSegments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-3 text-gray-50">Route Segments</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Route</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Speed</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Bearing</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Alt</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ETA</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {flightPlan.routeSegments.map((segment, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-100">
                        {segment.from} → {segment.to}
                        <div className="text-gray-400 text-xs">{segment.distance?.toFixed(1)} NM</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-100">
                        {segment.speed} kt
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-100">
                        {formatBearing(segment.bearing)}°
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-100">
                        {segment.altitude} ft
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-100">
                        {segment.eta || '--:--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </dl>
    </div>
  );
};

export default FlightSummary; 