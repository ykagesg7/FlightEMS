import type { RouteObject } from 'react-router-dom';
import { lazyRoute } from '../layouts/routeLazy';

const spiralLmsHubImporter = import.meta.env.DEV
  ? () => import('../dev/spiralLms/SpiralLmsHubPage')
  : null;

const spiralLms3dImporter = import.meta.env.DEV
  ? () => import('../dev/spiralLms/SpiralLms3dPage')
  : null;

/**
 * Dev-only spiral LMS UI routes (`VITE_SPIRAL_LMS_ENABLED` is checked inside pages).
 * Importers are omitted from production bundles via `import.meta.env.DEV`.
 */
export function buildSpiralLmsDevRoutes(): RouteObject[] {
  if (!spiralLmsHubImporter) {
    return [];
  }

  const routes: RouteObject[] = [
    {
      path: 'dev/spiral-lms',
      ...lazyRoute(spiralLmsHubImporter),
    },
  ];

  if (spiralLms3dImporter) {
    routes.push({
      path: 'dev/spiral-lms/3d',
      ...lazyRoute(spiralLms3dImporter),
    });
  }

  return routes;
}
