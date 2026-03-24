import type { GeoJsonObject } from 'geojson';
import L from 'leaflet';
import type { SwimNotamItem } from '@/services/swimNotam';
import { fetchSwimNotams } from '@/services/swimNotam';
import { collapsibleHtmlSection, escapeHtml } from './common';
import {
  attachSwimNotamOverlayCleanup,
  showSwimNotamGeometryOnMap,
} from './swimNotamMapOverlay';

export function swimNotamButtonSection(displayCode: string): string {
  const safe = escapeHtml(displayCode);
  return `
    <div class="planning-notam-section mt-2 pt-2 border-t border-slate-600/40">
      <button type="button" class="planning-swim-notam-btn mt-1 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold py-1 px-2 rounded">
        有効NOTAM（${safe}）
      </button>
      <div class="planning-notam-result mt-2 text-xs text-left max-h-72 overflow-y-auto hidden"></div>
      <p class="text-[10px] text-slate-500 mt-1 leading-snug">
        参考表示です。実際の航行には公式のノータム類を必ず確認してください。
      </p>
    </div>
  `;
}

function formatNotamItems(
  title: string,
  items: SwimNotamItem[],
  sectionKey: 'cur' | 'fut',
  geoMap: Map<string, GeoJsonObject>,
): string {
  if (items.length === 0) {
    return `<p class="text-slate-500 mb-1">${escapeHtml(title)}：該当なし</p>`;
  }
  const rows = items
    .map((item, i) => {
      const main = (item.headline || item.summary).slice(0, 400);
      const geoId = `${sectionKey}-${i}`;
      if (item.geometry) {
        geoMap.set(geoId, item.geometry as GeoJsonObject);
      }

      const feat = item.featureLabel
        ? `<div class="text-slate-400 text-[11px] mt-0.5">種別: ${escapeHtml(item.featureLabel)}</div>`
        : '';
      const range =
        item.begin || item.end
          ? `<div class="text-slate-400 text-[11px] mt-0.5">期間: ${escapeHtml(item.begin ?? '—')} – ${escapeHtml(item.end ?? '—')}</div>`
          : '';
      const loc =
        item.locationText || item.eventCode
          ? `<div class="text-slate-400 text-[11px]">場所・ID: ${escapeHtml((item.locationText ?? item.eventCode ?? '').slice(0, 220))}</div>`
          : '';
      const vert = item.verticalText
        ? `<div class="text-slate-400 text-[11px]">高度: ${escapeHtml(item.verticalText.slice(0, 120))}</div>`
        : '';

      const detailList =
        item.detailNotes && item.detailNotes.length > 0
          ? `<ul class="list-disc pl-4 space-y-0.5">${item.detailNotes.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>`
          : item.noteSnippet
            ? `<p class="text-slate-300">${escapeHtml(item.noteSnippet)}</p>`
            : '';
      const detailsBlock = detailList
        ? collapsibleHtmlSection('詳細・本文', detailList)
        : '';

      const rawHint = item.rawXmlTruncated
        ? `<p class="text-amber-200/90 text-[10px] mb-1">${escapeHtml('※先頭のみ表示（長いため切り詰め）')}</p>`
        : '';
      const rawBlock = item.rawXml
        ? collapsibleHtmlSection(
            '原文 XML',
            `${rawHint}<pre class="whitespace-pre-wrap break-all overflow-x-auto max-h-40 overflow-y-auto text-[9px] leading-tight text-slate-200 bg-slate-900/80 p-1 rounded border border-slate-700/60">${escapeHtml(item.rawXml)}</pre>`,
          )
        : '';

      const mapBtn = item.geometry
        ? `<button type="button" class="planning-swim-notam-map-btn mt-1 bg-amber-900/80 hover:bg-amber-900 text-amber-100 text-[10px] font-bold py-0.5 px-1.5 rounded" data-planning-swim-notam-geo="${escapeHtml(geoId)}">地図に表示</button>`
        : `<span class="text-[10px] text-slate-600 mt-1 inline-block">（幾何なし）</span>`;

      return `
        <li class="mb-2 pb-2 border-b border-slate-700/40 last:border-0 list-none">
          <div class="font-medium text-amber-50">${escapeHtml(main)}</div>
          ${feat}
          ${range}
          ${loc}
          ${vert}
          <div class="mt-1">${mapBtn}</div>
          ${detailsBlock}
          ${rawBlock}
        </li>
      `;
    })
    .join('');
  return `
    <div class="mb-2">
      <div class="font-bold text-amber-100 mb-0.5">${escapeHtml(title)}</div>
      <ul class="pl-0 space-y-0.5">${rows}</ul>
    </div>
  `;
}

function bindNotamGeoButtons(container: HTMLElement, map: L.Map, geoMap: Map<string, GeoJsonObject>): void {
  container.querySelectorAll<HTMLButtonElement>('.planning-swim-notam-map-btn[data-planning-swim-notam-geo]').forEach((btn) => {
    const fresh = btn.cloneNode(true) as HTMLButtonElement;
    btn.parentNode?.replaceChild(fresh, btn);
    fresh.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const id = fresh.getAttribute('data-planning-swim-notam-geo');
      if (!id) return;
      const g = geoMap.get(id);
      if (g) showSwimNotamGeometryOnMap(map, g);
    });
  });
}

/**
 * ポップアップ表示後に呼ぶ。`.planning-swim-notam-btn` と `.planning-notam-result` が必要。
 */
export function bindPlanningSwimNotamButton(
  map: L.Map,
  popup: L.Popup,
  code: string,
  kind: 'location' | 'keyword',
): void {
  const c = code.trim();
  if (!c) return;

  setTimeout(() => {
    const root = popup.getElement?.();
    if (!root) return;
    const btn = root.querySelector('.planning-swim-notam-btn');
    const out = root.querySelector('.planning-notam-result');
    if (!btn || !out) return;

    attachSwimNotamOverlayCleanup(map, popup);

    const freshBtn = btn.cloneNode(true) as HTMLButtonElement;
    btn.parentNode?.replaceChild(freshBtn, btn);

    freshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      out.classList.remove('hidden');
      out.innerHTML = '<p class="text-slate-400">読み込み中…</p>';
      void (async () => {
        const res = await fetchSwimNotams(
          kind === 'location'
            ? { location: c }
            : { keyword: c, andOrCondition: '0' },
        );
        if (!res.ok) {
          out.innerHTML = `<p class="text-red-400">${escapeHtml(res.error)}</p>`;
          return;
        }
        const disc = res.disclaimer
          ? `<div class="text-[10px] text-slate-500 mb-1">${escapeHtml(res.disclaimer)}</div>`
          : '';
        const geoMap = new Map<string, GeoJsonObject>();
        out.innerHTML = `
          ${disc}
          ${formatNotamItems('現在有效', res.current, 'cur', geoMap)}
          ${formatNotamItems('将来有效', res.future, 'fut', geoMap)}
        `;
        bindNotamGeoButtons(out as HTMLElement, map, geoMap);
      })();
    });
  }, 120);
}
