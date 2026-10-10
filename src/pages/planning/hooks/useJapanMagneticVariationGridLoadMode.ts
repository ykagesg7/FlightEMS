import { useSyncExternalStore } from 'react';
import {
  getJapanMagneticVariationGridLoadMode,
  subscribeJapanMagneticVariationGridLoadMode,
  type JapanMagneticVariationGridLoadMode,
} from '../../../utils/japanMagneticVariation';

export function useJapanMagneticVariationGridLoadMode(): JapanMagneticVariationGridLoadMode {
  return useSyncExternalStore(
    subscribeJapanMagneticVariationGridLoadMode,
    getJapanMagneticVariationGridLoadMode,
    getJapanMagneticVariationGridLoadMode,
  );
}
