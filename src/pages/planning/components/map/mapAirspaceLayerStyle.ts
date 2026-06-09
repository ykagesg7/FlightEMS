import type { PathOptions } from 'leaflet';

/** ルート線（orange）・訓練空域（yellow）と区別しやすい色（ESRI 暗背景向け） */
export const RAPCON_LAYER_STYLE: PathOptions = {
  color: '#e879f9',
  weight: 2,
  opacity: 0.9,
  fillColor: '#e879f9',
  fillOpacity: 0.06,
};

export const ACC_SECTOR_HIGH_STYLE: PathOptions = {
  color: '#60a5fa',
  weight: 2,
  opacity: 0.85,
};

export const ACC_SECTOR_LOW_STYLE: PathOptions = {
  color: '#4ade80',
  weight: 2,
  opacity: 0.85,
};
