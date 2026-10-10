import React from 'react';
import { GSI_GEOMAG_FALLBACK_DECLINATION_WEST_DEG } from '../../../utils/gsiGeomag2020DeclinationWest';
import { useJapanMagneticVariationGridLoadMode } from '../hooks/useJapanMagneticVariationGridLoadMode';

/**
 * 磁気偏差 u16 格子の読込中、または取得失敗時に代表偏角利用を表示する（教育用概算）。
 */
export const MagneticVariationFallbackNotice: React.FC = () => {
  const gridLoadMode = useJapanMagneticVariationGridLoadMode();

  if (gridLoadMode === 'loaded') {
    return null;
  }

  const message =
    gridLoadMode === 'pending'
      ? `磁気偏差の格子データを読み込み中です。読み込みが終わるまで、羽田付近の代表値（${GSI_GEOMAG_FALLBACK_DECLINATION_WEST_DEG}°W）を使っています。`
      : `磁気偏差データ（国土地理院 2020.0 格子）を読み込めませんでした。磁方位・偏角は羽田付近の代表値（約${GSI_GEOMAG_FALLBACK_DECLINATION_WEST_DEG}° 西偏）による概算です。ネットワークを確認のうえページを再読み込みしてください。`;

  return (
    <div
      className="mb-3 rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-xs sm:text-sm text-amber-100"
      role="alert"
    >
      {message}
    </div>
  );
};
