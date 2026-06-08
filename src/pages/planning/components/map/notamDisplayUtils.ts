import type { NotamCategory, SwimNotamItem } from '@/services/swimNotam';

const CATEGORY_LABELS: Record<NotamCategory, string> = {
  runway: '滑走路',
  taxiway: '誘導路',
  apron: 'エプロン',
  airspace: '空域',
  facility: '施設',
  other: 'その他',
};

export function notamCategoryLabel(category: NotamCategory | undefined): string {
  if (!category) return 'NOTAM';
  return CATEGORY_LABELS[category];
}

function parseIsoDate(value: string | undefined): Date | null {
  if (!value?.trim()) return null;
  const t = Date.parse(value.trim());
  return Number.isFinite(t) ? new Date(t) : null;
}

function formatJstDateTime(d: Date): string {
  return d.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export type NotamPeriodDisplay = {
  label: string;
  titleAttr: string;
};

export function formatNotamPeriodJst(
  begin: string | undefined,
  end: string | undefined,
): NotamPeriodDisplay {
  const b = parseIsoDate(begin);
  const e = parseIsoDate(end);
  const rawParts = [begin, end].filter(Boolean).join(' – ');
  const titleAttr = rawParts || '期間不明';

  if (b && e) {
    return { label: `${formatJstDateTime(b)} 〜 ${formatJstDateTime(e)}`, titleAttr };
  }
  if (b) {
    return { label: `${formatJstDateTime(b)} 〜 終了未定`, titleAttr };
  }
  if (e) {
    return { label: `開始不明 〜 ${formatJstDateTime(e)}`, titleAttr };
  }
  return { label: '期間情報なし', titleAttr };
}

export function buildNotamPeekSummary(
  code: string,
  currentCount: number,
  futureCount: number,
  keywordSearch?: boolean,
): string {
  const safeCode = code.trim() || '—';
  const kw = keywordSearch ? '（キーワード検索）' : '';
  if (currentCount === 0 && futureCount === 0) {
    return `${safeCode}${kw} — NOTAM 該当なし`;
  }
  const parts: string[] = [];
  if (currentCount > 0) parts.push(`現在${currentCount}件`);
  if (futureCount > 0) parts.push(`将来${futureCount}件`);
  return `${safeCode}${kw} — NOTAM ${parts.join('・')}`;
}

export type NotamCardView = {
  cardTitle: string;
  bodyText: string;
  bodyTruncated: boolean;
  categoryLabel: string;
  period: NotamPeriodDisplay;
  verticalText?: string;
  hasGeometry: boolean;
  detailNotes: string[];
  technicalMeta?: {
    eventCode?: string;
    featureLabel?: string;
    locationText?: string;
  };
  rawXml?: string;
  rawXmlTruncated?: boolean;
};

const CARD_BODY_MAX = 300;

function resolveCardTitle(item: SwimNotamItem): string {
  if (item.impactLabel?.trim()) return item.impactLabel.trim();
  if (item.headline?.trim()) return item.headline.trim();
  const snippet = item.primaryText ?? item.noteSnippet ?? item.summary;
  if (snippet) return snippet.slice(0, 80);
  return 'デジタルノータム';
}

function resolveBodyText(item: SwimNotamItem): { text: string; truncated: boolean } {
  const full = (item.primaryText ?? item.noteSnippet ?? '').trim();
  if (!full) {
    return { text: item.summary.slice(0, CARD_BODY_MAX), truncated: item.summary.length > CARD_BODY_MAX };
  }
  return {
    text: full.length > CARD_BODY_MAX ? `${full.slice(0, CARD_BODY_MAX)}…` : full,
    truncated: full.length > CARD_BODY_MAX,
  };
}

export function buildNotamCardView(item: SwimNotamItem): NotamCardView {
  const { text, truncated } = resolveBodyText(item);
  const detailNotes =
    item.detailNotes?.filter((n) => n.trim() && n !== item.primaryText && n !== item.noteSnippet) ?? [];

  return {
    cardTitle: resolveCardTitle(item),
    bodyText: text,
    bodyTruncated: truncated,
    categoryLabel: notamCategoryLabel(item.category),
    period: formatNotamPeriodJst(item.begin, item.end),
    verticalText: item.verticalText?.trim() || undefined,
    hasGeometry: item.geometry != null,
    detailNotes,
    technicalMeta: {
      eventCode: item.eventCode,
      featureLabel: item.featureLabel,
      locationText: item.locationText,
    },
    rawXml: item.rawXml,
    rawXmlTruncated: item.rawXmlTruncated,
  };
}

export function isIcaoLocationCode(code: string): boolean {
  return /^R[A-Z]{3}$/i.test(code.trim());
}

export function resolveNotamSearchKind(code: string): 'location' | 'keyword' {
  return isIcaoLocationCode(code) ? 'location' : 'keyword';
}
