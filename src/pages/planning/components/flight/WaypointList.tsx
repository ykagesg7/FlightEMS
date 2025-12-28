import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import React, { useReducer } from 'react';
import { FlightPlan, Waypoint } from '../../../../types/index';
import { decimalToDMS, dmsToDecimal, formatDMS } from '../../../../utils';
import { formatBearing, formatDistance } from '../../../../utils/format';
import { calculateOffsetPoint as offsetCalculateOffsetPoint } from '../../../../utils/offset';

interface WaypointListProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

/**
 * Waypoint List コンポーネント
 * ウェイポイントのリスト表示と操作（移動、削除、各種編集モード）を行う
 */
const WaypointList: React.FC<WaypointListProps> = ({ flightPlan, setFlightPlan }) => {
  interface EditingState {
    index: number | null;
    mode: 'name' | 'id' | 'position' | null;
    waypoint: Waypoint | null;
    bearing: string;
    distance: string;
    dmsLatitude: string;
    dmsLongitude: string;
    editingWaypointIndex: number | null;
    editingWaypointName: string;
  }

  const initialEditingState: EditingState = {
    index: null,
    mode: null,
    waypoint: null,
    bearing: '',
    distance: '',
    dmsLatitude: '',
    dmsLongitude: '',
    editingWaypointIndex: null,
    editingWaypointName: '',
  };

  type EditingAction =
    | { type: 'START_EDIT'; index: number; mode: 'name' | 'id' | 'position'; waypoint: Waypoint }
    | { type: 'CANCEL_EDIT' }
    | { type: 'UPDATE_FIELD'; field: 'bearing' | 'distance' | 'dmsLatitude' | 'dmsLongitude' | 'name' | 'editingWaypointName'; value: string };

  function editingReducer(state: EditingState, action: EditingAction): EditingState {
    switch (action.type) {
      case 'START_EDIT':
        return {
          index: action.index,
          mode: action.mode,
          waypoint: { ...action.waypoint },
          bearing: action.mode === 'id' && action.waypoint.metadata?.bearing !== undefined ? action.waypoint.metadata.bearing.toString() : '',
          distance: action.mode === 'id' && action.waypoint.metadata?.distance !== undefined ? action.waypoint.metadata.distance.toString() : '',
          dmsLatitude: action.mode === 'position'
            ? decimalToDMS(action.waypoint.latitude, action.waypoint.longitude).latDMS
            : '',
          dmsLongitude: action.mode === 'position'
            ? decimalToDMS(action.waypoint.latitude, action.waypoint.longitude).lonDMS
            : '',
          editingWaypointIndex: action.index,
          editingWaypointName: action.waypoint.name || '',
        };
      case 'CANCEL_EDIT':
        return initialEditingState;
      case 'UPDATE_FIELD':
        return { ...state, [action.field]: action.value };
      default:
        return state;
    }
  }

  const [editingState, dispatch] = useReducer(editingReducer, initialEditingState);

  const { index: editingIndex, mode: editingMode, waypoint: editingWaypoint, bearing: editingBearing, distance: editingDistance, dmsLatitude, dmsLongitude, editingWaypointIndex, editingWaypointName } = editingState;

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
    const updatedWaypoints = flightPlan.waypoints.filter((_: Waypoint, i: number) => i !== index);
    setFlightPlan({ ...flightPlan, waypoints: updatedWaypoints });
  };

  // 編集開始ハンドラー
  const handleStartEdit = (index: number, mode: 'name' | 'id' | 'position') => {
    const wp = flightPlan.waypoints[index];
    dispatch({ type: 'START_EDIT', index, mode, waypoint: wp });
  };

  // 編集キャンセルハンドラー
  const handleCancelEdit = () => {
    dispatch({ type: 'CANCEL_EDIT' });
  };

  // 名前編集ハンドラー
  const handleWaypointNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'editingWaypointName', value: e.target.value });
  };

  // 磁方位編集ハンドラー
  const handleBearingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'bearing', value: e.target.value });
  };

  // 距離編集ハンドラー
  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'distance', value: e.target.value });
  };

  // DMS緯度編集ハンドラー
  const handleDmsLatitudeChange = (value: string) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'dmsLatitude', value });
  };

  // DMS経度編集ハンドラー
  const handleDmsLongitudeChange = (value: string) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'dmsLongitude', value });
  };

  // 編集保存ハンドラー
  const handleSaveEdit = () => {
    if (editingIndex === null || !editingWaypoint) return;

    let updatedWaypoint: Waypoint = { ...editingWaypoint };

    if (editingMode === 'id') {
      // ID編集モードの保存処理：オフセット値のみを更新
      if (editingBearing && editingDistance && editingWaypoint.metadata) { // metadataの存在をチェック
        const bearingNum = parseFloat(editingBearing);
        const distanceNum = parseFloat(editingDistance);

        if (isNaN(bearingNum) || isNaN(distanceNum)) {
          console.error('[ERROR] 無効な数値入力', { bearing: editingBearing, distance: editingDistance });
          return;
        }

        const offset = offsetCalculateOffsetPoint(
          editingWaypoint.metadata.baseLatitude, // 元のNAVAIDの緯度を使用
          editingWaypoint.metadata.baseLongitude, // 元のNAVAIDの経度を使用
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
              ...editingWaypoint.metadata, // 既存のmetadataを保持
              bearing: bearingNum,
              distance: distanceNum,
            }
          };
          // IDと名前を更新 (formattedBearingを使用)
          updatedWaypoint.id = `${updatedWaypoint.metadata!.baseNavaid}_${formattedBearing}/${formattedDistance}`;
          updatedWaypoint.name = `${updatedWaypoint.name?.split(' ')[0]} (${formattedBearing}/${formattedDistance})`; // 名前の存在をチェック
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
      // 名前編集モードの保存処理
      updatedWaypoint.name = editingWaypointName;
    }

    // ウェイポイントを更新
    const updatedWaypoints = [...flightPlan.waypoints];
    updatedWaypoints[editingIndex] = updatedWaypoint;
    setFlightPlan({ ...flightPlan, waypoints: updatedWaypoints });

    // 編集状態をリセット
    handleCancelEdit();
  };

  return (
    <div className="shadow-sm rounded-lg p-6 bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/20 text-white">
      <legend className="text-lg font-semibold mb-4 text-gray-50">Waypoint List</legend>
      <ul>
        {flightPlan.waypoints.map((waypoint: Waypoint, index: number) => (
          <li key={index} className="mb-4 p-4 border rounded-lg border-gray-700 bg-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                {/* ウェイポイント名 (1行目) */}
                {editingWaypointIndex === index ? (
                  <input
                    type="text"
                    value={editingWaypointName}
                    onChange={handleWaypointNameChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const updatedWaypoints = [...flightPlan.waypoints];
                        updatedWaypoints[index].name = editingWaypointName;
                        setFlightPlan({ ...flightPlan, waypoints: updatedWaypoints });
                        dispatch({ type: 'CANCEL_EDIT' });
                      }
                    }}
                    autoFocus
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

              {/* 編集モードの場合、保存とキャンセルボタンを表示 */}
              {editingMode !== null && editingIndex === index && (
                <div className="space-x-2">
                  <button onClick={handleSaveEdit} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">保存</button>
                  <button onClick={handleCancelEdit} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">キャンセル</button>
                </div>
              )}

              {/* ウェイポイントの移動と削除ボタン */}
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
                  {/* 磁方位と距離の入力(オフセットWaypointのみ) - 常に表示 */}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      緯度 (ddmmss形式、例: N334005)
                    </label>
                    <input
                      type="text"
                      value={dmsLatitude || ''}
                      onChange={(e) => handleDmsLatitudeChange(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      経度 (dddmmss形式、例: E1234005)
                    </label>
                    <input
                      type="text"
                      value={dmsLongitude || ''}
                      onChange={(e) => handleDmsLongitudeChange(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                </div>
              ) : (
                // 位置情報 (表示) - DMS部分のみクリック可能、DD部分は非編集
                <div className="mt-2 text-gray-400">
                  <div onClick={() => handleStartEdit(index, 'position')} className="cursor-pointer hover:underline inline-block">
                    {formatDMS(waypoint.latitude, waypoint.longitude)}
                  </div>
                  <div>位置(Degree): {waypoint.longitude.toFixed(4)}, {waypoint.latitude.toFixed(4)}</div>
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
