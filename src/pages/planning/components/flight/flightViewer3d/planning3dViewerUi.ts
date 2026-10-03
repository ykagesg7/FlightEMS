import type {
  FlightCameraMode,
  FlightImageryMode,
  FlightPlaybackSpeed,
  FlightViewControls,
  Waypoint3D,
} from './types';
import { createFlightViewControls } from './types';

export type Planning3dViewerUiState = {
  viewControls: FlightViewControls;
  playbackSpeed: FlightPlaybackSpeed;
  cameraMode: FlightCameraMode;
  imageryMode: FlightImageryMode;
};

export function createDefaultPlanning3dViewerUi(waypoints: Waypoint3D[]): Planning3dViewerUiState {
  return {
    viewControls: createFlightViewControls(waypoints),
    playbackSpeed: 1,
    cameraMode: 'chase',
    imageryMode: 'gsi',
  };
}

export function clonePlanning3dViewerUi(ui: Planning3dViewerUiState): Planning3dViewerUiState {
  return {
    playbackSpeed: ui.playbackSpeed,
    cameraMode: ui.cameraMode,
    imageryMode: ui.imageryMode,
    viewControls: { ...ui.viewControls },
  };
}

export function previewAltitudeSliderBounds(plannedAltitudeFt: number): {
  minFt: number;
  maxFt: number;
} {
  const minFt = Math.max(500, plannedAltitudeFt - 10_000);
  const maxFt = Math.min(60_000, plannedAltitudeFt + 15_000);
  return { minFt, maxFt };
}

export function parsePlanning3dViewerUi(
  raw: unknown,
  waypoints: Waypoint3D[],
): Planning3dViewerUiState {
  const defaults = createDefaultPlanning3dViewerUi(waypoints);
  if (!raw || typeof raw !== 'object') return defaults;
  const rec = raw as Record<string, unknown>;
  const viewRaw = rec.viewControls;
  let viewControls = defaults.viewControls;
  if (viewRaw && typeof viewRaw === 'object') {
    const v = viewRaw as Record<string, unknown>;
    viewControls = {
      previewAltitudeFt:
        typeof v.previewAltitudeFt === 'number'
          ? v.previewAltitudeFt
          : defaults.viewControls.previewAltitudeFt,
      chaseDistanceM:
        typeof v.chaseDistanceM === 'number'
          ? v.chaseDistanceM
          : defaults.viewControls.chaseDistanceM,
      chasePitchDeg:
        typeof v.chasePitchDeg === 'number'
          ? v.chasePitchDeg
          : defaults.viewControls.chasePitchDeg,
    };
  }
  const playbackSpeed =
    rec.playbackSpeed === 1 || rec.playbackSpeed === 2 || rec.playbackSpeed === 3
      ? rec.playbackSpeed
      : defaults.playbackSpeed;
  const cameraMode: FlightCameraMode =
    rec.cameraMode === 'cockpit' ? 'cockpit' : defaults.cameraMode;
  const imageryMode: FlightImageryMode =
    rec.imageryMode === 'google' ? 'google' : defaults.imageryMode;
  return { viewControls, playbackSpeed, cameraMode, imageryMode };
}
