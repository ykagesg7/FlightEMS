import { describe, expect, it } from 'vitest';
import { prioritizePrimaryHit } from '../../pages/planning/components/map/airspaceLayerInteraction';
import type { AirspaceFeatureHit } from '../../utils/airspace';

function makeHit(
  sourceId: AirspaceFeatureHit['sourceId'],
  kind: AirspaceFeatureHit['kind'],
  props: Record<string, unknown>,
): AirspaceFeatureHit {
  return {
    sourceId,
    kind,
    feature: {
      type: 'Feature',
      properties: props,
      geometry: { type: 'Polygon', coordinates: [] },
    },
  };
}

describe('prioritizePrimaryHit', () => {
  it('puts clicked RAPCON feature first when ACC also overlaps', () => {
    const acc = makeHit('ACC_Sector_Low', 'acc', { ID: 'T32-2', Ceiling: 'FL245' });
    const rapcon = makeHit('RAPCON', 'rapcon', { Area_ID: '鹿児島-2', Ceiling: 'FL150' });

    const ordered = prioritizePrimaryHit([acc, rapcon], rapcon);

    expect(ordered[0].sourceId).toBe('RAPCON');
    expect(ordered[0].feature.properties?.Area_ID).toBe('鹿児島-2');
    expect(ordered).toHaveLength(2);
  });
});
