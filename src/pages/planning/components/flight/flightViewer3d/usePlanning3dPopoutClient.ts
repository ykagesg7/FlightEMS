import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PLANNING_3D_POPOUT_CHANNEL,
  applyPlanning3dPopoutState,
  loadPlanning3dPopoutFallbackWaypoints,
  parsePlanning3dPopoutMessage,
  postPlanning3dPopoutMessage,
} from './planning3dPopoutSync';
import type { Waypoint3D } from './types';
import { useFlightViewer3dProUser } from '../../../hooks/useFlightViewer3dProUser';

export type Planning3dPopoutClientState = {
  waypoints: Waypoint3D[];
  isProUser: boolean;
  revision: number;
};

function initialClientState(): Planning3dPopoutClientState {
  return {
    waypoints: loadPlanning3dPopoutFallbackWaypoints(),
    isProUser: false,
    revision: 0,
  };
}

export function usePlanning3dPopoutClient(): Planning3dPopoutClientState {
  const isProFromAuth = useFlightViewer3dProUser();
  const [state, setState] = useState<Planning3dPopoutClientState>(() => ({
    ...initialClientState(),
    isProUser: isProFromAuth,
  }));
  const revisionRef = useRef(state.revision);

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
    }
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return undefined;
    const channel = new BroadcastChannel(PLANNING_3D_POPOUT_CHANNEL);
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
    };
  }, [applyMessage]);

  return state;
}
