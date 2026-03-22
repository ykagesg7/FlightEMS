import React, { useState } from 'react';
import Select, { SingleValue } from 'react-select';
import { NavaidOption, Waypoint } from '../../../../types/index';
import { planningRouteSelectStyles } from '../../../../utils/reactSelectStyles';
import { buildWaypointFromNavaid } from '../../utils/buildWaypointFromNavaid';

interface NavaidSelectorProps {
  options: NavaidOption[];
  selectedNavaid: NavaidOption | null;
  setSelectedNavaid: React.Dispatch<React.SetStateAction<NavaidOption | null>>;
  onAdd: (waypoint: Waypoint) => void;
}

const NavaidSelector: React.FC<NavaidSelectorProps> = ({
  options,
  selectedNavaid,
  setSelectedNavaid,
  onAdd,
}) => {
  const [bearing, setBearing] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleAddWaypoint = () => {
    setError('');
    if (!selectedNavaid) return;
    const result = buildWaypointFromNavaid(selectedNavaid, bearing, distance);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onAdd(result.waypoint);
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
        placeholder="NAVAID を選択"
        isClearable
        styles={planningRouteSelectStyles}
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

      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}

      <button
        type="button"
        onClick={handleAddWaypoint}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        NAVAID をルートに追加
      </button>
    </div>
  );
};

export default NavaidSelector;
