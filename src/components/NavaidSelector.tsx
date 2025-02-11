import React, { useState } from 'react';
import ReactSelect from 'react-select';
import { calculateOffsetPoint } from '../utils/offset';

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
    <div className="mb-4">
      <label className="block text-sm font-medium text-white-700 mb-2">Add NAVAID</label>
      <ReactSelect
        options={options}
        value={selectedNavaid}
        onChange={setSelectedNavaid}
        placeholder="Select NAVAID"
        isClearable
        styles={{
          control: (provided: any) => ({
            ...provided,
            borderRadius: '0.5rem',
            borderColor: '#e5e7eb',
            backgroundColor: '#4b5563',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            '&:hover': {
              borderColor: '#d1d5db',
            },
          }),
          menu: (provided: any) => ({
            ...provided,
            backgroundColor: '#4b5563',
          }),
          option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#6b7280' : '#4b5563',
            color: 'white',
          }),
          placeholder: (provided: any) => ({
            ...provided,
            color: 'white',
          }),
          input: (provided: any) => ({
            ...provided,
            color: 'white',
          }),
          singleValue: (provided: any) => ({
            ...provided,
            color: 'white',
          }),
        }}
      />
      
      <div className="mt-2 space-y-2">
        <div>
          <label className="block text-sm font-medium text-white-700 mb-2">磁方位(°)</label>
          <input
            type="number"
            value={bearing}
            onChange={(e) => setBearing(e.target.value)}
            placeholder="0 - 360"
            className="mt-1 block w-32 rounded-md border-gray-700 shadow-sm px-3 py-2 bg-gray-700 text-gray-50"
            min="0"
            max="360"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white-700 mb-2">距離(nm)</label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="例: 10"
            className="mt-1 block w-32 rounded-md border-gray-700 shadow-sm px-3 py-2 bg-gray-700 text-gray-50"
            min="0"
          />
        </div>
      </div>

      <button
        onClick={handleAdd}
        className="mt-2 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Add NAVAID to Route
      </button>
    </div>
  );
};

export default NavaidSelector; 