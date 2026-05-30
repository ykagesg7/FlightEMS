import { describe, it, expect } from 'vitest';
import {
  altitudeRangeContains,
  findAirspaceFrequency,
  findAirspaceHitsAtPoint,
  isValidAirspaceFeature,
  parseAltitudeToken,
  sanitizeAirspaceDataset,
} from '../../utils/airspace';
import type { AirspaceDataset } from '../../utils/airspace';

// テスト用の正方形ポリゴン（経度130-140, 緯度30-40）
const createSquarePolygonDataset = (
  props: Record<string, unknown> = { frequency: '124.1', name: 'Tokyo Control' }
): AirspaceDataset => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: props,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [130, 30],
            [140, 30],
            [140, 40],
            [130, 40],
            [130, 30],
          ],
        ],
      },
    },
  ],
});

// テスト用の MultiPolygon データセット
const createMultiPolygonDataset = (): AirspaceDataset => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { frequency: '120.5', name: 'Multi Sector' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // ポリゴン1: 経度100-110, 緯度10-20
          [
            [
              [100, 10],
              [110, 10],
              [110, 20],
              [100, 20],
              [100, 10],
            ],
          ],
          // ポリゴン2: 経度120-130, 緯度10-20
          [
            [
              [120, 10],
              [130, 10],
              [130, 20],
              [120, 20],
              [120, 10],
            ],
          ],
        ],
      },
    },
  ],
});

describe('Airspace Utils', () => {
  describe('findAirspaceFrequency', () => {
    it('should find frequency for point inside polygon', () => {
      const dataset = createSquarePolygonDataset();
      const result = findAirspaceFrequency([135, 35], [{ id: 'test', data: dataset }]);

      expect(result).toBeDefined();
      expect(result?.frequency).toBe('124.1');
      expect(result?.name).toBe('Tokyo Control');
      expect(result?.sourceId).toBe('test');
    });

    it('should return undefined for point outside polygon', () => {
      const dataset = createSquarePolygonDataset();
      // 経度150, 緯度50 はポリゴンの外
      const result = findAirspaceFrequency([150, 50], [{ id: 'test', data: dataset }]);

      expect(result).toBeUndefined();
    });

    it('should return undefined for point on the edge (boundary test)', () => {
      const dataset = createSquarePolygonDataset();
      // 角の点はray castingアルゴリズムによっては内部とも外部とも判定されうる
      // ここでは明確に外側の点をテスト
      const result = findAirspaceFrequency([129, 35], [{ id: 'test', data: dataset }]);

      expect(result).toBeUndefined();
    });

    it('should handle MultiPolygon - point in first polygon', () => {
      const dataset = createMultiPolygonDataset();
      const result = findAirspaceFrequency([105, 15], [{ id: 'multi', data: dataset }]);

      expect(result).toBeDefined();
      expect(result?.frequency).toBe('120.5');
      expect(result?.name).toBe('Multi Sector');
    });

    it('should handle MultiPolygon - point in second polygon', () => {
      const dataset = createMultiPolygonDataset();
      const result = findAirspaceFrequency([125, 15], [{ id: 'multi', data: dataset }]);

      expect(result).toBeDefined();
      expect(result?.frequency).toBe('120.5');
    });

    it('should handle MultiPolygon - point outside all polygons', () => {
      const dataset = createMultiPolygonDataset();
      const result = findAirspaceFrequency([115, 15], [{ id: 'multi', data: dataset }]);

      expect(result).toBeUndefined();
    });

    it('should fallback from "frequency" to "freq" property', () => {
      const dataset = createSquarePolygonDataset({ freq: '118.7' });
      const result = findAirspaceFrequency([135, 35], [{ id: 'test', data: dataset }]);

      expect(result).toBeDefined();
      expect(result?.frequency).toBe('118.7');
    });

    it('should prefer "frequency" over "freq" when both exist', () => {
      const dataset = createSquarePolygonDataset({ frequency: '124.1', freq: '118.7' });
      const result = findAirspaceFrequency([135, 35], [{ id: 'test', data: dataset }]);

      expect(result?.frequency).toBe('124.1');
    });

    it('should fallback from "name" to "id" property', () => {
      const dataset = createSquarePolygonDataset({ frequency: '124.1', id: 'SECTOR-A' });
      const result = findAirspaceFrequency([135, 35], [{ id: 'test', data: dataset }]);

      expect(result).toBeDefined();
      expect(result?.name).toBe('SECTOR-A');
    });

    it('should skip features without frequency properties', () => {
      const dataset = createSquarePolygonDataset({ name: 'No Frequency Sector' });
      const result = findAirspaceFrequency([135, 35], [{ id: 'test', data: dataset }]);

      // freq がないのでヒットしない
      expect(result).toBeUndefined();
    });

    it('should handle null dataset gracefully', () => {
      const result = findAirspaceFrequency([135, 35], [{ id: 'test', data: null }]);

      expect(result).toBeUndefined();
    });

    it('should handle empty datasets array', () => {
      const result = findAirspaceFrequency([135, 35], []);

      expect(result).toBeUndefined();
    });

    it('should handle dataset with no features', () => {
      const emptyDataset: AirspaceDataset = {
        type: 'FeatureCollection',
        features: [],
      };
      const result = findAirspaceFrequency([135, 35], [{ id: 'test', data: emptyDataset }]);

      expect(result).toBeUndefined();
    });

    it('should return first matching dataset when multiple datasets match', () => {
      const dataset1 = createSquarePolygonDataset({ frequency: '124.1', name: 'First' });
      const dataset2 = createSquarePolygonDataset({ frequency: '119.0', name: 'Second' });

      const result = findAirspaceFrequency(
        [135, 35],
        [
          { id: 'first', data: dataset1 },
          { id: 'second', data: dataset2 },
        ]
      );

      expect(result?.frequency).toBe('124.1');
      expect(result?.sourceId).toBe('first');
      expect(result?.name).toBe('First');
    });

    it('should skip null datasets and find match in subsequent dataset', () => {
      const dataset = createSquarePolygonDataset({ frequency: '124.1', name: 'Found' });

      const result = findAirspaceFrequency(
        [135, 35],
        [
          { id: 'null-one', data: null },
          { id: 'valid', data: dataset },
        ]
      );

      expect(result?.frequency).toBe('124.1');
      expect(result?.sourceId).toBe('valid');
    });

    it('should handle feature with null geometry', () => {
      const dataset: AirspaceDataset = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { frequency: '124.1' },
            geometry: null as unknown as AirspaceDataset['features'][0]['geometry'],
          },
        ],
      };

      const result = findAirspaceFrequency([135, 35], [{ id: 'test', data: dataset }]);
      expect(result).toBeUndefined();
    });
  });

  describe('parseAltitudeToken', () => {
    it('parses FL tokens to feet', () => {
      expect(parseAltitudeToken('FL245')).toBe(24500);
      expect(parseAltitudeToken('fl335')).toBe(33500);
    });

    it('treats empty and SFC as surface', () => {
      expect(parseAltitudeToken('')).toBe(0);
      expect(parseAltitudeToken('SFC')).toBe(0);
      expect(parseAltitudeToken('GND')).toBe(0);
    });

    it('treats UNL as infinity', () => {
      expect(parseAltitudeToken('UNL')).toBe(Number.POSITIVE_INFINITY);
    });

    it('parses plain feet values', () => {
      expect(parseAltitudeToken('1500')).toBe(1500);
      expect(parseAltitudeToken('1500FT')).toBe(1500);
    });
  });

  describe('altitudeRangeContains', () => {
    it('returns true when altitude is within floor and ceiling', () => {
      expect(altitudeRangeContains('', 'FL245', 20000)).toBe(true);
      expect(altitudeRangeContains('FL245', 'FL335', 28000)).toBe(true);
    });

    it('returns false when altitude is above ceiling', () => {
      expect(altitudeRangeContains('', 'FL245', 26000)).toBe(false);
    });

    it('returns false when altitude is below floor', () => {
      expect(altitudeRangeContains('FL245', 'FL335', 20000)).toBe(false);
    });
  });

  describe('findAirspaceHitsAtPoint', () => {
    const overlappingDataset: AirspaceDataset = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { ID: 'T32-2', Floor: '', Ceiling: 'FL245' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [138, 40],
                [141, 40],
                [141, 41],
                [138, 41],
                [138, 40],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { ID: 'T32-1', Floor: '', Ceiling: 'FL335' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [137, 39],
                [142, 39],
                [142, 42],
                [137, 42],
                [137, 39],
              ],
            ],
          },
        },
      ],
    };

    it('returns multiple hits for overlapping polygons', () => {
      const hits = findAirspaceHitsAtPoint([139.5, 40.5], [
        { id: 'ACC_Sector_Low', data: overlappingDataset },
      ]);

      expect(hits).toHaveLength(2);
      expect(hits[0].feature.properties?.ID).toBe('T32-1');
      expect(hits[1].feature.properties?.ID).toBe('T32-2');
    });

    it('returns empty array for point outside polygons', () => {
      const hits = findAirspaceHitsAtPoint([150, 50], [
        { id: 'ACC_Sector_Low', data: overlappingDataset },
      ]);

      expect(hits).toHaveLength(0);
    });

    it('sorts hits by ceiling descending (highest first)', () => {
      const reversedDataset: AirspaceDataset = {
        type: 'FeatureCollection',
        features: [...overlappingDataset.features].reverse(),
      };

      const hits = findAirspaceHitsAtPoint([139.5, 40.5], [
        { id: 'ACC_Sector_Low', data: reversedDataset },
      ]);

      expect(hits[0].feature.properties?.ID).toBe('T32-1');
      expect(hits[1].feature.properties?.ID).toBe('T32-2');
    });

    it('sorts by source tier when altitudes tie (High, Low, RAPCON)', () => {
      const geom = overlappingDataset.features[0].geometry;
      const sharedAlt = { Floor: 'FL245', Ceiling: 'FL335' };

      const hits = findAirspaceHitsAtPoint([139.5, 40.5], [
        {
          id: 'RAPCON',
          data: {
            type: 'FeatureCollection',
            features: [
              { type: 'Feature', properties: { Area_ID: 'RAP-A', ...sharedAlt }, geometry: geom },
            ],
          },
        },
        {
          id: 'ACC_Sector_Low',
          data: {
            type: 'FeatureCollection',
            features: [
              { type: 'Feature', properties: { ID: 'L-1', ...sharedAlt }, geometry: geom },
            ],
          },
        },
        {
          id: 'ACC_Sector_High',
          data: {
            type: 'FeatureCollection',
            features: [
              { type: 'Feature', properties: { ID: 'H-1', ...sharedAlt }, geometry: geom },
            ],
          },
        },
      ]);

      expect(hits.map((h) => h.sourceId)).toEqual([
        'ACC_Sector_High',
        'ACC_Sector_Low',
        'RAPCON',
      ]);
    });

    it('assigns kind based on source id', () => {
      const hits = findAirspaceHitsAtPoint([139.5, 40.5], [
        { id: 'RAPCON', data: overlappingDataset },
      ]);

      expect(hits[0].kind).toBe('rapcon');
      expect(hits[0].sourceId).toBe('RAPCON');
    });
  });

  describe('sanitizeAirspaceDataset', () => {
    it('removes features with empty polygon rings', () => {
      const dataset: AirspaceDataset = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { ID: 'T33' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[]]],
            },
          },
          {
            type: 'Feature',
            properties: { ID: 'T32-2' },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [138, 40],
                  [141, 40],
                  [141, 41],
                  [138, 41],
                  [138, 40],
                ],
              ],
            },
          },
        ],
      };

      const sanitized = sanitizeAirspaceDataset(dataset);
      expect(sanitized.features).toHaveLength(1);
      expect(sanitized.features[0].properties?.ID).toBe('T32-2');
      expect(isValidAirspaceFeature(dataset.features[0])).toBe(false);
      expect(isValidAirspaceFeature(dataset.features[1])).toBe(true);
    });
  });
});
