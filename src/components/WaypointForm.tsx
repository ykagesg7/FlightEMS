import React, { useState, useEffect } from 'react';
// import DmsInput from './DmsInput'; // DmsInputのインポートを削除
import { calculateOffsetPoint } from '../utils/offset'; // Import from offset.ts
import { FlightPlan } from '../types';
import { dmsToDecimal } from '../utils/dms'; // ユーティリティ関数をインポート

interface WaypointFormProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

const WaypointForm: React.FC<WaypointFormProps> = ({ flightPlan, setFlightPlan }) => {
  const [bearing, setBearing] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const [coordinateInputMode, setCoordinateInputMode] = useState<'DMS' | 'Decimal'>('DMS');
  const [coordinates, setCoordinates] = useState({
    dms: { lat: '', lon: '' },
    decimal: { lat: '', lon: '' }
  });
  const [errors, setErrors] = useState({ lat: '', lon: '' });
  const [dmsInput, setDmsInput] = useState<string>('');

  // バリデーション関数
  const validateDecimal = (value: string, max: number) => {
    const num = parseFloat(value);
    return !isNaN(num) && Math.abs(num) <= max;
  };

  const validateDMS = (value: string, isLatitude: boolean) => {
    if (isLatitude) {
      // 緯度：先頭または末尾にN/Sが付いていればOK、数字部分は6桁
      return /^(?:[NS])?\d{6}(?:[NS])?$/i.test(value);
    } else {
      // 経度：先頭または末尾にE/Wが付いていればOK、数字部分は7桁
      return /^(?:[EW])?\d{7}(?:[EW])?$/i.test(value);
    }
  };

  // 入力モード切り替え時に状態をリセット
  useEffect(() => {
    setErrors({ lat: '', lon: '' });
    setCoordinates({
      dms: { lat: '', lon: '' },
      decimal: { lat: '', lon: '' }
    });
  }, [coordinateInputMode]);

  // ウェイポイント追加ハンドラー（更新版）
  const handleAddWaypoint = () => {
    let latDecimal: number | null = null;
    let lonDecimal: number | null = null;

    if (coordinateInputMode === 'DMS') {
      const latValid = validateDMS(coordinates.dms.lat, true);
      const lonValid = validateDMS(coordinates.dms.lon, false);

      if (!latValid || !lonValid) {
        setErrors({
          lat: latValid ? '' : "有効な緯度を入力してください（例: N354336\"）",
          lon: lonValid ? '' : "有効な経度を入力してください（例: E1394500\"）"
        });
        return;
      }

      latDecimal = dmsToDecimal(coordinates.dms.lat, true);
      lonDecimal = dmsToDecimal(coordinates.dms.lon, false);
    } else {
      const latValid = validateDecimal(coordinates.decimal.lat, 90);
      const lonValid = validateDecimal(coordinates.decimal.lon, 180);

      if (!latValid || !lonValid) {
        setErrors({
          lat: latValid ? '' : '有効な緯度を入力してください（-90〜90）',
          lon: lonValid ? '' : '有効な経度を入力してください（-180〜180）'
        });
        return;
      }

      latDecimal = parseFloat(coordinates.decimal.lat);
      lonDecimal = parseFloat(coordinates.decimal.lon);
    }

    if (latDecimal !== null && lonDecimal !== null) {
      let coordinates: [number, number] = [lonDecimal, latDecimal];

      if (bearing && distance) {
        const offset = calculateOffsetPoint(
          latDecimal,
          lonDecimal,
          parseFloat(bearing),
          parseFloat(distance)
        );
        if (offset) {
          coordinates = [offset.lon, offset.lat];
          latDecimal = offset.lat;
          lonDecimal = offset.lon;
        }
      }

      const waypoint = {
        id: `custom-${Date.now()}`,
        name: `Custom Waypoint ${flightPlan.waypoints.length + 1}`,
        type: 'custom' as const,
        coordinates,
        latitude: latDecimal,
        longitude: lonDecimal,
        nameEditable: true
      };

      console.log("追加するWaypoint:", waypoint);

      setFlightPlan({
        ...flightPlan,
        waypoints: [...flightPlan.waypoints, waypoint]
      });

      console.log("更新後のFlightPlan.waypoints:", [...flightPlan.waypoints, waypoint]);
    }
  };

  const handleDmsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDmsInput(value);

    // カンマまたはセミコロン区切りの場合、例: "334005,1234005" あるいは "N334005;E1234005"
    const parts = value.split(/,|;/).map(part => part.trim());
    if (parts.length === 2) {
      let latRaw = parts[0];
      let lonRaw = parts[1];

      // 緯度：NまたはSが含まれていなければデフォルトで「N」を付与
      if (!/^[NnSs]/.test(latRaw) && !/[NnSs]$/.test(latRaw)) {
        latRaw = "N" + latRaw;
      }

      // 経度：EまたはWが含まれていなければデフォルトで「E」を付与
      if (!/^[EeWw]/.test(lonRaw) && !/[EeWw]$/.test(lonRaw)) {
        lonRaw = "E" + lonRaw;
      }

      // 桁数の検証（ヘミスフィア記号を除いた部分）
      const latDigits = latRaw.replace(/[NnSs]/g, '');
      const lonDigits = lonRaw.replace(/[EeWw]/g, '');
      if (latDigits.length === 6 && lonDigits.length === 7) {
        // 統一された形式で大文字に変換して状態を更新
        setCoordinates(prev => ({
          ...prev,
          dms: { lat: latRaw.toUpperCase(), lon: lonRaw.toUpperCase() }
        }));
        // エラークリア
        setErrors({ lat: '', lon: '' });
      }
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-sm mt-8">
      <legend className="text-lg font-semibold mb-4 text-gray-50">Add Waypoint</legend>

      {/* 座標入力モード切り替え */}
      <div className="mb-4">
        <label className="inline-flex items-center cursor-pointer text-gray-400">
          <input
            type="radio"
            className="form-radio text-blue-500"
            name="coordinateInputMode"
            value="DMS"
            checked={coordinateInputMode === 'DMS'}
            onChange={() => setCoordinateInputMode('DMS')}
          />
          <span className="ml-2">DMS入力</span>
        </label>
        <label className="inline-flex items-center cursor-pointer ml-4 text-gray-400">
          <input
            type="radio"
            className="form-radio text-blue-500"
            name="coordinateInputMode"
            value="Decimal"
            checked={coordinateInputMode === 'Decimal'}
            onChange={() => setCoordinateInputMode('Decimal')}
          />
          <span className="ml-2">Decimal入力</span>
        </label>
      </div>

      {/* DMS入力フィールド */}
      {coordinateInputMode === 'DMS' ? (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              緯度 (ddmmss 形式、例: N334005)
            </label>
            <input
              type="text"
              value={coordinates.dms.lat}
              onChange={(e) =>
                setCoordinates(prev => ({
                  ...prev,
                  dms: { ...prev.dms, lat: e.target.value.toUpperCase() }
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.lat && <span className="text-red-500 text-sm">{errors.lat}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              経度 (dddmmss 形式、例: E1234005)
            </label>
            <input
              type="text"
              value={coordinates.dms.lon}
              onChange={(e) =>
                setCoordinates(prev => ({
                  ...prev,
                  dms: { ...prev.dms, lon: e.target.value.toUpperCase() }
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.lon && <span className="text-red-500 text-sm">{errors.lon}</span>}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">緯度 (±90.000000)</label>
            <input
              type="text"
              value={coordinates.decimal.lat}
              onChange={(e) => setCoordinates(prev => ({ ...prev, decimal: { ...prev.decimal, lat: e.target.value } }))}
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.lat && <span className="text-red-500 text-sm">{errors.lat}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">経度 (±180.000000)</label>
            <input
              type="text"
              value={coordinates.decimal.lon}
              onChange={(e) => setCoordinates(prev => ({ ...prev, decimal: { ...prev.decimal, lon: e.target.value } }))}
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.lon && <span className="text-red-500 text-sm">{errors.lon}</span>}
          </div>
        </div>
      )}

      {/* オフセット入力フィールド */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-400">オフセット (オプション)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">方位 (度)</label>
            <input
              type="number"
              value={bearing}
              onChange={(e) => setBearing(e.target.value)}
              placeholder="0-360"
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              min="0"
              max="360"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">距離 (海里)</label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="距離"
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* 追加ボタン */}
      <button
        onClick={handleAddWaypoint}
        className="mt-2 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Add Waypoint
      </button>

      <div>
        <label>
          連続DMS入力 (例:
          N334005,E1234005):
        </label>
        <input 
          type="text" 
          value={dmsInput} 
          onChange={handleDmsInputChange} 
          placeholder="Nddmmss または Edddmmss"
        />
      </div>
    </div>
  );
};

export default WaypointForm; 