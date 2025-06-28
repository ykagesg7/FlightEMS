import React, { useState } from 'react';
import Select, { SingleValue } from 'react-select';
import { SelectOption } from '../../utils/reactSelectStyles';
import { Waypoint } from '../../types';
import { calculateOffsetPoint } from '../../utils/offset';
import { reactSelectStyles } from '../../utils/reactSelectStyles';

interface NavaidOption extends SelectOption {
  value: string;
  label: string;
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  ch?: string;
  frequency?: string;
}

interface NavaidSelectorProps {
  options: NavaidOption[];
  selectedNavaid: NavaidOption | null;
  setSelectedNavaid: (navaid: NavaidOption | null) => void;
  onAdd: (waypoint: Waypoint) => void;
}

const NavaidSelector: React.FC<NavaidSelectorProps> = ({ options, selectedNavaid, setSelectedNavaid, onAdd }) => {
  const [bearing, setBearing] = useState<string>('');
  const [distance, setDistance] = useState<string>('');

  const handleAddWaypoint = () => {
    if (!selectedNavaid || !bearing || !distance) return;

    const waypoint: Waypoint = {
      id: `${selectedNavaid.id}-${bearing}-${distance}`,
      name: `${selectedNavaid.name}/${bearing}°/${distance}nm`,
      type: 'navaid',
      sourceId: selectedNavaid.id,
      ch: selectedNavaid.ch,
      coordinates: [selectedNavaid.longitude, selectedNavaid.latitude], // GeoJSON format
      latitude: selectedNavaid.latitude,
      longitude: selectedNavaid.longitude,
      nameEditable: true,
      metadata: {
        baseNavaid: selectedNavaid.name,
        bearing: parseFloat(bearing),
        distance: parseFloat(distance),
        baseLatitude: selectedNavaid.latitude,
        baseLongitude: selectedNavaid.longitude
      }
    };

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
      <Select
        options={options}
        value={selectedNavaid}
        onChange={handleNavaidChange}
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
        onClick={handleAddWaypoint}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        NAVAID をルートに追加
      </button>
    </div>
  );
};

export default NavaidSelector; 
