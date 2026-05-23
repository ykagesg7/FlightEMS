export type MapLayerPresetId = 'vfr_planning' | 'airspace_review' | 'weather_reference';

export type MapLayerPreset = {
  id: MapLayerPresetId;
  label: string;
  description: string;
  overlayIds: readonly string[];
};

export const MAP_LAYER_PRESETS: MapLayerPreset[] = [
  {
    id: 'vfr_planning',
    label: 'VFR計画',
    description: '空港・NAVAID・空域',
    overlayIds: [
      'airport',
      'navaids',
      'restricted_airspace',
      'training_high',
      'training_low',
      'training_civil',
    ],
  },
  {
    id: 'airspace_review',
    label: '空域確認',
    description: 'ACC・RAPCON・訓練空域',
    overlayIds: [
      'acc_sector_high',
      'acc_sector_low',
      'rapcon',
      'restricted_airspace',
      'training_high',
      'training_low',
      'training_civil',
    ],
  },
  {
    id: 'weather_reference',
    label: '気象参考',
    description: 'レーダー・上層風',
    overlayIds: ['rainviewer_radar', 'wind_barbs'],
  },
];

export function getPresetOverlayIds(presetId: MapLayerPresetId): readonly string[] {
  const preset = MAP_LAYER_PRESETS.find((p) => p.id === presetId);
  if (!preset) return [];
  return preset.overlayIds;
}

/** プリセット適用後の enabled セット（catalog 内の id のみ） */
export function computePresetEnabledIds(
  presetId: MapLayerPresetId,
  knownIds: ReadonlySet<string>,
): Set<string> {
  const next = new Set<string>();
  for (const id of getPresetOverlayIds(presetId)) {
    if (knownIds.has(id)) {
      next.add(id);
    }
  }
  return next;
}
