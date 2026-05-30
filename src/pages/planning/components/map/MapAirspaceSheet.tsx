import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import { AirspaceSheetBody } from './AirspaceSheetBody';
import { buildAirspacePeekSummary } from './airspaceDisplayUtils';
import { useSnapSheet } from './hooks/useSnapSheet';
import { cycleSnap, type SnapPoint } from './snapSheetUtils';
import type { AirspaceSelection } from './planningAirspaceTypes';

type Props = {
  selection: AirspaceSelection;
  cruiseAltitudeFt: number;
  onClearSelection: () => void;
  onSheetHeightChange: (heightPx: number) => void;
};

export const MapAirspaceSheet: React.FC<Props> = ({
  selection,
  cruiseAltitudeFt,
  onClearSelection,
  onSheetHeightChange,
}) => {
  const hitCount = selection.hits.length;
  const selectionKey = `${selection.latlng.lat},${selection.latlng.lng},${hitCount}`;
  const prevSelectionKey = useRef(selectionKey);
  const userAdjustedSnap = useRef(false);

  const { snap, setSnap, heights, sheetHeightPx, onDragEnd } = useSnapSheet(
    true,
    hitCount,
    selectionKey,
    userAdjustedSnap,
  );

  const [dragOffset, setDragOffset] = useState(0);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const peekSummary = buildAirspacePeekSummary(selection);

  const clampHeight = useCallback(
    (height: number) => Math.max(heights.peek, Math.min(heights.full, height)),
    [heights],
  );

  const displayedHeight = clampHeight(sheetHeightPx - dragOffset);

  useEffect(() => {
    onSheetHeightChange(displayedHeight);
  }, [displayedHeight, onSheetHeightChange]);

  useEffect(() => {
    if (prevSelectionKey.current !== selectionKey) {
      prevSelectionKey.current = selectionKey;
      userAdjustedSnap.current = false;
    }
  }, [selectionKey]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClearSelection();
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const target = e.target;
        if (target instanceof HTMLElement && target.closest('.map-airspace-sheet')) {
          e.preventDefault();
          userAdjustedSnap.current = true;
          setSnap(cycleSnap(snap, e.key === 'ArrowUp' ? 'up' : 'down'));
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClearSelection, setSnap, snap]);

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragOffset(info.offset.y);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    userAdjustedSnap.current = true;
    onDragEnd(clampHeight(sheetHeightPx - info.offset.y));
    setDragOffset(0);
  };

  const handleHandleDoubleClick = () => {
    if (isDesktop) return;
    userAdjustedSnap.current = true;
    const next: SnapPoint = snap === 'peek' ? 'half' : snap === 'full' ? 'half' : 'peek';
    setSnap(next);
  };

  const handleExpandMore = () => {
    userAdjustedSnap.current = true;
    if (snap === 'peek') setSnap('half');
    else if (snap === 'half') setSnap('full');
  };

  const handleCollapseStep = () => {
    userAdjustedSnap.current = true;
    if (snap === 'full') setSnap('half');
    else setSnap('peek');
  };

  return (
    <motion.div
      className="map-airspace-sheet pointer-events-auto absolute inset-x-0 bottom-0 z-[10002] flex flex-col overflow-hidden rounded-t-xl border-t border-whiskyPapa-yellow/30 hud-overlay-panel shadow-[0_-8px_24px_rgba(0,0,0,0.45)]"
      style={{ height: displayedHeight }}
      role="region"
      aria-label="空域情報"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
    >
      {!isDesktop ? (
        <motion.div
          className="flex shrink-0 cursor-grab flex-col items-center active:cursor-grabbing"
          drag="y"
          dragConstraints={{ top: -(heights.full - heights.peek), bottom: 0 }}
          dragElastic={0.08}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onDoubleClick={handleHandleDoubleClick}
        >
          <div
            className="flex min-h-[36px] w-full items-center justify-center py-1.5"
            aria-label="空域パネルの高さを調整"
            role="button"
            tabIndex={0}
          >
            <span className="h-1 w-10 rounded-full bg-whiskyPapa-yellow/40" />
          </div>
        </motion.div>
      ) : null}

      <div className="flex min-h-[48px] shrink-0 items-center gap-1 border-b border-whiskyPapa-yellow/15 px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-100" title={peekSummary}>
          {peekSummary}
        </p>
        <div className="hidden shrink-0 items-center gap-0.5 md:flex">
          {snap !== 'full' ? (
            <button
              type="button"
              onClick={handleExpandMore}
              className="flex min-h-[40px] items-center gap-1 rounded border border-whiskyPapa-yellow/30 px-2 text-xs text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10"
              aria-label="空域情報を展開"
            >
              <ChevronUp className="h-4 w-4" />
              展開
            </button>
          ) : null}
          {snap !== 'peek' ? (
            <button
              type="button"
              onClick={handleCollapseStep}
              className="flex min-h-[40px] items-center gap-1 rounded border border-gray-600 px-2 text-xs text-gray-300 hover:border-whiskyPapa-yellow/30 hover:bg-whiskyPapa-yellow/10 hover:text-whiskyPapa-yellow"
              aria-label="空域情報を格納"
            >
              <ChevronDown className="h-4 w-4" />
              格納
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClearSelection}
          className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded text-gray-400 hover:bg-whiskyPapa-yellow/10 hover:text-whiskyPapa-yellow"
          aria-label="空域情報を閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AirspaceSheetBody selection={selection} cruiseAltitudeFt={cruiseAltitudeFt} snap={snap} />
      </div>

      <div className="shrink-0 pb-[env(safe-area-inset-bottom)]" aria-hidden />
    </motion.div>
  );
};
