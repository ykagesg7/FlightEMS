/** public/geojson 同梱ファイルの FeatureCollection.metadata（任意） */

export type BundledGeojsonMetadata = {
  source?: string;
  airac?: string;
  generated?: string;
  notes?: string[];
};

export type BundledGeojsonFeatureCollection = GeoJSON.FeatureCollection & {
  metadata?: BundledGeojsonMetadata;
};

export function parseBundledGeojsonMetadata(
  data: GeoJSON.FeatureCollection,
): BundledGeojsonMetadata | undefined {
  const raw = (data as BundledGeojsonFeatureCollection).metadata;
  if (!raw || typeof raw !== 'object') return undefined;
  return raw;
}

/** metadata.notes から局 ID に紐づく未検証座標の注記を返す（例: GRO） */
export function unverifiedCoordinateNoteForNavaid(
  navaidId: string,
  notes: string[] | undefined,
): string | undefined {
  if (!navaidId || !notes?.length) return undefined;
  const id = navaidId.trim();
  for (const note of notes) {
    const mentionsId = note.startsWith(`${id} `) || note.includes(`(${id})`);
    if (!mentionsId) continue;
    if (
      /unverified|not published|not in AIP|仮/i.test(note) ||
      note.includes('submitted values')
    ) {
      return note;
    }
  }
  return undefined;
}

/** 取得日表示用：metadata の generated（YYYY-MM-DD）を ISO に正規化 */
export function metadataGeneratedToIso(generated: string | undefined): string | undefined {
  if (!generated?.trim()) return undefined;
  const d = generated.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return `${d}T12:00:00.000Z`;
  }
  const parsed = Date.parse(d);
  if (Number.isNaN(parsed)) return undefined;
  return new Date(parsed).toISOString();
}

/** AIRAC 表示用：airac テキストから代表シート（例 A08/26）を抽出 */
export function summarizeAiracLabel(airac: string | undefined): string | undefined {
  if (!airac?.trim()) return undefined;
  const newest = airac.match(/Newest[^:]*:\s*[\d\sA-Z]+\((A\d{2}\/\d{2})\)/i);
  if (newest?.[1]) return `${newest[1]}（ENR 4.1 最新シート）`;
  const anyCycle = airac.match(/\(A\d{2}\/\d{2}\)/);
  if (anyCycle?.[0]) return `${anyCycle[0].slice(1, -1)}（ENR 4.1）`;
  const trimmed = airac.trim();
  return trimmed.length > 120 ? `${trimmed.slice(0, 117)}…` : trimmed;
}
