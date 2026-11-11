import React from 'react';
import { formatBriefingAcquiredLabel } from '../map/mapDataProvenance';

type Props = {
  fetchedAtIso: string | null;
  sourceLabel: string;
};

/** METAR/TAF・NOTAM 自動取得後の取得時刻と出典（A1・Briefing） */
export const PreflightBriefingProvenance: React.FC<Props> = ({ fetchedAtIso, sourceLabel }) => {
  const acquired = formatBriefingAcquiredLabel(fetchedAtIso ?? undefined);
  if (!acquired) return null;

  return (
    <p className="mt-1.5 text-[10px] leading-snug text-gray-500">
      {acquired}
      <span aria-hidden="true"> · </span>
      <span title={sourceLabel}>出典：{sourceLabel}</span>
    </p>
  );
};
