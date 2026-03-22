/**
 * ISA（国際標準大気）の気圧高度近似: 静圧 hPa から幾何高度 ft（MSL 相当の標準気圧面）。
 * 対流圏の指数近似（教育・表示用。実際の気温偏差は考慮しない）。
 */
export function approxGeopotentialFeetIsaFromPressureHpa(pressureHpa: number): number {
  const p0 = 1013.25;
  if (!Number.isFinite(pressureHpa) || pressureHpa <= 0 || pressureHpa >= p0) {
    return 0;
  }
  const hM = 44330 * (1 - (pressureHpa / p0) ** 0.190284);
  return hM * 3.28084;
}
