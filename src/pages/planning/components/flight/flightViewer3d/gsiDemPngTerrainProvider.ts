/**
 * 国土地理院 dem_png / dem5a_png タイルから Cesium 地形を生成する。
 * tilemapjp/Cesium-JapanGSI (JapanGSITerrainProvider) の dem_png 処理を TypeScript/ESM 向けに移植。
 *
 * 欠タイル（404 / 全無効画素）は常に海抜 0 の平坦メッシュ（親アップサンプルなし）。
 * 実 DEM の nodata / 海上画素も同じ 0m に正規化し、LOD・隣接タイル間の段差を抑える。
 */
import {
  Credit,
  Event,
  HeightmapTerrainData,
  Resource,
  TerrainProvider,
  WebMercatorTilingScheme,
} from 'cesium';
import {
  computeGsiDemHeightGridMinMax,
  gsiDemHeightGridIsOpenOceanWithoutNodata,
  imageDataIsAllGsiDemNoData,
  isGsiDemNoDataRgb,
  sampleGsiDemHeightForTerrain,
} from './gsiDemPngAnalysis';
import {
  gsiDemFetchTileNeedsNetwork,
  gsiDemSeaLevelAllowsChildRefinement,
  resolveGsiDemFetchTile,
} from './gsiDemTerrainFallback';
import {
  getSharedGsiDemTileCache,
  isBarrenGsiDemTileStatus,
  type GsiDemTileStatus,
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

export type GsiDemDecodedHeights = {
  heightCSV: number[][];
  allNoData: boolean;
  nodataRatio: number;
};

function decodeDemPngHeights(image: CanvasImageSource): GsiDemDecodedHeights {
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
  let nodataCount = 0;
  const pixelCount = width * height;
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      const addr = (x + y * width) * 4;
      const r = pixData[addr]!;
      const g = pixData[addr + 1]!;
      const b = pixData[addr + 2]!;
      const noData = isGsiDemNoDataRgb(r, g, b);
      if (noData) {
        nodataCount += 1;
        row.push(Number.NaN);
        continue;
      }
      let encoded = r * 65536 + g * 256 + b;
      if (encoded > 8388608) {
        encoded -= 16777216;
      }
      row.push(encoded * 0.01);
    }
    heightCSV.push(row);
  }
  const nodataRatio = nodataCount / pixelCount;
  return { heightCSV, allNoData, nodataRatio };
}

type FetchTileShift = {
  shift: number;
  shiftX: number;
  shiftY: number;
};

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

  /** 欠損・海上タイル用の 0m 平坦メッシュ（全 LOD で同一基準） */
  private seaLevelTerrain(level: number): HeightmapTerrainData {
    return this.createFlatTerrainData(level, gsiDemSeaLevelAllowsChildRefinement(level));
  }

  private buildTerrainFromHeightCsv(
    level: number,
    heightCSV: number[][],
    sampling: FetchTileShift,
    nodataRatio: number,
  ): HeightmapTerrainData {
    const whm = this._heightmapWidth;
    const wim = this._demDataWidth;
    const hmp = new Int16Array(whm * whm);
    const { shift, shiftX, shiftY } = sampling;
    const { min: tileMinM, max: tileMaxM } = computeGsiDemHeightGridMinMax(heightCSV);

    for (let yy = 0; yy < whm; yy++) {
      for (let xx = 0; xx < whm; xx++) {
        const py = Math.round(((yy / 2 ** shift / (whm - 1)) + shiftY) * (wim - 1));
        const px = Math.round(((xx / 2 ** (shift + 1) / (whm - 1)) + shiftX) * (wim - 1));
        const sampleM = sampleGsiDemHeightForTerrain(
          heightCSV[py]![px]!,
          nodataRatio,
          tileMinM,
          tileMaxM,
        );
        hmp[yy * whm + xx] = Math.round(sampleM * this._heightPower);
      }
    }

    const allowRefinement = gsiDemSeaLevelAllowsChildRefinement(level);
    return new HeightmapTerrainData({
      buffer: hmp,
      width: whm,
      height: whm,
      structure: this._terrainDataStructure,
      childTileMask: allowRefinement ? ALL_CHILDREN_MASK : NO_CHILDREN_MASK,
    });
  }

  private markTileStatus(
    fetchLevel: number,
    fetchX: number,
    fetchY: number,
    status: GsiDemTileStatus,
  ): void {
    this._cache.set(fetchLevel, fetchX, fetchY, status);
  }

  private async loadHeightCsvFromNetwork(
    fetchLevel: number,
    fetchX: number,
    fetchY: number,
  ): Promise<GsiDemDecodedHeights | 'missing' | 'nodata'> {
    if (!shouldFetchGsiDemNetworkTile(fetchLevel)) {
      return 'missing';
    }

    const skip = this._cache.shouldSkipNetworkFetch(fetchLevel, fetchX, fetchY);
    if (skip === 'missing' || skip === 'nodata') {
      return skip;
    }
    if (skip) {
      return 'missing';
    }

    const url = buildGsiDemTileUrl(fetchLevel, fetchX, fetchY, this._url);
    const resource = new Resource({ url, retryAttempts: 0 });

    try {
      const image = await resource.fetchImage();
      if (!image) {
        this.markTileStatus(fetchLevel, fetchX, fetchY, 'missing');
        return 'missing';
      }
      const decoded = decodeDemPngHeights(image);
      if (decoded.allNoData) {
        this.markTileStatus(fetchLevel, fetchX, fetchY, 'nodata');
        return 'nodata';
      }
      this.markTileStatus(fetchLevel, fetchX, fetchY, 'elevated');
      return decoded;
    } catch {
      this.markTileStatus(fetchLevel, fetchX, fetchY, 'missing');
      return 'missing';
    }
  }

  private resolveMissingTile(level: number): HeightmapTerrainData {
    return this.seaLevelTerrain(level);
  }

  requestTileGeometry(x: number, y: number, level: number): Promise<HeightmapTerrainData> {
    if (level < GSI_DEM_PNG_MIN_LEVEL) {
      return Promise.resolve(this.createFlatTerrainData(level, true));
    }

    const fetch = resolveGsiDemFetchTile(x, y, level, GSI_PREVIEW_MAX_FETCH_LEVEL);
    const sampling: FetchTileShift = {
      shift: fetch.shift,
      shiftX: fetch.shiftX,
      shiftY: fetch.shiftY,
    };

    if (!gsiDemFetchTileNeedsNetwork(fetch) || !shouldFetchGsiDemNetworkTile(fetch.fetchLevel)) {
      return Promise.resolve(this.createFlatTerrainData(level, true));
    }

    const cached = this._cache.get(fetch.fetchLevel, fetch.fetchX, fetch.fetchY);
    if (cached === 'missing' || cached === 'nodata') {
      return Promise.resolve(this.resolveMissingTile(level));
    }

    const skipped = this._cache.shouldSkipNetworkFetch(fetch.fetchLevel, fetch.fetchX, fetch.fetchY);
    if (skipped === 'missing' || skipped === 'nodata') {
      return Promise.resolve(this.resolveMissingTile(level));
    }
    if (skipped) {
      const selfStatus = this._cache.get(fetch.fetchLevel, fetch.fetchX, fetch.fetchY);
      if (isBarrenGsiDemTileStatus(selfStatus)) {
        return Promise.resolve(this.resolveMissingTile(level));
      }
    }

    return (async (): Promise<HeightmapTerrainData> => {
      const loaded = await this.loadHeightCsvFromNetwork(
        fetch.fetchLevel,
        fetch.fetchX,
        fetch.fetchY,
      );
      if (loaded === 'missing' || loaded === 'nodata') {
        return this.resolveMissingTile(level);
      }
      if (gsiDemHeightGridIsOpenOceanWithoutNodata(loaded.heightCSV)) {
        return this.resolveMissingTile(level);
      }
      return this.buildTerrainFromHeightCsv(level, loaded.heightCSV, sampling, loaded.nodataRatio);
    })();
  }
}
