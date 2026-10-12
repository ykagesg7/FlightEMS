import type { SpiralLmsDisplayStatus } from './spiralLmsNodeDisplay';

/** Tailwind badge classes (2D hub). */
export function spiralLmsDisplayStatusBadgeClass(status: SpiralLmsDisplayStatus): string {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-green-100 text-green-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'MASTERED':
      return 'bg-gray-100 text-gray-800';
    case 'MAINTENANCE':
      return 'bg-amber-100 text-amber-900';
    case 'scheduled':
      return 'bg-purple-100 text-purple-900';
    case 'LOCKED':
    default:
      return 'bg-gray-200 text-gray-700';
  }
}

/** Hex colors for WebGL materials (3D spiral). */
export function spiralLmsDisplayStatusColorHex(status: SpiralLmsDisplayStatus): string {
  switch (status) {
    case 'AVAILABLE':
      return '#166534';
    case 'IN_PROGRESS':
      return '#1d4ed8';
    case 'MASTERED':
      return '#4b5563';
    case 'MAINTENANCE':
      return '#b45309';
    case 'scheduled':
      return '#6b21a8';
    case 'LOCKED':
    default:
      return '#9ca3af';
  }
}
