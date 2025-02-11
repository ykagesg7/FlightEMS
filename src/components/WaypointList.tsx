import React, { useState } from 'react';
import { FlightPlan, Waypoint } from '../types';
import { MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import { formatDMS, decimalToDMS, dmsToDecimal } from '../utils';
import DmsInput from './DmsInput';
import { formatBearing, formatDistance } from '../utils/format';
import { calculateOffsetPoint as offsetCalculateOffsetPoint } from '../utils/offset';

interface WaypointListProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

/**
 * Waypoint List コンポーネント
 * ウェイポイントのリスト表示と操作（移動、削除、各種編集モード）を行う
 */
const WaypointList: React.FC<WaypointListProps> = ({ flightPlan, setFlightPlan }) => {
  // 編集中のウェイポイントの状態を管理する state
  const [editingWaypointState, setEditingWaypointState] = useState<{
    index: number | null;
    mode: 'name' | 'id' | 'position' | null;
    waypoint: Waypoint | null;
    bearing?: string;
    distance?: string;
    dmsLatitude?: string;
    dmsLongitude?: string;
  }>({
    index: null,
    mode: null,
    waypoint: null,
    bearing: '',
    distance: '',
    dmsLatitude: '',
    dmsLongitude: '',
  });

  const { index: editingIndex, mode: editingMode, waypoint: editingWaypoint, bearing: editingBearing, distance: editingDistance, dmsLatitude, dmsLongitude } = editingWaypointState;

  // ウェイポイントを上に移動するハンドラー
  const handleMoveWaypointUp = (index: number) => {
    if (index > 0) {
      const updatedWaypoints = [...flightPlan.waypoints];
      const temp = updatedWaypoints[index];
      updatedWaypoints[index] = updatedWaypoints[index - 1];
      updatedWaypoints[index - 1] = temp;
      setFlightPlan({ ...flightPlan, waypoints: updatedWaypoints });
    }
  };

  // ウェイポイントを下に移動するハンドラー
  const handleMoveWaypointDown = (index: number) => {
    if (index < flightPlan.waypoints.length - 1) {
      const updatedWaypoints = [...flightPlan.waypoints];
      const temp = updatedWaypoints[index];
      updatedWaypoints[index] = updatedWaypoints[index + 1];
      updatedWaypoints[index + 1] = temp;
      setFlightPlan({ ...flightPlan, waypoints: updatedWaypoints });
    }
  };

  // ウェイポイントを削除するハンドラー
  const handleRemoveWaypoint = (index: number) => {
    const updatedWaypoints = flightPlan.waypoints.filter((_, i) => i !== index);
    setFlightPlan({ ...flightPlan, waypoints: updatedWaypoints });
  };

  // 編集開始ハンドラー
  const handleStartEdit = (index: number, mode: 'name' | 'id' | 'position') => {
    const wp = flightPlan.waypoints[index];
    setEditingWaypointState({
      index,
      mode,
      waypoint: { ...wp }, // ウェイポイントのコピーを設定
      bearing: mode === 'id' && wp.metadata ? wp.metadata.bearing.toString() : '',
      distance: mode === 'id' && wp.metadata ? wp.metadata.distance.toString() : '',
      dmsLatitude: mode === 'position' ? decimalToDMS(wp.latitude, wp.longitude).latDMS : '',
      dmsLongitude: mode === 'position' ? decimalToDMS(wp.latitude, wp.longitude).lonDMS : '',
    });
  };

  // 編集キャンセルハンドラー
  const handleCancelEdit = () => {
    setEditingWaypointState({
      index: null,
      mode: null,
      waypoint: null,
      bearing: '',
      distance: '',
      dmsLatitude: '',
      dmsLongitude: '',
    });
  };

  // 名前編集ハンドラー
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingWaypointState.waypoint) {
      setEditingWaypointState({
        ...editingWaypointState,
        waypoint: { ...editingWaypointState.waypoint, name: e.target.value }
      });
    }
  };

  // 磁方位編集ハンドラー
  const handleBearingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingWaypointState({ ...editingWaypointState, bearing: e.target.value });
  };

  // 距離編集ハンドラー
  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingWaypointState({ ...editingWaypointState, distance: e.target.value });
  };

  // DMS緯度編集ハンドラー
  const handleDmsLatitudeChange = (value: string) => {
    setEditingWaypointState({ ...editingWaypointState, dmsLatitude: value });
  };

  // DMS経度編集ハンドラー
  const handleDmsLongitudeChange = (value: string) => {
    setEditingWaypointState({ ...editingWaypointState, dmsLongitude: value });
  };

  // 編集保存ハンドラー
  const handleSaveEdit = () => {
    if (editingIndex === null || !editingWaypointState.waypoint) return;

    let updatedWaypoint: Waypoint = { ...editingWaypointState.waypoint };

    if (editingMode === 'id') {
      // ID編集モードの保存処理：オフセット値のみを更新
      if (editingBearing && editingDistance && editingWaypointState.waypoint.metadata) { // metadataの存在をチェック
        const bearingNum = parseFloat(editingBearing);
        const distanceNum = parseFloat(editingDistance);

        if (isNaN(bearingNum) || isNaN(distanceNum)) {
          console.error('[ERROR] 無効な数値入力:', { bearing: editingBearing, distance: editingDistance });
          return;
        }

        const offset = offsetCalculateOffsetPoint(
          editingWaypointState.waypoint.metadata.baseLatitude, // 元のNAVAIDの緯度を使用
          editingWaypointState.waypoint.metadata.baseLongitude, // 元のNAVAIDの経度を使用
          bearingNum,
          distanceNum
        );

        if (offset) {
          const formattedBearing = formatBearing(bearingNum);
          const formattedDistance = formatDistance(distanceNum);
          updatedWaypoint = {
            ...updatedWaypoint,
            coordinates: [offset.lon, offset.lat],
            latitude: offset.lat,
            longitude: offset.lon,
            metadata: {
              ...editingWaypointState.waypoint.metadata, // 既存のmetadataを保持
              bearing: bearingNum,
              distance: distanceNum,
            }
          };
          // IDと名前を更新 (formattedBearingを使用)
          updatedWaypoint.id = `${updatedWaypoint.metadata!.baseNavaid}_${formattedBearing}/${formattedDistance}`;
          updatedWaypoint.name = `${updatedWaypoint.name.split(' ')[0]} (${formattedBearing}/${formattedDistance})`;
        }
      }
    } else if (editingMode === 'position') {
      // 位置編集モードの保存処理
      const latDecimal = dmsToDecimal(dmsLatitude || '', true);
      const lonDecimal = dmsToDecimal(dmsLongitude || '', false);
      if (latDecimal !== null && lonDecimal !== null) {
        updatedWaypoint = {
          ...updatedWaypoint,
          coordinates: [lonDecimal, latDecimal],
          latitude: latDecimal,
          longitude: lonDecimal,
        };
      }
    } else if (editingMode === 'name') {
      // 名前編集モードの保存処理 (名前はinput要素で直接編集)
    }

    // ウェイポイントを更新
    const updatedWaypoints = [...flightPlan.waypoints];
    updatedWaypoints[editingIndex] = updatedWaypoint;
    setFlightPlan({ ...flightPlan, waypoints: updatedWaypoints });

    // 編集状態をリセット
    handleCancelEdit();
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-sm">
      <legend className="text-lg font-semibold mb-4 text-gray-50">Waypoint List</legend>
      <ul>
        {flightPlan.waypoints.map((waypoint, index) => (
          <li key={index} className="mb-4 p-4 border rounded-lg border-gray-700 bg-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                {/* ウェイポイント名 (1行目) */}
                {editingMode === 'name' && editingIndex === index ? (
                  <input
                    type="text"
                    value={editingWaypoint?.name ?? ''}
                    onChange={handleNameChange}
                    className="mt-1 block rounded-md border-gray-700 shadow-sm bg-gray-800 text-gray-50"
                  />
                ) : (
                  <button
                    onClick={() => handleStartEdit(index, 'name')}
                    className="text-left hover:underline font-semibold text-gray-50"
                  >
                    {waypoint.name}
                  </button>
                )}
              </div>

              {/* 編集モードの場合、保存とキャンセルボタンを表示（共通） */}
              {editingMode !== null && editingIndex === index && (
                <div className="space-x-2">
                  <button onClick={handleSaveEdit} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">保存</button>
                  <button onClick={handleCancelEdit} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">キャンセル</button>
                </div>
              )}

              {/* ウェイポイントの移動と削除ボタン（共通） */}
              <div className="flex items-center space-x-2">
                <button onClick={() => handleMoveWaypointUp(index)} className="p-1 rounded-full hover:bg-gray-700 text-gray-50" aria-label="Move Waypoint Up"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => handleMoveWaypointDown(index)} className="p-1 rounded-full hover:bg-gray-700 text-gray-50" aria-label="Move Waypoint Down"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => handleRemoveWaypoint(index)} className="p-1 rounded-full hover:bg-red-700 text-red-500" aria-label="Remove Waypoint">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.5 5.25a.75.75 0 0 0-1.06 1.06L10.94 12l-4.5 4.5a.75.75 0 1 0 1.06 1.06L12 13.06l4.5 4.5a.75.75 0 1 0 1.06-1.06L13.06 12l4.5-4.5a.75.75 0 0 0-1.06-1.06L12 10.94 7.5 6.44Z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>

            {/* 詳細情報の表示 (ID, 位置) */}
            <div className="text-sm text-gray-400 mt-1">
              {/* ID (2行目) - 編集モード */}
              {editingMode === 'id' && editingIndex === index ? (
                <div className="space-y-2">
                  {/* 磁方位と距離の入力 (オフセットWaypointのみ) - 常に表示 */}
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">磁方位(°)</label>
                      <input
                        type="number"
                        value={editingBearing}
                        onChange={handleBearingChange}
                        placeholder="0 - 360"
                        className="mt-1 block w-full rounded-md border-gray-700 shadow-sm bg-gray-800 text-gray-50"
                        min="0"
                        max="360"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">距離(nm)</label>
                      <input
                        type="number"
                        value={editingDistance}
                        onChange={handleDistanceChange}
                        placeholder="例: 10"
                        className="mt-1 block w-full rounded-md border-gray-700 shadow-sm bg-gray-800 text-gray-50"
                        min="0"
                      />
                    </div>
                  </>
                </div>
              ) : (
                // ID (2行目) - 通常表示
                <div onClick={() => handleStartEdit(index, 'id')} className="cursor-pointer hover:underline text-gray-400">
                  <span className="text-sm text-gray-400">ID: {waypoint.id}</span>
                </div>
              )}

              {/* 位置情報 (3行目) - 編集モード */}
              {editingMode === 'position' && editingIndex === index ? (
                <div className="space-y-2">
                  <DmsInput
                    label="緯度 (ddmmss形式、例: N334005)"
                    value={dmsLatitude || ''}
                    onChange={handleDmsLatitudeChange}
                    latitude={true}
                  />
                  <DmsInput
                    label="経度 (dddmmss形式、例: E1234005)"
                    value={dmsLongitude || ''}
                    onChange={handleDmsLongitudeChange}
                    latitude={false}
                  />
                </div>
              ) : (
                // 位置情報 (3行目) - 通常表示
                <div
                  onClick={() => handleStartEdit(index, 'position')}
                  className="cursor-pointer hover:underline mt-2 text-gray-400"
                >
                  位置: {formatDMS(waypoint.latitude, waypoint.longitude)}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WaypointList; 