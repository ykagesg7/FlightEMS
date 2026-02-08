import { describe, it, expect } from 'vitest';
import { findAirspaceFrequency } from '../../utils/airspace';
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
});
