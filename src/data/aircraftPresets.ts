import { AircraftPreset } from '../types';

// T-4練習機（モック値）
export const aircraftPresets: AircraftPreset[] = [
  {
    id: 't4',
    name: 'Kawasaki T-4 (mock)',
    // 双発ジェットの巡航想定値（モック）
    cruiseFuelFlowLbPerHr: 2200,
    taxiFuelLb: 200,
    reserveFuelLb: 800,
    defaultInitialFuelLb: 5000,
  },
];

export const getAircraftPreset = (id?: string) =>
  aircraftPresets.find((preset) => preset.id === id);

