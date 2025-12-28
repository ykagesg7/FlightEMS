import React, { useState } from 'react';
import Select, { SingleValue } from 'react-select';
import { NavaidOption, Waypoint } from '../../../../types/index';
import { calculateOffsetPoint } from '../../../../utils/offset';
import { reactSelectStyles } from '../../../../utils/reactSelectStyles';

interface NavaidSelectorProps {
  options: NavaidOption[];
  selectedNavaid: NavaidOption | null;
  setSelectedNavaid: React.Dispatch<React.SetStateAction<NavaidOption | null>>;
  onAdd: (waypoint: Waypoint) => void;
}

const NavaidSelector: React.FC<NavaidSelectorProps> = ({ options, selectedNavaid, setSelectedNavaid, onAdd }) => {
  const [bearing, setBearing] = useState<string>('');
  const [distance, setDistance] = useState<string>('');

  const handleAddWaypoint = () => {
    if (!selectedNavaid) return;

    // 磁方位と距離の両方が入力されているかチェック
    const hasBearing = bearing.trim() !== '';
    const hasDistance = distance.trim() !== '';

    // 片方だけ入力されている場合はエラー
    if (hasBearing !== hasDistance) {
      console.error('磁方位と距離は両方入力するか、両方とも空にしてください');
      return;
    }

    let waypoint: Waypoint;

    if (hasBearing && hasDistance) {
      // ✅ 磁方位と距離からオフセット地点を計算
      const bearingNum = parseFloat(bearing);
      const distanceNum = parseFloat(distance);

      const offset = calculateOffsetPoint(
        selectedNavaid.latitude,
        selectedNavaid.longitude,
        bearingNum,
        distanceNum
      );

      if (!offset) {
        console.error('オフセット計算に失敗しました');
        return;
      }

      // ✅ 計算されたオフセット地点の座標を使用
      waypoint = {
        id: `${selectedNavaid.value}-${bearing}-${distance}`,
        name: `${selectedNavaid.name}/${bearing}°/${distance}nm`,
        type: 'navaid',
        sourceId: selectedNavaid.value,
        ch: selectedNavaid.ch,
        coordinates: [offset.lon, offset.lat], // ✅ オフセット座標（GeoJSON format）
        latitude: offset.lat,  // ✅ オフセット緯度
        longitude: offset.lon, // ✅ オフセット経度
        nameEditable: true,
        metadata: {
          baseNavaid: selectedNavaid.name,
          bearing: bearingNum,
          distance: distanceNum,
          baseLatitude: selectedNavaid.latitude,
          baseLongitude: selectedNavaid.longitude
        }
      };
    } else {
      // ✅ NAVAID単体を追加（オフセットなし）
      waypoint = {
        id: selectedNavaid.value,
        name: selectedNavaid.name,
        type: 'navaid',
        sourceId: selectedNavaid.value,
        ch: selectedNavaid.ch,
        coordinates: [selectedNavaid.longitude, selectedNavaid.latitude], // GeoJSON format
        latitude: selectedNavaid.latitude,
        longitude: selectedNavaid.longitude,
        nameEditable: true,
        metadata: {
          baseNavaid: selectedNavaid.name,
          bearing: undefined,
          distance: undefined,
          baseLatitude: selectedNavaid.latitude,
          baseLongitude: selectedNavaid.longitude
        }
      };
    }

    onAdd(waypoint);
    setBearing('');
    setDistance('');
  };

  const handleNavaidChange = (newValue: SingleValue<NavaidOption>) => {
    setSelectedNavaid(newValue);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">NAVAID選択</label>
      <Select<NavaidOption>
        options={options}
        value={selectedNavaid}
        onChange={handleNavaidChange}
        placeholder="Select NAVAID"
        isClearable
        styles={reactSelectStyles as any}
      />

      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">磁方位(°)</label>
          <input
            type="number"
            value={bearing}
            onChange={(e) => setBearing(e.target.value)}
            placeholder="0 - 360"
            className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
            min="0"
            max="360"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">距離(nm)</label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="例: 10"
            className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
            min="0"
          />
        </div>
      </div>

      <button
        onClick={handleAddWaypoint}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        NAVAID をルートに追加
      </button>
    </div>
  );
};

export default NavaidSelector;
