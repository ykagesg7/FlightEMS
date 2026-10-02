/**
 * 国土地理院 dem_png / dem5a_png タイルから Cesium 地形を生成する。
 * tilemapjp/Cesium-JapanGSI (JapanGSITerrainProvider) の dem_png 処理を TypeScript/ESM 向けに移植。
 *
 * 欠タイル（404 / 全無効画素）は平坦 Heightmap を返し、子 refinement を止める。
 * z0 はネットワークなしのローカル平坦タイル。
 */
import {
  Credit,
  Event,
  HeightmapTerrainData,
  Resource,
  TerrainProvider,
  WebMercatorTilingScheme,
} from 'cesium';
import { imageDataIsAllGsiDemNoData } from './gsiDemPngAnalysis';
import {
  getSharedGsiDemTileCache,
} from './gsiDemTileCache';
import {
  GSI_DEM5A_MAX_LEVEL,
  GSI_DEM_PNG_MIN_LEVEL,
  GSI_PREVIEW_MAX_FETCH_LEVEL,
  shouldFetchGsiDemNetworkTile,
} from './gsiTileConfig';

const GSI_DEM_PNG_BASE = 'https://cyberjapandata.gsi.go.jp/xyz/dem_png';
const GSI_DEM5A_PNG_BASE = 'https://cyberjapandata.gsi.go.jp/xyz/dem5a_png';

const GSI_MAX_TERRAIN_LEVEL = GSI_DEM5A_MAX_LEVEL;
const DEFAULT_CREDIT = new Credit('国土地理院');
/** Cesium childTileMask: 4 子タイルすべて存在 */
const ALL_CHILDREN_MASK = 15;
const NO_CHILDREN_MASK = 0;

export type GsiDemPngTerrainProviderOptions = {
  url?: string;
  credit?: Credit | string;
  /** 地形の起伏を強調する倍率（1 = 実高度） */
  heightPower?: number;
  tileCache?: ReturnType<typeof getSharedGsiDemTileCache>;
};

/**
 * GSI DEM タイル URL を構築する。
 * z15 は dem5a_png（dem_png5a ではない）。
 */
export function buildGsiDemTileUrl(
  level: number,
  x: number,
  y: number,
  demPngBase: string = GSI_DEM_PNG_BASE,
): string {
  if (level === GSI_MAX_TERRAIN_LEVEL) {
    const dem5aBase = /\/dem_png\/?$/.test(demPngBase)
      ? demPngBase.replace(/\/dem_png\/?$/, '/dem5a_png')
      : GSI_DEM5A_PNG_BASE;
    return `${dem5aBase}/${level}/${x}/${y}.png`;
  }
  return `${demPngBase}/${level}/${x}/${y}.png`;
}

function decodeDemPngHeights(image: CanvasImageSource): {
  heightCSV: number[][];
  allNoData: boolean;
} {
  const width = 256;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);
  const allNoData = imageDataIsAllGsiDemNoData(imageData.data, width, height);
  const pixData = imageData.data;
  const heightCSV: number[][] = [];
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      const addr = (x + y * width) * 4;
      const r = pixData[addr]!;
      const g = pixData[addr + 1]!;
      const b = pixData[addr + 2]!;
      let alt: number;
      if (r === 128 && g === 0 && b === 0) {
        alt = 0;
      } else {
        let encoded = r * 65536 + g * 256 + b;
        if (encoded > 8388608) {
          encoded -= 16777216;
        }
        alt = encoded * 0.01;
      }
      row.push(alt);
    }
    heightCSV.push(row);
  }
  return { heightCSV, allNoData };
}

/**
 * GSI 数値標高 PNG（dem_png / dem5a_png）TerrainProvider。
 */
export class GsiDemPngTerrainProvider {
  readonly errorEvent = new Event();
  readonly credit: Credit;
  readonly tilingScheme: WebMercatorTilingScheme;
  readonly ready = true;

  private readonly _url: string;
  private readonly _heightPower: number;
  private readonly _cache: ReturnType<typeof getSharedGsiDemTileCache>;
  private readonly _heightmapWidth = 32;
  private readonly _demDataWidth = 256;
  private readonly _terrainDataStructure = {
    heightScale: 1,
    heightOffset: 0,
    elementsPerHeight: 1,
    stride: 1,
    elementMultiplier: 256,
  };
  private readonly _levelZeroMaximumGeometricError: number;

  constructor(options: GsiDemPngTerrainProviderOptions = {}) {
    this._url = options.url ?? GSI_DEM_PNG_BASE;
    this._heightPower = options.heightPower ?? 1;
    this._cache = options.tileCache ?? getSharedGsiDemTileCache();
    const credit = options.credit ?? DEFAULT_CREDIT;
    this.credit = typeof credit === 'string' ? new Credit(credit) : credit;
    this.tilingScheme = new WebMercatorTilingScheme({ numberOfLevelZeroTilesX: 2 });
    this._levelZeroMaximumGeometricError = TerrainProvider.getEstimatedLevelZeroGeometricErrorForAHeightmap(
      this.tilingScheme.ellipsoid,
      this._heightmapWidth,
      this.tilingScheme.getNumberOfXTilesAtLevel(0),
    );
  }

  getLevelMaximumGeometricError(level: number): number {
    return this._levelZeroMaximumGeometricError / (1 << level);
  }

  hasWaterMask(): boolean {
    return false;
  }

  hasVertexNormals(): boolean {
    return false;
  }

  getTileDataAvailable(_x: number, _y: number, _level: number): boolean {
    return true;
  }

  private createFlatTerrainData(level: number, allowRefinement: boolean): HeightmapTerrainData {
    const whm = this._heightmapWidth;
    const hmp = new Int16Array(whm * whm);
    const atMax = level >= GSI_MAX_TERRAIN_LEVEL;
    const childTileMask = atMax || !allowRefinement ? NO_CHILDREN_MASK : ALL_CHILDREN_MASK;
    return new HeightmapTerrainData({
      buffer: hmp,
      width: whm,
      height: whm,
      structure: this._terrainDataStructure,
      childTileMask,
    });
  }

  private barrenTerrain(level: number): HeightmapTerrainData {
    return this.createFlatTerrainData(level, false);
  }

  requestTileGeometry(x: number, y: number, level: number): Promise<HeightmapTerrainData> {
    if (level < GSI_DEM_PNG_MIN_LEVEL) {
      return Promise.resolve(this.createFlatTerrainData(level, true));
    }
    const orgX = x;
    const orgY = y;
    let shift = 0;
    let requestLevel = level;
    if (requestLevel > GSI_MAX_TERRAIN_LEVEL) {
      shift = requestLevel - GSI_MAX_TERRAIN_LEVEL;
      requestLevel = GSI_MAX_TERRAIN_LEVEL;
    }

    x >>= shift + 1;
    y >>= shift;
    let shiftX = (orgX % 2 ** (shift + 1)) / 2 ** (shift + 1);
    let shiftY = (orgY % 2 ** shift) / 2 ** shift;

    let fetchLevel = requestLevel;
    let fetchX = x;
    let fetchY = y;
    if (fetchLevel > GSI_PREVIEW_MAX_FETCH_LEVEL) {
      const drop = fetchLevel - GSI_PREVIEW_MAX_FETCH_LEVEL;
      fetchX >>= drop;
      fetchY >>= drop;
      fetchLevel = GSI_PREVIEW_MAX_FETCH_LEVEL;
      shift += drop;
      shiftX = (x % 2 ** drop) / 2 ** drop + shiftX / 2 ** drop;
      shiftY = (y % 2 ** drop) / 2 ** drop + shiftY / 2 ** drop;
    }

    if (!shouldFetchGsiDemNetworkTile(fetchLevel)) {
      return Promise.resolve(this.createFlatTerrainData(level, true));
    }

    const skipped = this._cache.shouldSkipNetworkFetch(fetchLevel, fetchX, fetchY);
    if (skipped) {
      return Promise.resolve(this.barrenTerrain(level));
    }

    const url = buildGsiDemTileUrl(fetchLevel, fetchX, fetchY, this._url);
    const resource = new Resource({ url });

    return (async (): Promise<HeightmapTerrainData> => {
      try {
        const image = await resource.fetchImage();
        if (!image) {
          this._cache.set(fetchLevel, fetchX, fetchY, 'missing');
          return this.barrenTerrain(level);
        }
        const { heightCSV, allNoData } = decodeDemPngHeights(image);
        if (allNoData) {
          this._cache.set(fetchLevel, fetchX, fetchY, 'nodata');
          return this.barrenTerrain(level);
        }
        this._cache.set(fetchLevel, fetchX, fetchY, 'elevated');

        const whm = this._heightmapWidth;
        const wim = this._demDataWidth;
        const hmp = new Int16Array(whm * whm);

        for (let yy = 0; yy < whm; yy++) {
          for (let xx = 0; xx < whm; xx++) {
            const py = Math.round(((yy / 2 ** shift / (whm - 1)) + shiftY) * (wim - 1));
            const px = Math.round(((xx / 2 ** (shift + 1) / (whm - 1)) + shiftX) * (wim - 1));
            hmp[yy * whm + xx] = Math.round(heightCSV[py]![px]! * this._heightPower);
          }
        }

        const allowRefinement = level < GSI_MAX_TERRAIN_LEVEL;
        return new HeightmapTerrainData({
          buffer: hmp,
          width: whm,
          height: whm,
          structure: this._terrainDataStructure,
          childTileMask: allowRefinement ? ALL_CHILDREN_MASK : NO_CHILDREN_MASK,
        });
      } catch {
        this._cache.set(fetchLevel, fetchX, fetchY, 'missing');
        return this.barrenTerrain(level);
      }
    })();
  }
}
