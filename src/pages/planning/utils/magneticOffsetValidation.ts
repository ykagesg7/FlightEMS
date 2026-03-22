/**
 * 磁方位・距離のペア検証（片方のみ入力は不可）。
 */
export function validateMagneticOffsetFields(bearing: string, distance: string): string | null {
  const hasB = bearing.trim() !== '';
  const hasD = distance.trim() !== '';
  if (hasB !== hasD) {
    return '磁方位と距離は両方入力するか、両方とも空にしてください';
  }
  return null;
}
