import { loadFlightPlanDraft } from '../../../flightPlanDraft';
import { flightPlanToWaypoint3D } from './flightPlanToWaypoint3D';
import {
  clonePlanning3dViewerUi,
  createDefaultPlanning3dViewerUi,
  parsePlanning3dViewerUi,
  type Planning3dViewerUiState,
} from './planning3dViewerUi';
import type { Waypoint3D } from './types';

/** Same-origin BroadcastChannel for Planning ↔ 3D pop-out (2D may reuse later). */
export const PLANNING_3D_POPOUT_CHANNEL = 'fa-planning-3d-popout-v1';

export const PLANNING_3D_POPOUT_PATH = '/planning/3d-popout';

export type Planning3dPopoutRole = 'host' | 'client';

export type Planning3dPopoutWaypointsPayload = {
  waypoints: Waypoint3D[];
  /** Empty array is valid (in-page viewer falls back to demo route). */
};

export type Planning3dPopoutStatePayload = Planning3dPopoutWaypointsPayload & {
  isProUser: boolean;
  /** Monotonic revision from host; clients ignore stale updates. */
  revision: number;
  viewerUi: Planning3dViewerUiState;
};

export type Planning3dPopoutMessage =
  | { type: 'state'; payload: Planning3dPopoutStatePayload }
  | { type: 'viewer-ui'; payload: { revision: number; viewerUi: Planning3dViewerUiState } }
  | { type: 'ready' }
  | { type: 'closed' }
  | { type: 'focus-request' };

export function createPlanning3dPopoutState(
  waypoints: Waypoint3D[],
  isProUser: boolean,
  revision: number,
  viewerUi: Planning3dViewerUiState,
): Planning3dPopoutStatePayload {
  return {
    waypoints: waypoints.map(cloneWaypoint3D),
    isProUser,
    revision,
    viewerUi: clonePlanning3dViewerUi(viewerUi),
  };
}

export function cloneWaypoint3D(wp: Waypoint3D): Waypoint3D {
  return {
    name: wp.name,
    lat: wp.lat,
    lon: wp.lon,
    altFt: wp.altFt,
    ...(wp.speedKts !== undefined ? { speedKts: wp.speedKts } : {}),
  };
}

export function parsePlanning3dPopoutMessage(data: unknown): Planning3dPopoutMessage | null {
  if (!data || typeof data !== 'object') return null;
  const rec = data as Record<string, unknown>;
  const type = rec.type;
  if (type === 'ready' || type === 'closed' || type === 'focus-request') {
    return { type };
  }
  if (type === 'viewer-ui' && rec.payload && typeof rec.payload === 'object') {
    const payload = rec.payload as Record<string, unknown>;
    const revision = typeof payload.revision === 'number' ? payload.revision : 0;
    const viewerUi = parsePlanning3dViewerUi(payload.viewerUi, []);
    return { type: 'viewer-ui', payload: { revision, viewerUi } };
  }
  if (type === 'state' && rec.payload && typeof rec.payload === 'object') {
    const payload = rec.payload as Record<string, unknown>;
    const waypointsRaw = payload.waypoints;
    if (!Array.isArray(waypointsRaw)) return null;
    const waypoints: Waypoint3D[] = [];
    for (const item of waypointsRaw) {
      const wp = parseWaypoint3D(item);
      if (wp) waypoints.push(wp);
    }
    const revision = typeof payload.revision === 'number' ? payload.revision : 0;
    const isProUser = payload.isProUser === true;
    const viewerUi = parsePlanning3dViewerUi(payload.viewerUi, waypoints);
    return {
      type: 'state',
      payload: { waypoints, isProUser, revision, viewerUi },
    };
  }
  return null;
}

function parseWaypoint3D(value: unknown): Waypoint3D | null {
  if (!value || typeof value !== 'object') return null;
  const w = value as Record<string, unknown>;
  if (typeof w.name !== 'string') return null;
  if (typeof w.lat !== 'number' || typeof w.lon !== 'number' || typeof w.altFt !== 'number') {
    return null;
  }
  const speedKts = typeof w.speedKts === 'number' ? w.speedKts : undefined;
  return speedKts !== undefined
    ? { name: w.name, lat: w.lat, lon: w.lon, altFt: w.altFt, speedKts }
    : { name: w.name, lat: w.lat, lon: w.lon, altFt: w.altFt };
}

/** Apply a host state message; returns null if revision is stale. */
export function applyPlanning3dPopoutState(
  currentRevision: number,
  message: Planning3dPopoutMessage,
): { next: Planning3dPopoutStatePayload; revision: number } | null {
  if (message.type !== 'state') return null;
  if (message.payload.revision < currentRevision) return null;
  return {
    revision: message.payload.revision,
    next: createPlanning3dPopoutState(
      message.payload.waypoints,
      message.payload.isProUser,
      message.payload.revision,
      message.payload.viewerUi,
    ),
  };
}

export function applyPlanning3dPopoutViewerUi(
  currentRevision: number,
  message: Planning3dPopoutMessage,
): { viewerUi: Planning3dViewerUiState; revision: number } | null {
  if (message.type !== 'viewer-ui') return null;
  if (message.payload.revision < currentRevision) return null;
  return {
    revision: message.payload.revision,
    viewerUi: clonePlanning3dViewerUi(message.payload.viewerUi),
  };
}

/** Persisted draft fallback when pop-out opens before first BroadcastChannel message. */
export function loadPlanning3dPopoutFallbackWaypoints(): Waypoint3D[] {
  const draft = loadFlightPlanDraft();
  if (!draft) return [];
  const converted = flightPlanToWaypoint3D(draft);
  return converted ?? [];
}

export function loadPlanning3dPopoutFallbackViewerUi(
  waypoints: Waypoint3D[],
): Planning3dViewerUiState {
  return createDefaultPlanning3dViewerUi(waypoints);
}

export function postPlanning3dPopoutMessage(
  channel: BroadcastChannel | null,
  message: Planning3dPopoutMessage,
): void {
  if (!channel) return;
  try {
    channel.postMessage(message);
  } catch {
    /* channel may be closed */
  }
}
