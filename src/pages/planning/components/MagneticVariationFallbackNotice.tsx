import React from 'react';
import { GSI_GEOMAG_FALLBACK_DECLINATION_WEST_DEG } from '../../../utils/gsiGeomag2020DeclinationWest';
import { isJapanMagneticVariationGridFallbackActive } from '../../../utils/japanMagneticVariation';

/**
 * 磁気偏差 u16 格子の取得に失敗したときだけ表示する警告（教育用概算）。
 */
export const MagneticVariationFallbackNotice: React.FC = () => {
  if (!isJapanMagneticVariationGridFallbackActive()) {
    return null;
  }

  return (
    <div
      className="mb-3 rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-xs sm:text-sm text-amber-100"
      role="alert"
    >
      磁気偏差データ（国土地理院 2020.0 格子）を読み込めませんでした。磁方位・偏角は羽田付近の代表値（約
      {GSI_GEOMAG_FALLBACK_DECLINATION_WEST_DEG}° 西偏）による概算です。ネットワークを確認のうえページを再読み込みしてください。
    </div>
  );
};
