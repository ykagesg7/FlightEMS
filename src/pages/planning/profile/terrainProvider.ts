export interface TerrainSample {
  distanceNm: number;
  elevationFt: number | null;
}

export function buildEmptyTerrainSamples(distancesNm: number[]): TerrainSample[] {
  return distancesNm.map((distanceNm) => ({ distanceNm, elevationFt: null }));
}
