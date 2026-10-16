export function isWebGlAvailable(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    const contexts = ['webgl2', 'webgl', 'experimental-webgl'] as const;
    for (const kind of contexts) {
      try {
        if (canvas.getContext(kind)) {
          return true;
        }
      } catch {
        // jsdom and some headless environments throw instead of returning null
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** When true, show 2D inspection list instead of the WebGL spiral. */
export function shouldUseSpiralLms3dFallback(): boolean {
  return !isWebGlAvailable() || prefersReducedMotion();
}
