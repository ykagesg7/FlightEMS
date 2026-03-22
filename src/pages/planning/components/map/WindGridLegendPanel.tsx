import React, { useMemo } from 'react';
import type { WindGridMapOverlayModel } from './hooks/usePlanningMapWindGrid';

type Props = {
  model: WindGridMapOverlayModel | null;
};

function formatJstHm(d: Date): string {
  return d.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  });
}

/**
 * 上層風格子の要約（Open-Meteo・参考）。文言は簡潔に。
 */
export const WindGridLegendPanel: React.FC<Props> = ({ model }) => {
  const refLines = useMemo(() => {
    if (!model?.refTimeUtc) return null;
    const d = model.refTimeUtc;
    const utc = `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}UTC`;
    const jst = formatJstHm(d);
    return { utc, jst };
  }, [model?.refTimeUtc]);

  if (!model) return null;

  return (
    <div
      className="pointer-events-none w-full max-w-[16.5rem] rounded border border-sky-400/40 bg-whiskyPapa-black-dark/90 px-2 py-1 text-2xs sm:text-xs text-gray-200 shadow-md leading-snug"
      role="status"
      aria-live="polite"
    >
      {model.loading ? (
        <div className="text-gray-400">上層風 取得中…</div>
      ) : model.error ? (
        <div className="text-amber-300/90">上層風 取得エラー</div>
      ) : (
        <>
          <div className="hud-text hud-readout text-sky-100/95">
            高度 FL{model.approxFlightLevel}（{model.pressureHpa} hPa 面）
          </div>
          {model.centerSample ? (
            <div className="mt-0.5 hud-text hud-readout">
              代表風 {Math.round(model.centerSample.windFromDeg)}°／{Math.round(model.centerSample.speedKt)}kt
            </div>
          ) : (
            <div className="mt-0.5 text-gray-400">この表示域ではデータなし</div>
          )}
          {refLines && !model.error ? (
            <div className="mt-0.5 text-gray-400">
              予報参照 {refLines.utc}（{refLines.jst} JST）
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
