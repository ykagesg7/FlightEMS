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
  // 所要時間を計算して「hh:mm:ss」形式でフォーマットする関数
  const formatDuration = (distance?: number, speed?: number): string => {
    if (!distance || !speed || speed === 0) return '--:--:--';
    
    // 距離（NM）÷ 速度（kt）で時間（時間）を計算
    const hours = distance / speed;
    const totalSeconds = Math.round(hours * 3600);
    
    // hh:mm:ss 形式
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-700">フライトサマリー</h2>
      <div className="space-y-3 md:space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-2 md:p-3 rounded-md">
            <div className="text-xs text-gray-500">合計距離</div>
            <div className="text-sm md:text-base font-medium">
              {flightPlan.totalDistance ? `${flightPlan.totalDistance.toFixed(1)} nm` : '--'}
            </div>
          </div>
          <div className="bg-gray-50 p-2 md:p-3 rounded-md">
            <div className="text-xs text-gray-500">予想飛行時間</div>
            <div className="text-sm md:text-base font-medium">
              {flightPlan.ete || '--'}
            </div>
          </div>
          <div className="bg-gray-50 p-2 md:p-3 rounded-md">
            <div className="text-xs text-gray-500">出発時刻</div>
            <div className="text-sm md:text-base font-medium">
              {flightPlan.departureTime || '--'}
            </div>
          </div>
          <div className="bg-gray-50 p-2 md:p-3 rounded-md">
            <div className="text-xs text-gray-500">到着予定時刻</div>
            <div className="text-sm md:text-base font-medium">
              {flightPlan.eta || '--'}
            </div>
          </div>
        </div>
        
        {flightPlan.routeSegments && flightPlan.routeSegments.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm md:text-base font-medium text-gray-700 mb-2">ルートセグメント</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From
                    </th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To
                    </th>
                    <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CAS
                    </th>
                    <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      磁方位
                    </th>
                    <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      高度
                    </th>
                    <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      距離
                    </th>
                    <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ETA
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {flightPlan.routeSegments.map((segment, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-1 text-xs md:text-sm text-gray-900">{segment.from}</td>
                      <td className="px-2 py-1 text-xs md:text-sm text-gray-900">{segment.to}</td>
                      <td className="px-2 py-1 text-xs md:text-sm text-gray-900 text-right">{segment.speed} kt</td>
                      <td className="px-2 py-1 text-xs md:text-sm text-gray-900 text-right">{formatBearing(segment.bearing)}°</td>
                      <td className="px-2 py-1 text-xs md:text-sm text-gray-900 text-right">{segment.altitude} ft</td>
                      <td className="px-2 py-1 text-xs md:text-sm text-gray-900 text-right">{segment.distance?.toFixed(1)} nm</td>
                      <td className="px-2 py-1 text-xs md:text-sm text-gray-900 text-right">{segment.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSummary; 