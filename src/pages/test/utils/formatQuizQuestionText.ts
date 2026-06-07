export type QuizQuestionTextPart =
  | { kind: 'plain'; text: string }
  | { kind: 'structured'; stem: string; choices: { label: string; body: string }[] };

type ChoiceMarkerKind = 'latin' | 'katakana';

const LATIN_MARKER = /[（(]([a-dA-D])[）)]/g;
const KATAKANA_MARKER = /[（(]([アイウエオ])[）)]/g;

const LATIN_CHOICE_HEAD = /^[（(]([a-dA-D])[）)]\s*/;
const KATAKANA_CHOICE_HEAD = /^[（(]([アイウエオ])[）)]\s*/;

const KATAKANA_SEQUENCE = ['ア', 'イ', 'ウ', 'エ', 'オ'] as const;

function isLatinChoiceRangeReference(text: string, markerIndex: number): boolean {
  const snippet = text.slice(Math.max(0, markerIndex - 2), markerIndex + 36);
  return /[（(][aAａＡ][）)]\s*[〜～\-－—–]\s*[（(][dDｄＤ][）)]/.test(snippet);
}

function isKatakanaChoiceRangeReference(text: string, markerIndex: number): boolean {
  const snippet = text.slice(Math.max(0, markerIndex - 2), markerIndex + 48);
  return /[（(][ア][）)]\s*[〜～\-－—–]\s*[（(][エ][）)]/.test(snippet);
}

function detectChoiceKind(text: string): ChoiceMarkerKind | null {
  const latinMarkers = [...text.matchAll(LATIN_MARKER)];
  if (latinMarkers.length >= 2) {
    for (const match of latinMarkers) {
      if (match[1].toLowerCase() !== 'a' || match.index === undefined) continue;
      if (isLatinChoiceRangeReference(text, match.index)) continue;
      const tail = text.slice(match.index, match.index + 900);
      if (/[（(][bBｂＢ][）)]/.test(tail)) return 'latin';
    }
  }

  const katakanaMarkers = [...text.matchAll(KATAKANA_MARKER)];
  if (katakanaMarkers.length >= 2) {
    for (const match of katakanaMarkers) {
      if (match[1] !== 'ア' || match.index === undefined) continue;
      if (isKatakanaChoiceRangeReference(text, match.index)) continue;
      const tail = text.slice(match.index, match.index + 900);
      if (/[（(][イ][）)]/.test(tail)) return 'katakana';
    }
  }

  return null;
}

function findChoiceStartIndex(text: string, kind: ChoiceMarkerKind): number {
  if (kind === 'latin') {
    for (const match of text.matchAll(LATIN_MARKER)) {
      if (match[1].toLowerCase() !== 'a' || match.index === undefined) continue;
      if (isLatinChoiceRangeReference(text, match.index)) continue;
      const tail = text.slice(match.index, match.index + 900);
      if (/[（(][bBｂＢ][）)]/.test(tail)) return match.index;
    }
    return -1;
  }

  for (const match of text.matchAll(KATAKANA_MARKER)) {
    if (match[1] !== 'ア' || match.index === undefined) continue;
    if (isKatakanaChoiceRangeReference(text, match.index)) continue;
    const tail = text.slice(match.index, match.index + 900);
    if (/[（(][イ][）)]/.test(tail)) return match.index;
  }
  return -1;
}

function splitChoiceSegments(text: string, kind: ChoiceMarkerKind): string[] {
  if (kind === 'latin') {
    return text.split(/(?=[（(][a-dA-D][）)])/i).filter(Boolean);
  }
  return text.split(/(?=[（(][アイウエオ][）)])/).filter(Boolean);
}

function parseChoiceLabel(segment: string, kind: ChoiceMarkerKind): { label: string; body: string } | null {
  const head = kind === 'latin' ? LATIN_CHOICE_HEAD : KATAKANA_CHOICE_HEAD;
  const m = segment.match(head);
  if (!m) return null;
  const body = segment.slice(m[0].length).trim();
  if (!body) return null;
  const label = kind === 'latin' ? m[1].toLowerCase() : m[1];
  return { label, body };
}

/** 文末の後に空行を入れる（短い問題向け） */
export function addSentenceBreaks(text: string): string {
  return text
    .replace(/([。．!?？!])(?=[^\n\s])/g, '$1\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * CPL 形式の「(a)〜(d) / (ア)〜(エ) のうち…」＋選択肢本文を段落分けする。
 * 選択肢パターンが弱い場合は plain（文末改行のみ）にフォールバック。
 * 将来: ①②③ 形式は未対応（必要時に拡張）。
 */
export function parseQuizQuestionText(text: string): QuizQuestionTextPart {
  const trimmed = text?.trim() ?? '';
  if (!trimmed) return { kind: 'plain', text: '' };

  const kind = detectChoiceKind(trimmed);
  if (!kind) {
    return { kind: 'plain', text: addSentenceBreaks(trimmed) };
  }

  const choiceStartIdx = findChoiceStartIndex(trimmed, kind);
  if (choiceStartIdx <= 0) {
    return { kind: 'plain', text: addSentenceBreaks(trimmed) };
  }

  const stem = trimmed.slice(0, choiceStartIdx).trim();
  const choicesBlob = trimmed.slice(choiceStartIdx);
  const segments = splitChoiceSegments(choicesBlob, kind);

  const choices: { label: string; body: string }[] = [];
  for (const segment of segments) {
    const parsed = parseChoiceLabel(segment, kind);
    if (!parsed) continue;
    choices.push(parsed);
  }

  if (choices.length === 0) {
    return { kind: 'plain', text: addSentenceBreaks(trimmed) };
  }

  if (kind === 'katakana') {
    const ordered = KATAKANA_SEQUENCE.filter((k) => choices.some((c) => c.label === k))
      .map((k) => choices.find((c) => c.label === k)!)
      .concat(choices.filter((c) => !KATAKANA_SEQUENCE.includes(c.label as (typeof KATAKANA_SEQUENCE)[number])));
    return { kind: 'structured', stem, choices: ordered };
  }

  return { kind: 'structured', stem, choices };
}
