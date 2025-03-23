import React, { useState } from 'react';
import ReactSelect from 'react-select';
import { calculateOffsetPoint } from '../utils/offset';
import { reactSelectStyles } from '../utils/reactSelectStyles';

interface NavaidSelectorProps {
  options: any[];
  selectedNavaid: any;
  setSelectedNavaid: React.Dispatch<React.SetStateAction<any>>;
  onAdd: (waypoint: any) => void;
}

const NavaidSelector: React.FC<NavaidSelectorProps> = ({ options, selectedNavaid, setSelectedNavaid, onAdd }) => {
  const [bearing, setBearing] = useState<string>('');
  const [distance, setDistance] = useState<string>('');

  const handleAdd = () => {
    if (selectedNavaid) {
      const navaidName = selectedNavaid.label.split(' ')[0];
      const navaidId = selectedNavaid.value;
      const formattedBearing = bearing.padStart(3, '0');
      
      let waypoint: any = {
        id: navaidId,
        name: navaidName,
        type: selectedNavaid.type,
        coordinates: selectedNavaid.coordinates,
        ch: selectedNavaid.ch,
        latitude: selectedNavaid.latitude,
        longitude: selectedNavaid.longitude,
      };

      if (bearing && distance) {
        const offset = calculateOffsetPoint(
          selectedNavaid.latitude,
          selectedNavaid.longitude,
          parseFloat(bearing),
          parseFloat(distance)
        );
        if (offset) {
          waypoint = {
            id: `${navaidId}_${formattedBearing}/${distance}`,
            name: `${navaidName} (${formattedBearing}/${distance})`,
            type: 'custom',
            coordinates: [offset.lon, offset.lat],
            latitude: offset.lat,
            longitude: offset.lon,
            metadata: {
              baseNavaid: navaidId,
              bearing: parseFloat(bearing),
              distance: parseFloat(distance),
              baseLatitude: selectedNavaid.latitude,
              baseLongitude: selectedNavaid.longitude
            }
          };
        }
      }

      onAdd(waypoint);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">NAVAID選択</label>
      <ReactSelect
        options={options}
        value={selectedNavaid}
        onChange={setSelectedNavaid}
        placeholder="Select NAVAID"
        isClearable
        styles={reactSelectStyles}
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
        onClick={handleAdd}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        NAVAID をルートに追加
      </button>
    </div>
  );
};

export default NavaidSelector; 