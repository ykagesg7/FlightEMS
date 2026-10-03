import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PLANNING_3D_POPOUT_CHANNEL,
  applyPlanning3dPopoutState,
  applyPlanning3dPopoutViewerUi,
  loadPlanning3dPopoutFallbackViewerUi,
  loadPlanning3dPopoutFallbackWaypoints,
  parsePlanning3dPopoutMessage,
  postPlanning3dPopoutMessage,
} from './planning3dPopoutSync';
import {
  clonePlanning3dViewerUi,
  type Planning3dViewerUiState,
} from './planning3dViewerUi';
import type { Waypoint3D } from './types';
import { useFlightViewer3dProUser } from '../../../hooks/useFlightViewer3dProUser';

export type Planning3dPopoutClientState = {
  waypoints: Waypoint3D[];
  isProUser: boolean;
  revision: number;
  viewerUi: Planning3dViewerUiState;
};

function initialClientState(): Planning3dPopoutClientState {
  const waypoints = loadPlanning3dPopoutFallbackWaypoints();
  return {
    waypoints,
    isProUser: false,
    revision: 0,
    viewerUi: loadPlanning3dPopoutFallbackViewerUi(waypoints),
  };
}

export function usePlanning3dPopoutClient(): Planning3dPopoutClientState & {
  setViewerUi: (next: Planning3dViewerUiState) => void;
} {
  const isProFromAuth = useFlightViewer3dProUser();
  const [state, setState] = useState<Planning3dPopoutClientState>(() => ({
    ...initialClientState(),
    isProUser: isProFromAuth,
  }));
  const revisionRef = useRef(state.revision);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    setState((prev) => ({ ...prev, isProUser: isProFromAuth }));
  }, [isProFromAuth]);

  const applyMessage = useCallback((data: unknown) => {
    const msg = parsePlanning3dPopoutMessage(data);
    if (!msg) return;
    if (msg.type === 'state') {
      const applied = applyPlanning3dPopoutState(revisionRef.current, msg);
      if (!applied) return;
      revisionRef.current = applied.revision;
      setState(applied.next);
      return;
    }
    if (msg.type === 'viewer-ui') {
      const applied = applyPlanning3dPopoutViewerUi(revisionRef.current, msg);
      if (!applied) return;
      revisionRef.current = applied.revision;
      setState((prev) => ({ ...prev, viewerUi: applied.viewerUi, revision: applied.revision }));
    }
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return undefined;
    const channel = new BroadcastChannel(PLANNING_3D_POPOUT_CHANNEL);
    channelRef.current = channel;
    channel.onmessage = (ev) => applyMessage(ev.data);
    postPlanning3dPopoutMessage(channel, { type: 'ready' });

    const onBeforeUnload = () => {
      postPlanning3dPopoutMessage(channel, { type: 'closed' });
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      postPlanning3dPopoutMessage(channel, { type: 'closed' });
      channel.close();
      channelRef.current = null;
    };
  }, [applyMessage]);

  const setViewerUi = useCallback((next: Planning3dViewerUiState) => {
    const viewerUi = clonePlanning3dViewerUi(next);
    const revision = revisionRef.current + 1;
    revisionRef.current = revision;
    setState((prev) => ({ ...prev, viewerUi, revision }));
    postPlanning3dPopoutMessage(channelRef.current, {
      type: 'viewer-ui',
      payload: { revision, viewerUi },
    });
  }, []);

  return { ...state, setViewerUi };
}
