import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { altitudeRangeContains, parseAltitudeToken } from '../../../../utils/airspace';
import { AirspaceDetailRows } from './AirspaceDetailRows';
import {
  getAirspaceHitAltitudeRange,
  getAirspaceHitLabel,
  getAirspaceHitSourceLabel,
} from './airspaceDisplayUtils';
import type { SnapPoint } from './snapSheetUtils';
import type { AirspaceSelection } from './planningAirspaceTypes';

type Props = {
  selection: AirspaceSelection;
  cruiseAltitudeFt: number;
  snap: SnapPoint;
};

export function getInitialExpandedIndex(
  selection: AirspaceSelection,
  cruiseAltitudeFt: number,
): number {
  let bestIdx = 0;
  let bestCeiling = Number.POSITIVE_INFINITY;
  let found = false;

  selection.hits.forEach((hit, index) => {
    const props = hit.feature.properties ?? {};
    const floor = props.Floor as string | undefined;
    const ceiling = props.Ceiling as string | undefined;
    if (!altitudeRangeContains(floor, ceiling, cruiseAltitudeFt)) return;

    const ceilingFt = parseAltitudeToken(ceiling) ?? Number.POSITIVE_INFINITY;
    if (ceilingFt < bestCeiling) {
      bestCeiling = ceilingFt;
      bestIdx = index;
      found = true;
    }
  });

  return found ? bestIdx : 0;
}

export const AirspaceSheetBody: React.FC<Props> = ({ selection, cruiseAltitudeFt, snap }) => {
  const initialExpanded = useMemo(
    () => getInitialExpandedIndex(selection, cruiseAltitudeFt),
    [selection, cruiseAltitudeFt],
  );
  const [expandedIndex, setExpandedIndex] = useState(initialExpanded);

  useEffect(() => {
    setExpandedIndex(initialExpanded);
  }, [initialExpanded, selection.latlng.lat, selection.latlng.lng]);

  if (snap === 'peek') {
    if (selection.hits.length === 1) {
      return (
        <div className="px-3 pb-2 pt-0.5">
          <AirspaceDetailRows hit={selection.hits[0]} compact />
        </div>
      );
    }
    return null;
  }

  if (selection.hits.length === 1) {
    return (
      <div className="px-3 pb-3 pt-1">
        <AirspaceDetailRows hit={selection.hits[0]} />
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y px-1 pb-2">
      {selection.hits.map((hit, index) => {
        const props = hit.feature.properties ?? {};
        const isExpanded = expandedIndex === index;
        const matchesCruise = altitudeRangeContains(
          props.Floor as string | undefined,
          props.Ceiling as string | undefined,
          cruiseAltitudeFt,
        );

        return (
          <section
            key={`${hit.sourceId}-${getAirspaceHitLabel(hit)}-${index}`}
            className="border-b border-whiskyPapa-yellow/10 last:border-b-0"
          >
            <button
              type="button"
              className="flex min-h-[44px] w-full items-center gap-1.5 py-2.5 px-2 text-left text-xs sm:text-sm hover:bg-whiskyPapa-yellow/5"
              onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-whiskyPapa-yellow" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-whiskyPapa-yellow" />
              )}
              <span className="min-w-0 flex-1 font-semibold text-gray-100">
                {getAirspaceHitLabel(hit)}
              </span>
              <span className="shrink-0 text-xs text-gray-400">{getAirspaceHitSourceLabel(hit)}</span>
              {matchesCruise ? (
                <span className="shrink-0 rounded border border-whiskyPapa-yellow/40 px-1 text-xs text-whiskyPapa-yellow">
                  巡航高度
                </span>
              ) : null}
              <span className="shrink-0 font-mono text-xs text-gray-400">
                {getAirspaceHitAltitudeRange(hit)}
              </span>
            </button>
            {isExpanded ? (
              <div className="pb-2 pl-7 pr-2">
                <AirspaceDetailRows hit={hit} />
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
};
