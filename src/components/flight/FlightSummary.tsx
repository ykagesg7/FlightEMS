import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlightPlan, RouteSegment } from '../../types';
import { formatBearing } from '../../utils/format';
import { calculateTAS, calculateAirspeeds } from '../../utils';

interface FlightSummaryProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

/**
 * Flight Summary コンポーネント
 * 総距離、ETE、ETAの表示を行う
 */
export const FlightSummary: React.FC<FlightSummaryProps> = ({ flightPlan, setFlightPlan }) => {
  // 時刻文字列をDate型に変換する関数
  const parseTimeString = useCallback((timeStr: string): Date => {
    if (!timeStr || timeStr === '--' || typeof timeStr !== 'string') {
      console.warn('Invalid or empty time string provided:', timeStr);
      return new Date(NaN);
    }
    const parts = timeStr.split(':').map((p) => parseInt(p, 10));
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (parts.length === 2) {
      const [h, m] = parts;
      if (!isNaN(h) && !isNaN(m)) {
        date.setHours(h, m, 0, 0);
      } else {
        console.error('Failed to parse hh:mm:', timeStr);
        return new Date(NaN);
      }
    } else if (parts.length === 3) {
      const [h, m, s] = parts;
      if (!isNaN(h) && !isNaN(m) && !isNaN(s)) {
        date.setHours(h, m, s, 0);
      } else {
        console.error('Failed to parse hh:mm:ss:', timeStr);
        return new Date(NaN);
      }
    } else {
      console.error('Invalid time format detected:', timeStr);
      return new Date(NaN);
    }
    if (isNaN(date.getTime())) {
      console.error('Resulting date is invalid after parsing:', timeStr);
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

  // 状態として保持するルートセグメント(編集用)
  const [editableSegments, setEditableSegments] = useState<RouteSegment[]>(flightPlan.routeSegments || []);
  
  // 前回のrouteSegmentsの長さを記録
  const prevSegmentsLengthRef = useRef<number>(flightPlan.routeSegments?.length || 0);
  // ユーザーによる編集が行われたかどうかのフラグ
  const userEditedRef = useRef<boolean>(false);

  // コンポーネントのマウント時に一度だけ実行される初期化処理
  useEffect(() => {
    // 初期マウント時に現在のrouteSegmentsの長さを記録
    prevSegmentsLengthRef.current = flightPlan.routeSegments?.length || 0;
    console.log('FlightSummaryコンポーネントが初期化されました');
  }, []);

  // flightPlan.routeSegmentsが外部から変更された場合にeditableSegmentsを同期
  // ただし、ルート数が変わった場合やルート自体が初期化された場合のみ同期する
  useEffect(() => {
    const currentLength = flightPlan.routeSegments?.length || 0;
    const prevLength = prevSegmentsLengthRef.current;
    
    // ルート数が変わった場合やルートが初期化された時のみ同期する
    if (currentLength !== prevLength || currentLength === 0) {
      console.log(`ルートセグメント数が変更されました: ${prevLength} -> ${currentLength}、同期します`);
      setEditableSegments(flightPlan.routeSegments || []);
      prevSegmentsLengthRef.current = currentLength;
      userEditedRef.current = false; // 同期されたためフラグをリセット
    } else if (flightPlan.routeSegments && !userEditedRef.current) {
      // ユーザー編集がなく、かつフライトプランのルートに変更がある場合
      // ルートの構造的な変更（出発地/到着地変更など）があった可能性があるため同期
      const hasStructuralChanges = flightPlan.routeSegments.some((segment, index) => {
        const editableSegment = editableSegments[index];
        return !editableSegment ||
               segment.from !== editableSegment.from ||
               segment.to !== editableSegment.to ||
               segment.distance !== editableSegment.distance ||
               segment.bearing !== editableSegment.bearing;
      });
      
      if (hasStructuralChanges) {
        console.log('ルートセグメント構造変更を検出しました、同期します');
        setEditableSegments(flightPlan.routeSegments);
      }
    }
  }, [flightPlan.routeSegments, editableSegments]);

  // ルートセグメントの計算
  const recalculateETAs = useCallback(() => {
    if (!editableSegments || editableSegments.length === 0 || !flightPlan.departureTime) {
      console.warn('計算に必要な前提条件が揃っていません');
      return;
    }
    console.log('ETAs再計算を開始します.');
    
    // 出発時刻をパース
    let currentTime = parseTimeString(flightPlan.departureTime);
    if (isNaN(currentTime.getTime())) {
        console.error("無効な出発時刻です", flightPlan.departureTime);
        return;
    }

    let totalDurationSeconds = 0;
    
    // 各セグメントを処理
    const calculatedSegments = editableSegments.map((segment, index) => {
      console.log(`セグメント[${index}]を計算 ${segment.from} -> ${segment.to}`, {
        distance: segment.distance,
        speed: segment.speed,
        altitude: segment.altitude
      });
      
      // 必須パラメータのチェック
      if (!segment.distance || isNaN(segment.distance) || segment.distance <= 0) {
        console.warn(`セグメント[${index}]の距離が無効です`, segment.distance);
        return { ...segment, eta: '--:--:--' };
      }
      
      if (!segment.speed || isNaN(segment.speed) || segment.speed <= 0) {
        console.warn(`セグメント[${index}]の速度が無効です`, segment.speed);
        return { ...segment, eta: '--:--:--' };
      }
      
      // 高度に基づくTASを計算(高精度)
      let tas = segment.speed; // デフォルトはCAS=TASと仮定
      
      if (segment.altitude && !isNaN(segment.altitude) && segment.altitude > 0) {
        // 高精度計算モデルを使用
        const airspeedsResult = calculateAirspeeds(
          segment.speed,
          segment.altitude,
          flightPlan.groundTempC ?? 15, // デフォルト値として15°C
          flightPlan.groundElevationFt ?? 0 // デフォルト値として0ft
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
          // 高精度計算が失敗した場合、簡易計算を使用
          tas = calculateTAS(segment.speed, segment.altitude);
          console.log(`セグメント[${index}]のTAS簡易計算結果:`, {
            cas: segment.speed,
            tas: tas,
            altitude: segment.altitude
          });
        }
      } else {
        console.log(`セグメント[${index}]は高度情報がないため、CAS=TASとして計算`, segment.speed);
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

  // 速度変更時の処理(editableSegmentsを更新)
  const handleSpeedChange = useCallback((index: number, newSpeed: string) => {
    const speed = parseInt(newSpeed, 10);
    if (newSpeed === '' || (isNaN(speed) || speed <= 0)) {
       setEditableSegments(prev => {
         const newSegments = [...prev];
         newSegments[index] = { ...newSegments[index], speed: NaN };
         return newSegments;
       });
       userEditedRef.current = true; // ユーザー編集フラグをセット
       
       // 速度が変更されたので、遅延なしですぐに再計算を実行
       setTimeout(() => {
        const updatedPlan = recalculateETAs();
        if (updatedPlan) {
          setFlightPlan(prev => ({
            ...prev,
            routeSegments: updatedPlan.routeSegments,
            eta: updatedPlan.eta,
            ete: updatedPlan.ete,
          }));
        }
       }, 10);
       
       return;
    }

    setEditableSegments(prev => {
      const newSegments = [...prev];
      newSegments[index] = { ...newSegments[index], speed };
      return newSegments;
    });
    userEditedRef.current = true; // ユーザー編集フラグをセット
    
    // 速度が変更されたので、遅延なしですぐに再計算を実行
    setTimeout(() => {
      const updatedPlan = recalculateETAs();
      if (updatedPlan) {
        setFlightPlan(prev => ({
          ...prev,
          routeSegments: updatedPlan.routeSegments,
          eta: updatedPlan.eta,
          ete: updatedPlan.ete,
        }));
      }
    }, 10);
  }, [recalculateETAs, setFlightPlan]);

  // 高度変更時の処理(editableSegmentsを更新)
  const handleAltitudeChange = useCallback((index: number, newAltitude: string) => {
    const altitude = parseInt(newAltitude, 10);
    if (newAltitude === '' || (isNaN(altitude) || altitude < 0)) {
       setEditableSegments(prev => {
         const newSegments = [...prev];
         newSegments[index] = { ...newSegments[index], altitude: NaN };
         return newSegments;
       });
       userEditedRef.current = true; // ユーザー編集フラグをセット
       
       // 高度が変更されたので、遅延なしですぐに再計算を実行
       setTimeout(() => {
        const updatedPlan = recalculateETAs();
        if (updatedPlan) {
          setFlightPlan(prev => ({
            ...prev,
            routeSegments: updatedPlan.routeSegments,
            eta: updatedPlan.eta,
            ete: updatedPlan.ete,
          }));
        }
       }, 10);
       
       return;
    }

    setEditableSegments(prev => {
      const newSegments = [...prev];
      newSegments[index] = { ...newSegments[index], altitude };
      return newSegments;
    });
    userEditedRef.current = true; // ユーザー編集フラグをセット
    
    // 高度が変更されたので、遅延なしですぐに再計算を実行
    setTimeout(() => {
      const updatedPlan = recalculateETAs();
      if (updatedPlan) {
        setFlightPlan(prev => ({
          ...prev,
          routeSegments: updatedPlan.routeSegments,
          eta: updatedPlan.eta,
          ete: updatedPlan.ete,
        }));
      }
    }, 10);
  }, [recalculateETAs, setFlightPlan]);

  // パラメータが変更された時に自動的にETAを再計算
  useEffect(() => {
    // フライトパラメータが完全に初期化された後にのみ実行
    if (flightPlan.departureTime && editableSegments && editableSegments.length > 0) {
      // 自動計算を制限するためタイマーを設定（頻繁な再計算を防ぐ）
      const timer = setTimeout(() => {
        const updatedPlan = recalculateETAs();
        if (updatedPlan) {
          setFlightPlan(prev => ({
            ...prev,
            routeSegments: updatedPlan.routeSegments,
            eta: updatedPlan.eta,
            ete: updatedPlan.ete,
          }));
          // 計算後のユーザー編集フラグをリセット
          userEditedRef.current = false;
        }
      }, 1000); // 念のため500msから1000msに
      
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
