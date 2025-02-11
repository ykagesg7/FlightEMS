import React from 'react';
import ReactSelect, { StylesConfig } from 'react-select';
import { Airport } from '../types';

interface AirportSelectProps {
  label: string;
  options: Airport[];
  selectedOption: Airport | null;
  onChange: (option: Airport | null) => void;
  placeholder?: string;
  className?: string;
  styles?: StylesConfig<Airport, false>;
  isClearable?: boolean;
}

const AirportSelect: React.FC<AirportSelectProps> = ({
  label,
  options,
  selectedOption,
  onChange,
  placeholder,
  isClearable = true,
  styles
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-white-700 mb-2">{label}</label>
      <ReactSelect
        options={options}
        value={selectedOption}
        onChange={onChange}
        placeholder={placeholder}
        isClearable={isClearable}
        styles={styles}
      />
    </div>
  );
};

export default AirportSelect; 