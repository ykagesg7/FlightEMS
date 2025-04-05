import React, { useState, useEffect, useCallback } from 'react';
import { FlightPlan, RouteSegment } from '../types';
import { formatBearing } from '../utils/format';

interface FlightSummaryProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

/**
 * Flight Summary コンポーネント
 * 総距離、ETE、ETAの表示を行う
 */
const FlightSummary: React.FC<FlightSummaryProps> = ({ flightPlan, setFlightPlan }) => {
  // 所要時間を計算して「hh:mm:ss」形式でフォーマットする関数
  const formatDuration = useCallback((distance?: number, speed?: number): string => {
    if (!distance || !speed || speed === 0) return '--:--:--';
    
    // 距離（NM）÷ 速度（kt）で時間（時間）を計算
    const hours = distance / speed;
    const totalSeconds = Math.round(hours * 3600);
    
    // hh:mm:ss 形式
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  // 時間文字列をDate型に変換する関数
  const parseTimeString = useCallback((timeStr: string): Date => {
    // 不正な入力や空文字列は無効なDateとして扱う
    if (!timeStr || timeStr === '--' || typeof timeStr !== 'string') {
        console.warn("Invalid or empty time string provided:", timeStr);
        return new Date(NaN); // 無効なDateを返す
    }

    const parts = timeStr.split(':').map(Number);
    const date = new Date(); // 現在の日付で初期化

    // hh:mm 形式か hh:mm:ss 形式かを判定し、数値が有効か確認
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      // hh:mm 形式の場合、秒は0とする
      date.setHours(parts[0], parts[1], 0, 0); // 時、分、秒(0)、ミリ秒(0)を設定
       if (isNaN(date.getTime())) { // setHoursが失敗する場合がある (例: 25時など)
         console.error("Failed to set hours/minutes (hh:mm):", timeStr);
         return new Date(NaN);
       }
    } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      // hh:mm:ss 形式の場合
      date.setHours(parts[0], parts[1], parts[2], 0); // 時、分、秒、ミリ秒(0)を設定
       if (isNaN(date.getTime())) { // setHoursが失敗する場合がある
          console.error("Failed to set hours/minutes/seconds (hh:mm:ss):", timeStr);
         return new Date(NaN);
       }
    } else {
      // 上記以外の不正な形式の場合
      console.error("Invalid time format detected:", timeStr);
      return new Date(NaN); // 無効なDateを返す
    }

    // 最終的なDateオブジェクトが有効か確認 (冗長かもしれないが念のため)
    if (isNaN(date.getTime())) {
        console.error("Resulting date is invalid after parsing:", timeStr);
        return new Date(NaN);
    }

    return date;
  }, []);

  // 時間を加算する関数
  const addTime = useCallback((time: Date, duration: string): Date => {
    const [hours, minutes, seconds] = duration.split(':').map(Number);
    const result = new Date(time);
    result.setHours(result.getHours() + hours);
    result.setMinutes(result.getMinutes() + minutes);
    result.setSeconds(result.getSeconds() + seconds);
    return result;
  }, []);

  // 時間を「hh:mm:ss」形式でフォーマットする関数
  const formatTime = useCallback((date: Date): string => {
    if (isNaN(date.getTime())) {
        return '--:--:--';
    }
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  }, []);

  // 状態として保持するルートセグメント (編集用)
  const [editableSegments, setEditableSegments] = useState<RouteSegment[]>(flightPlan.routeSegments || []);

  // flightPlan.routeSegmentsが外部から変更された場合にeditableSegmentsを同期
  useEffect(() => {
    setEditableSegments(flightPlan.routeSegments || []);
  }, [flightPlan.routeSegments]);

  // 速度変更時の処理 (editableSegmentsを更新)
  const handleSpeedChange = useCallback((index: number, newSpeed: string) => {
    const speed = parseInt(newSpeed, 10);
    if (newSpeed === '' || (isNaN(speed) || speed <= 0)) {
       setEditableSegments(prev => {
         const newSegments = [...prev];
         newSegments[index] = { ...newSegments[index], speed: NaN };
         return newSegments;
       });
       return;
    }

    setEditableSegments(prev => {
      const newSegments = [...prev];
      newSegments[index] = { ...newSegments[index], speed };
      return newSegments;
    });
  }, []);

  // 高度変更時の処理 (editableSegmentsを更新)
  const handleAltitudeChange = useCallback((index: number, newAltitude: string) => {
    const altitude = parseInt(newAltitude, 10);
    if (newAltitude === '' || (isNaN(altitude) || altitude < 0)) {
       setEditableSegments(prev => {
         const newSegments = [...prev];
         newSegments[index] = { ...newSegments[index], altitude: NaN };
         return newSegments;
       });
       return;
    }

    setEditableSegments(prev => {
      const newSegments = [...prev];
      newSegments[index] = { ...newSegments[index], altitude };
      return newSegments;
    });
  }, []);

  // 諸元更新ボタンが押された時の処理
  const handleUpdateSpecs = useCallback(() => {
    if (!editableSegments || editableSegments.length === 0 || !flightPlan.departureTime) {
        console.warn("Calculation prerequisites not met.");
        return;
    };

    let currentTime = parseTimeString(flightPlan.departureTime);
    if (isNaN(currentTime.getTime())) {
        console.error("Invalid departure time:", flightPlan.departureTime);
        return;
    }

    let totalDurationSeconds = 0;

    const calculatedSegments = editableSegments.map((segment) => {
      if (segment.distance && segment.speed && !isNaN(segment.speed) && segment.speed > 0 && !isNaN(segment.distance)) {
        const durationString = formatDuration(segment.distance, segment.speed);
        if (durationString === '--:--:--') {
             console.warn("Invalid duration calculated for segment:", segment);
             return { ...segment, eta: '--:--:--' };
        }
        const [hours, minutes, seconds] = durationString.split(':').map(Number);
        const durationSeconds = hours * 3600 + minutes * 60 + seconds;

        if (isNaN(durationSeconds)) {
            console.warn("NaN durationSeconds for segment:", segment);
            return { ...segment, eta: '--:--:--' };
        }

        const segmentEndTime = addTime(currentTime, durationString);

        if (isNaN(segmentEndTime.getTime())) {
             console.error("Invalid ETA calculated for segment:", segment, "CurrentTime:", currentTime, "Duration:", durationString);
             return { ...segment, eta: '--:--:--' };
        }

        const formattedEta = formatTime(segmentEndTime);
        totalDurationSeconds += durationSeconds;
        currentTime = segmentEndTime;

        return {
          ...segment,
          eta: formattedEta,
        };
      }
      console.warn("Segment skipped in calculation:", segment);
      return { ...segment, eta: '--:--:--' };
    });

    const totalHours = Math.floor(totalDurationSeconds / 3600);
    const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
    const totalSeconds = totalDurationSeconds % 60;
    const formattedEte = `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;

    const lastCalculatedSegment = calculatedSegments.length > 0 ? calculatedSegments[calculatedSegments.length - 1] : null;
    const finalEta = lastCalculatedSegment?.eta || '--:--:--';

    console.log("Updating Flight Plan:", {
        routeSegments: calculatedSegments,
        eta: finalEta,
        ete: formattedEte,
    });

    setFlightPlan(prev => ({
      ...prev,
      routeSegments: calculatedSegments,
      eta: finalEta,
      ete: formattedEte,
    }));
  }, [editableSegments, flightPlan.departureTime, setFlightPlan, formatDuration, parseTimeString, addTime, formatTime]);

  return (
    <div className="bg-gray-800 shadow-sm rounded-lg p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-50">フライトサマリー</h2>
      <div className="space-y-3 md:space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-700 p-2 md:p-3 rounded-md">
            <div className="text-xs text-gray-300">合計距離</div>
            <div className="text-sm md:text-base font-medium text-gray-100">
              {flightPlan.totalDistance ? `${flightPlan.totalDistance.toFixed(1)} nm` : '--'}
            </div>
          </div>
          <div className="bg-gray-700 p-2 md:p-3 rounded-md">
            <div className="text-xs text-gray-300">予想飛行時間</div>
            <div className="text-sm md:text-base font-medium text-gray-100">
              {flightPlan.ete || '--'}
            </div>
          </div>
          <div className="bg-gray-700 p-2 md:p-3 rounded-md">
            <div className="text-xs text-gray-300">出発時刻</div>
            <div className="text-sm md:text-base font-medium text-gray-100">
              {flightPlan.departureTime || '--'}
            </div>
          </div>
          <div className="bg-gray-700 p-2 md:p-3 rounded-md">
            <div className="text-xs text-gray-300">到着予定時刻</div>
            <div className="text-sm md:text-base font-medium text-gray-100">
              {flightPlan.eta || '--'}
            </div>
          </div>
        </div>
        
        {editableSegments && editableSegments.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm md:text-base font-medium text-gray-200 mb-2">ルートセグメント</h3>
            
            <div className="mb-3">
              <button
                onClick={handleUpdateSpecs}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                諸元を更新
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-600 text-xs md:text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      From
                    </th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      To
                    </th>
                    <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      CAS
                    </th>
                    <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      磁方位
                    </th>
                    <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      高度
                    </th>
                    <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      距離
                    </th>
                    <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      ETA
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-600">
                  {editableSegments.map((segment, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                      <td className="px-2 py-1 text-xs md:text-sm text-gray-200">{segment.from}</td>
                      <td className="px-2 py-1 text-xs md:text-sm text-gray-200">{segment.to}</td>
                      <td className="px-2 py-1 text-xs md:text-sm text-gray-200 text-right">
                        <input
                          type="number"
                          min="1"
                          value={isNaN(segment.speed) ? '' : segment.speed}
                          onChange={(e) => handleSpeedChange(index, e.target.value)}
                          className="w-16 bg-gray-600 text-gray-100 text-right rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="ml-1">kt</span>
                      </td>
                      <td className="px-2 py-1 text-xs md:text-sm text-gray-200 text-right">{formatBearing(segment.bearing)}°</td>
                      <td className="px-2 py-1 text-xs md:text-sm text-gray-200 text-right">
                        <input
                          type="number"
                          min="0"
                          value={isNaN(segment.altitude) ? '' : segment.altitude}
                          onChange={(e) => handleAltitudeChange(index, e.target.value)}
                          className="w-16 bg-gray-600 text-gray-100 text-right rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="ml-1">ft</span>
                      </td>
                      <td className="px-2 py-1 text-xs md:text-sm text-gray-200 text-right">{segment.distance?.toFixed(1)} nm</td>
                      <td className="px-2 py-1 text-xs md:text-sm text-gray-200 text-right">
                        {flightPlan.routeSegments?.[index]?.eta || '--:--:--'}
                      </td>
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