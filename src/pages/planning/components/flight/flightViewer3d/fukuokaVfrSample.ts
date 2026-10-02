import type { Waypoint3D } from './types';

/** 福岡周辺 VFR デモ（RJFF → 志賀島 → 壱岐 → RJFR） */
export const FUKUOKA_VFR_SAMPLE_WAYPOINTS: Waypoint3D[] = [
  { name: 'RJFF', lat: 33.5859, lon: 130.451, altFt: 32, speedKts: 110 },
  { name: '志賀島', lat: 33.4169, lon: 130.3831, altFt: 2500, speedKts: 120 },
  { name: '壱岐', lat: 33.785, lon: 129.71, altFt: 3500, speedKts: 120 },
  { name: 'RJFR', lat: 33.1497, lon: 130.3022, altFt: 6, speedKts: 100 },
];
