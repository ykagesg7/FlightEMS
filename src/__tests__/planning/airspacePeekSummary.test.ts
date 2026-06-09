import { describe, expect, it } from 'vitest';
import { buildAirspacePeekSummary } from '../../pages/planning/components/map/airspaceDisplayUtils';
import type { AirspaceSelection } from '../../pages/planning/components/map/planningAirspaceTypes';
import type { AirspaceFeatureHit, AirspaceSourceId } from '../../utils/airspace';

function makeHit(
  sourceId: AirspaceSourceId,
  kind: 'acc' | 'rapcon',
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

const latlng = { lat: 40.8, lng: 141.03 } as AirspaceSelection['latlng'];

describe('buildAirspacePeekSummary', () => {
  it('returns single-hit label and altitude range', () => {
    const selection: AirspaceSelection = {
      latlng,
      hits: [
        makeHit('ACC_Sector_High', 'acc', {
          ID: 'T31-2',
          Floor: 'FL245',
          Ceiling: 'FL335',
        }),
      ],
    };

    expect(buildAirspacePeekSummary(selection)).toBe('ACC Sector: T31-2 · FL245 - FL335');
  });

  it('returns primary label with other count for multi-hit', () => {
    const selection: AirspaceSelection = {
      latlng,
      hits: [
        makeHit('ACC_Sector_High', 'acc', {
          ID: 'T31-2',
          Floor: 'FL245',
          Ceiling: 'FL335',
        }),
        makeHit('ACC_Sector_Low', 'acc', {
          ID: 'T32-2',
          Floor: 'FL000',
          Ceiling: 'FL245',
        }),
      ],
    };

    expect(buildAirspacePeekSummary(selection)).toBe(
      'ACC Sector: T31-2 他1件 · FL245 - FL335',
    );
  });

  it('includes RAPCON frequencies in single-hit summary', () => {
    const selection: AirspaceSelection = {
      latlng,
      hits: [
        makeHit('RAPCON', 'rapcon', {
          Area_ID: '鹿児島-2',
          Freq_VHF: 'APP:126.0MHz, DEP:119.4MHz',
          Freq_UHF: '362.3MHz',
          Floor: '6,000ft',
          Ceiling: 'FL150',
        }),
      ],
    };

    expect(buildAirspacePeekSummary(selection)).toBe(
      'RAPCON: 鹿児島-2 · 6,000ft - FL150 · VHF APP:126.0MHz, DEP:119.4MHz · UHF 362.3MHz',
    );
  });

  it('returns fallback for empty hits', () => {
    const selection: AirspaceSelection = {
      latlng,
      hits: [],
    };

    expect(buildAirspacePeekSummary(selection)).toBe('空域情報');
  });
});
