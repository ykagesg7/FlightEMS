import { useCallback, useEffect, useRef, useState } from 'react';
import { derivePlannedPreviewAltitudeFt } from './types';
import type { Waypoint3D } from './types';
import {
  PLANNING_3D_POPOUT_CHANNEL,
  PLANNING_3D_POPOUT_PATH,
  applyPlanning3dPopoutViewerUi,
  createPlanning3dPopoutState,
  parsePlanning3dPopoutMessage,
  postPlanning3dPopoutMessage,
  type Planning3dPopoutStatePayload,
} from './planning3dPopoutSync';
import {
  clonePlanning3dViewerUi,
  createDefaultPlanning3dViewerUi,
  type Planning3dViewerUiState,
} from './planning3dViewerUi';

const POPOUT_WINDOW_NAME = 'fa-planning-3d-popout';
const POPOUT_FEATURES =
  'popup=yes,width=1280,height=800,menubar=no,toolbar=no,location=no,status=no,resizable=yes';

export type UsePlanning3dPopoutHostResult = {
  poppedOut: boolean;
  popupBlocked: boolean;
  openPopout: () => void;
  focusPopout: () => void;
  dismissPopupBlocked: () => void;
  viewerUi: Planning3dViewerUiState;
  setViewerUi: (next: Planning3dViewerUiState) => void;
};

export function usePlanning3dPopoutHost(
  waypoints: Waypoint3D[],
  isProUser: boolean,
): UsePlanning3dPopoutHostResult {
  const [poppedOut, setPoppedOut] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [viewerUi, setViewerUiState] = useState<Planning3dViewerUiState>(() =>
    createDefaultPlanning3dViewerUi(waypoints),
  );
  const popoutRef = useRef<Window | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const revisionRef = useRef(0);
  const waypointsRef = useRef(waypoints);
  const isProRef = useRef(isProUser);
  const viewerUiRef = useRef(viewerUi);

  waypointsRef.current = waypoints;
  isProRef.current = isProUser;
  viewerUiRef.current = viewerUi;

  useEffect(() => {
    const planned = derivePlannedPreviewAltitudeFt(waypoints);
    setViewerUiState((prev) => ({
      ...prev,
      viewControls: { ...prev.viewControls, previewAltitudeFt: planned },
    }));
  }, [waypoints]);

  const ensureChannel = useCallback(() => {
    if (typeof BroadcastChannel === 'undefined') return null;
    if (!channelRef.current) {
      channelRef.current = new BroadcastChannel(PLANNING_3D_POPOUT_CHANNEL);
      channelRef.current.onmessage = (ev) => {
        const msg = parsePlanning3dPopoutMessage(ev.data);
        if (!msg) return;
        if (msg.type === 'ready') {
          postStateToChannel(channelRef.current, waypointsRef.current, isProRef.current, revisionRef, viewerUiRef);
        }
        if (msg.type === 'closed') {
          popoutRef.current = null;
          setPoppedOut(false);
        }
        if (msg.type === 'focus-request') {
          popoutRef.current?.focus();
        }
        if (msg.type === 'viewer-ui') {
          const applied = applyPlanning3dPopoutViewerUi(revisionRef.current, msg);
          if (!applied) return;
          revisionRef.current = applied.revision;
          setViewerUiState(applied.viewerUi);
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
      viewerUiRef,
    );
  }, [ensureChannel]);

  const setViewerUi = useCallback(
    (next: Planning3dViewerUiState) => {
      const cloned = clonePlanning3dViewerUi(next);
      viewerUiRef.current = cloned;
      setViewerUiState(cloned);
      if (poppedOut) {
        revisionRef.current += 1;
        postStateToChannel(
          ensureChannel(),
          waypointsRef.current,
          isProRef.current,
          revisionRef,
          viewerUiRef,
        );
      }
    },
    [ensureChannel, poppedOut],
  );

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
    postStateToChannel(
      ensureChannel(),
      waypointsRef.current,
      isProRef.current,
      revisionRef,
      viewerUiRef,
    );
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
    viewerUi,
    setViewerUi,
  };
}

function postStateToChannel(
  channel: BroadcastChannel | null,
  waypoints: Waypoint3D[],
  isProUser: boolean,
  revisionRef: { current: number },
  viewerUiRef: { current: Planning3dViewerUiState },
): void {
  const payload: Planning3dPopoutStatePayload = createPlanning3dPopoutState(
    waypoints,
    isProUser,
    revisionRef.current,
    viewerUiRef.current,
  );
  postPlanning3dPopoutMessage(channel, { type: 'state', payload });
}
