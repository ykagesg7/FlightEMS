/** GSI 標高 PNG の無効画素 (128, 0, 0) — 仕様上 NA */
export function isGsiDemNoDataRgb(r: number, g: number, b: number): boolean {
  return r === 128 && g === 0 && b === 0;
}

/** ImageData がすべて無効画素なら海上など — 子 refinement 不要 */
export function imageDataIsAllGsiDemNoData(data: Uint8ClampedArray, width: number, height: number): boolean {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const addr = (x + y * width) * 4;
      if (!isGsiDemNoDataRgb(data[addr]!, data[addr + 1]!, data[addr + 2]!)) {
        return false;
      }
    }
  }
  return true;
}
