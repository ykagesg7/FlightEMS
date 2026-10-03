import { useCallback, useEffect, useRef, useState } from 'react';
import type { Waypoint3D } from './types';
import {
  PLANNING_3D_POPOUT_CHANNEL,
  PLANNING_3D_POPOUT_PATH,
  createPlanning3dPopoutState,
  parsePlanning3dPopoutMessage,
  postPlanning3dPopoutMessage,
  type Planning3dPopoutStatePayload,
} from './planning3dPopoutSync';

const POPOUT_WINDOW_NAME = 'fa-planning-3d-popout';
const POPOUT_FEATURES =
  'popup=yes,width=1280,height=800,menubar=no,toolbar=no,location=no,status=no,resizable=yes';

export type UsePlanning3dPopoutHostResult = {
  poppedOut: boolean;
  popupBlocked: boolean;
  openPopout: () => void;
  focusPopout: () => void;
  dismissPopupBlocked: () => void;
};

export function usePlanning3dPopoutHost(
  waypoints: Waypoint3D[],
  isProUser: boolean,
): UsePlanning3dPopoutHostResult {
  const [poppedOut, setPoppedOut] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const popoutRef = useRef<Window | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const revisionRef = useRef(0);
  const waypointsRef = useRef(waypoints);
  const isProRef = useRef(isProUser);

  waypointsRef.current = waypoints;
  isProRef.current = isProUser;

  const ensureChannel = useCallback(() => {
    if (typeof BroadcastChannel === 'undefined') return null;
    if (!channelRef.current) {
      channelRef.current = new BroadcastChannel(PLANNING_3D_POPOUT_CHANNEL);
      channelRef.current.onmessage = (ev) => {
        const msg = parsePlanning3dPopoutMessage(ev.data);
        if (!msg) return;
        if (msg.type === 'ready') {
          postStateToChannel(channelRef.current, waypointsRef.current, isProRef.current, revisionRef);
        }
        if (msg.type === 'closed') {
          popoutRef.current = null;
          setPoppedOut(false);
        }
        if (msg.type === 'focus-request') {
          popoutRef.current?.focus();
        }
      };
    }
    return channelRef.current;
  }, []);

  const postCurrentState = useCallback(() => {
    revisionRef.current += 1;
    postStateToChannel(
      ensureChannel(),
      waypointsRef.current,
      isProRef.current,
      revisionRef,
    );
  }, [ensureChannel]);

  useEffect(() => {
    if (!poppedOut) return;
    postCurrentState();
  }, [waypoints, isProUser, poppedOut, postCurrentState]);

  useEffect(() => {
    if (!poppedOut) return undefined;
    const intervalId = window.setInterval(() => {
      const win = popoutRef.current;
      if (win && win.closed) {
        popoutRef.current = null;
        setPoppedOut(false);
      }
    }, 400);
    return () => window.clearInterval(intervalId);
  }, [poppedOut]);

  useEffect(() => {
    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, []);

  const openPopout = useCallback(() => {
    setPopupBlocked(false);
    const existing = popoutRef.current;
    if (existing && !existing.closed) {
      existing.focus();
      setPoppedOut(true);
      postCurrentState();
      return;
    }

    ensureChannel();
    const url = `${window.location.origin}${PLANNING_3D_POPOUT_PATH}`;
    const win = window.open(url, POPOUT_WINDOW_NAME, POPOUT_FEATURES);
    if (!win || win.closed) {
      setPopupBlocked(true);
      setPoppedOut(false);
      return;
    }
    popoutRef.current = win;
    setPoppedOut(true);
    revisionRef.current += 1;
    postStateToChannel(ensureChannel(), waypointsRef.current, isProRef.current, revisionRef);
  }, [ensureChannel, postCurrentState]);

  const focusPopout = useCallback(() => {
    const win = popoutRef.current;
    if (win && !win.closed) {
      win.focus();
      return;
    }
    postPlanning3dPopoutMessage(ensureChannel(), { type: 'focus-request' });
  }, [ensureChannel]);

  const dismissPopupBlocked = useCallback(() => setPopupBlocked(false), []);

  return {
    poppedOut,
    popupBlocked,
    openPopout,
    focusPopout,
    dismissPopupBlocked,
  };
}

function postStateToChannel(
  channel: BroadcastChannel | null,
  waypoints: Waypoint3D[],
  isProUser: boolean,
  revisionRef: { current: number },
): void {
  const payload: Planning3dPopoutStatePayload = createPlanning3dPopoutState(
    waypoints,
    isProUser,
    revisionRef.current,
  );
  postPlanning3dPopoutMessage(channel, { type: 'state', payload });
}
