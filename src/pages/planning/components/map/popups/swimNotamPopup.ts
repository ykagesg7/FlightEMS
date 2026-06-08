import L from 'leaflet';
import { escapeHtml } from './common';
import { resolveNotamSearchKind } from '../notamDisplayUtils';
import {
  registerPlanningNotamSheetOpener,
  requestOpenPlanningNotamSheet,
  type NotamSheetRequest,
} from '../planningNotamSheetContext';

/** Leaflet ポップアップ内: NOTAM シートを開く 1 行チップ */
export function swimNotamOpenChip(displayCode: string, keywordHint?: boolean): string {
  const safe = escapeHtml(displayCode);
  const hint =
    keywordHint || !/^R[A-Z]{3}$/i.test(displayCode.trim())
      ? '<span class="text-[10px] text-slate-500 ml-1">キーワード</span>'
      : '';
  return `
    <div class="planning-notam-chip-section mt-2 pt-2 border-t border-slate-600/40">
      <button type="button" class="planning-swim-notam-chip w-full text-left rounded border border-amber-700/50 bg-amber-950/30 hover:bg-amber-900/40 px-2 py-1.5 text-xs text-amber-100 font-medium">
        NOTAM（${safe}）を確認 →
      </button>
      ${hint}
      <p class="text-[10px] text-slate-500 mt-1 leading-snug">
        参考表示です。実際の航行には SWIM ポータル等の公式ノータムを必ず確認してください。
      </p>
    </div>
  `;
}

/** @deprecated swimNotamOpenChip を使用 */
export function swimNotamButtonSection(displayCode: string): string {
  return swimNotamOpenChip(displayCode);
}

function openNotamFromPopup(code: string, kind: 'location' | 'keyword', latlng?: L.LatLng): void {
  const req: NotamSheetRequest = { code, kind, latlng };
  requestOpenPlanningNotamSheet(req);
}

/**
 * ポップアップ表示後に呼ぶ。`.planning-swim-notam-chip` が必要。
 */
export function bindPlanningSwimNotamChip(
  map: L.Map,
  popup: L.Popup,
  code: string,
  kind?: 'location' | 'keyword',
): void {
  const c = code.trim();
  if (!c) return;

  const resolvedKind = kind ?? resolveNotamSearchKind(c);

  setTimeout(() => {
    const root = popup.getElement?.();
    if (!root) return;
    const btn = root.querySelector('.planning-swim-notam-chip');
    if (!btn) return;

    const latlng = popup.getLatLng?.() ?? undefined;

    const freshBtn = btn.cloneNode(true) as HTMLButtonElement;
    btn.parentNode?.replaceChild(freshBtn, btn);

    freshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      map.closePopup();
      openNotamFromPopup(c, resolvedKind, latlng);
    });
  }, 120);
}

/** @deprecated bindPlanningSwimNotamChip を使用 */
export function bindPlanningSwimNotamButton(
  map: L.Map,
  popup: L.Popup,
  code: string,
  kind: 'location' | 'keyword',
): void {
  bindPlanningSwimNotamChip(map, popup, code, kind);
}

export { registerPlanningNotamSheetOpener };
