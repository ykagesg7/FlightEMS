/**
 * Spiral LMS feature flag — default off. May be enabled only in local dev (`npm run dev`).
 * Production builds ignore VITE_SPIRAL_LMS_ENABLED even if set.
 */
export function isSpiralLmsFeatureEnabled(): boolean {
  if (!import.meta.env.DEV) {
    return false;
  }
  return import.meta.env.VITE_SPIRAL_LMS_ENABLED === 'true';
}
