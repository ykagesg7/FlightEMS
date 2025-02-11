import React from 'react';
import { FlightPlan } from '../types';

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
            {flightPlan.arrival && `${flightPlan.arrival.label})`}
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
        <div>
          <dt className="text-sm font-medium text-gray-400">Estimated Arrival Time</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-50">{flightPlan.eta || '--:--'}</dd>
        </div>
      </dl>
    </div>
  );
};

export default FlightSummary; 