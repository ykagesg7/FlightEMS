import React, { useState, useEffect, useCallback } from 'react';
import { FlightPlan, RouteSegment } from '../types';
import { formatBearing } from '../utils/format';
import { calculateTAS, calculateAirspeeds } from '../utils';

interface FlightSummaryProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

/**
 * Flight Summary コンポーネント
 * 総距離、ETE、ETAの表示を行う
 */
const FlightSummary: React.FC<FlightSummaryProps> = ({ flightPlan, setFlightPlan }) => {
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

  // ルートセグメントの再計算
  const recalculateETAs = useCallback(() => {
    if (!editableSegments || editableSegments.length === 0 || !flightPlan.departureTime) {
        console.warn("計算に必要な前提条件が揃っていません。");
        return;
    };

    console.log("ETAs再計算を開始します...");
    
    // 出発時刻をパース
    let currentTime = parseTimeString(flightPlan.departureTime);
    if (isNaN(currentTime.getTime())) {
        console.error("無効な出発時刻です:", flightPlan.departureTime);
        return;
    }

    let totalDurationSeconds = 0;
    
    // 各セグメントを処理
    const calculatedSegments = editableSegments.map((segment, index) => {
      console.log(`セグメント[${index}]を計算: ${segment.from} → ${segment.to}`, {
        distance: segment.distance,
        speed: segment.speed,
        altitude: segment.altitude
      });
      
      // 必須パラメータのチェック
      if (!segment.distance || isNaN(segment.distance) || segment.distance <= 0) {
        console.warn(`セグメント[${index}]の距離が無効です:`, segment.distance);
        return { ...segment, eta: '--:--:--' };
      }
      
      if (!segment.speed || isNaN(segment.speed) || segment.speed <= 0) {
        console.warn(`セグメント[${index}]の速度が無効です:`, segment.speed);
        return { ...segment, eta: '--:--:--' };
      }
      
      // 高度に基づいてTASを計算 (高精度)
      let tas = segment.speed; // デフォルトはCAS=TASと仮定
      
      if (segment.altitude && !isNaN(segment.altitude) && segment.altitude > 0) {
        // 高精度計算モデルを使用
        const airspeedsResult = calculateAirspeeds(
          segment.speed, 
          segment.altitude, 
          flightPlan.groundTempC || 15, // デフォルト値として15℃
          flightPlan.groundElevationFt || 0 // デフォルト値として0ft
        );
        
        if (airspeedsResult) {
          tas = airspeedsResult.tasKt;
          console.log(`セグメント[${index}]のTAS計算結果:`, {
            cas: segment.speed,
            tas: tas,
            mach: airspeedsResult.mach,
            altitude: segment.altitude
          });
        } else {
          // 高精度計算が失敗した場合は簡易計算を使用
          tas = calculateTAS(segment.speed, segment.altitude);
          console.log(`セグメント[${index}]のTAS簡易計算結果:`, {
            cas: segment.speed,
            tas: tas,
            altitude: segment.altitude
          });
        }
      } else {
        console.log(`セグメント[${index}]は高度指定がないため、CAS=TASとして計算:`, segment.speed);
      }
      
      // 所要時間の計算（分単位）
      const eteMinutes = (segment.distance / tas) * 60;
      console.log(`セグメント[${index}]の所要時間(分):`, eteMinutes);
      
      // hh:mm:ss 形式に変換
      const eteHours = Math.floor(eteMinutes / 60);
      const eteMins = Math.floor(eteMinutes % 60);
      const eteSecs = Math.floor((eteMinutes - Math.floor(eteMinutes)) * 60);
      const durationString = `${eteHours.toString().padStart(2, '0')}:${eteMins.toString().padStart(2, '0')}:${eteSecs.toString().padStart(2, '0')}`;
      console.log(`セグメント[${index}]の所要時間(hh:mm:ss):`, durationString);
      
      // 時間を秒単位に変換
      const durationSeconds = eteHours * 3600 + eteMins * 60 + eteSecs;
      
      // 到着時刻を計算
      const segmentEndTime = new Date(currentTime.getTime() + durationSeconds * 1000);
      
      // 時刻をフォーマット
      const formattedEta = formatTime(segmentEndTime);
      console.log(`セグメント[${index}]の到着時刻:`, formattedEta);
      
      // 累積時間を更新
      totalDurationSeconds += durationSeconds;
      currentTime = segmentEndTime;
      
      // 更新されたセグメントを返す
      return {
        ...segment,
        eta: formattedEta,
      };
    });
    
    // 総所要時間を hh:mm:ss 形式に変換
    const totalHours = Math.floor(totalDurationSeconds / 3600);
    const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
    const totalSeconds = totalDurationSeconds % 60;
    const formattedEte = `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
    console.log("総所要時間:", formattedEte);
    
    // 最終目的地の到着時刻
    const lastCalculatedSegment = calculatedSegments.length > 0 ? calculatedSegments[calculatedSegments.length - 1] : null;
    const finalEta = lastCalculatedSegment?.eta || '--:--:--';
    console.log("最終到着時刻:", finalEta);
    
    console.log("ETAs再計算完了");
    
    return {
      routeSegments: calculatedSegments,
      eta: finalEta,
      ete: formattedEte,
    };
  }, [editableSegments, flightPlan.departureTime, flightPlan.groundTempC, flightPlan.groundElevationFt, parseTimeString, formatTime, calculateTAS, calculateAirspeeds]);

  // パラメータが変更された時に自動的にETAを再計算
  useEffect(() => {
    // フライトパラメータが完全に初期化された後にのみ実行
    if (flightPlan.departureTime && editableSegments && editableSegments.length > 0) {
      // 自動計算を制限するためのタイマーを設定（頻繁な再計算を防ぐ）
      const timer = setTimeout(() => {
        const updatedPlan = recalculateETAs();
        if (updatedPlan) {
          setFlightPlan(prev => ({
            ...prev,
            routeSegments: updatedPlan.routeSegments,
            eta: updatedPlan.eta,
            ete: updatedPlan.ete,
          }));
        }
      }, 500); // 500msのディレイを設定
      
      return () => clearTimeout(timer);
    }
  }, [flightPlan.departureTime, editableSegments, recalculateETAs, setFlightPlan]);

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
              {flightPlan.ete || '--:--:--'}
            </div>
          </div>
          <div className="bg-gray-700 p-2 md:p-3 rounded-md">
            <div className="text-xs text-gray-300">出発時刻</div>
            <div className="text-sm md:text-base font-medium text-gray-100">
              {flightPlan.departureTime || '--:--:--'}
            </div>
          </div>
          <div className="bg-gray-700 p-2 md:p-3 rounded-md">
            <div className="text-xs text-gray-300">到着予定時刻</div>
            <div className="text-sm md:text-base font-medium text-gray-100">
              {flightPlan.eta || '--:--:--'}
            </div>
          </div>
        </div>
        
        {editableSegments && editableSegments.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm md:text-base font-medium text-gray-200 mb-2">ルートセグメント</h3>
            
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
                        {segment.eta || '--:--:--'}
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