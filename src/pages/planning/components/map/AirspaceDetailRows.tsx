import React from 'react';
import type { AirspaceFeatureHit } from '../../../../utils/airspace';
import {
  getAirspaceHitAltitudeRange,
  getAirspaceHitCallsign,
  getAirspaceHitLabel,
  getFreqUhf,
  getFreqVhf,
} from './airspaceDisplayUtils';

type Props = {
  hit: AirspaceFeatureHit;
  compact?: boolean;
};

export const AirspaceDetailRows: React.FC<Props> = ({ hit, compact = false }) => {
  const props = hit.feature.properties ?? {};
  const label = getAirspaceHitLabel(hit);
  const callsign = getAirspaceHitCallsign(hit);
  const vhf = getFreqVhf(props);
  const uhf = getFreqUhf(props);
  const altRange = getAirspaceHitAltitudeRange(hit);

  if (compact) {
    return (
      <div className="min-w-0 text-2xs sm:text-xs text-gray-200">
        <span className="font-semibold text-whiskyPapa-yellow">{label}</span>
        <span className="text-gray-300">
          {' '}
          · {callsign} · VHF {vhf} · UHF {uhf} · {altRange}
        </span>
      </div>
    );
  }

  const callsignLabel = hit.kind === 'rapcon' ? 'エリア / 呼称' : 'Callsign';

  return (
    <dl className="space-y-1 text-2xs sm:text-xs text-gray-200">
      <div className="flex gap-2">
        <dt className="shrink-0 text-whiskyPapa-yellow/90">{callsignLabel}</dt>
        <dd className="min-w-0">{callsign}</dd>
      </div>
      <div className="flex gap-2">
        <dt className="shrink-0 text-whiskyPapa-yellow/90">VHF</dt>
        <dd className="min-w-0 font-mono">{vhf}</dd>
      </div>
      <div className="flex gap-2">
        <dt className="shrink-0 text-whiskyPapa-yellow/90">UHF</dt>
        <dd className="min-w-0 font-mono">{uhf}</dd>
      </div>
      <div className="flex gap-2">
        <dt className="shrink-0 text-whiskyPapa-yellow/90">高度範囲</dt>
        <dd className="min-w-0 font-mono">{altRange}</dd>
      </div>
    </dl>
  );
};
