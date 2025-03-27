// 高精度計算モデルでの速度計算テスト

// 定数
const GAMMA = 1.4; // 比熱比
const R_AIR = 287.05287; // J/(kg·K)
const T0_K = 288.15; // K (15 °C)
const P0_PA = 101325.0; // Pa
const RHO0_KGM3 = P0_PA / (R_AIR * T0_K); // kg/m^3
const G0_MPS2 = 9.80665; // m/s^2
const LAMBDA_KPM = -0.0065; // K/m (対流圏)
const H_TROP_M = 11000.0; // m
const T_TROP_K = T0_K + LAMBDA_KPM * H_TROP_M; // K

// 単位変換係数
const KT_TO_MPS = 0.514444;
const FT_TO_M = 0.3048;
const C_TO_K = 273.15;

/**
 * 高精度計算結果のインターフェース
 */
class AirspeedResult {
  constructor(easKt, tasKt, mach, satK, pressurePa, densityKgm3) {
    this.easKt = easKt;       // 等価対気速度 (ノット)
    this.tasKt = tasKt;       // 真対気速度 (ノット)
    this.mach = mach;         // マッハ数
    this.satK = satK;         // 計算された静大気温度 (ケルビン)
    this.pressurePa = pressurePa; // 計算された静圧 (パスカル)
    this.densityKgm3 = densityKgm3; // 計算された空気密度 (kg/m^3)
  }
}

/**
 * IAS (CASと近似), 高度, 地上気温, 地上標高から EAS, TAS, Mach を高精度で計算する。
 * ISA偏差と圧縮性を考慮する。
 * @param iasKt 指示対気速度 (ノット) - CASとして扱われる
 * @param altitudeFt 気圧高度 (フィート)
 * @param groundTempC 地上の気温 (摂氏)
 * @param groundElevationFt 地上の標高 (フィート)
 * @returns 計算結果オブジェクト (AirspeedResult) または計算不能の場合 null
 */
function calculateAirspeeds(
  iasKt,
  altitudeFt,
  groundTempC,
  groundElevationFt
) {
  // Step 1: 単位変換
  const casMps = iasKt * KT_TO_MPS;
  const hM = altitudeFt * FT_TO_M;
  const elevM = groundElevationFt * FT_TO_M;
  const tGroundK = groundTempC + C_TO_K;

  // Step 2: ISA偏差 (ΔT_isa) の計算
  const tStdElevK = T0_K + LAMBDA_KPM * Math.min(elevM, H_TROP_M);
  const deltaTisaK = tGroundK - tStdElevK;

  // Step 3: 飛行高度における静大気温度 (SAT) の計算
  let tStdAltK;
  if (hM <= H_TROP_M) {
    tStdAltK = T0_K + LAMBDA_KPM * hM;
  } else {
    tStdAltK = T_TROP_K;
  }
  let tAltK = tStdAltK + deltaTisaK;
  tAltK = Math.max(tAltK, 1.0); // 物理的な下限値 (絶対零度以上)

  // Step 4: 飛行高度における静圧 (P) の計算
  let pAltPa;
  try {
    if (hM <= H_TROP_M) {
      if (T0_K <= 0) return null; // Avoid division by zero or log of non-positive
      const base = 1 + LAMBDA_KPM * hM / T0_K;
      if (base <= 0) return null; // Avoid power of non-positive base if exponent is not integer
      if (R_AIR === 0 || LAMBDA_KPM === 0) return null; // Avoid division by zero
      pAltPa = P0_PA * Math.pow(base, -G0_MPS2 / (R_AIR * LAMBDA_KPM));
    } else {
      if (T0_K <= 0 || T_TROP_K <= 0) return null; // Avoid invalid temperature values
      const pTropBase = T_TROP_K / T0_K;
      if (pTropBase <= 0) return null; // Avoid power of non-positive base
      if (R_AIR === 0 || LAMBDA_KPM === 0) return null; // Avoid division by zero
      const pTrop = P0_PA * Math.pow(pTropBase, -G0_MPS2 / (R_AIR * LAMBDA_KPM));
      if (R_AIR === 0 || T_TROP_K === 0) return null; // Avoid division by zero
      pAltPa = pTrop * Math.exp(-G0_MPS2 * (hM - H_TROP_M) / (R_AIR * T_TROP_K));
    }
    if (isNaN(pAltPa) || pAltPa < 0) return null; // Pressure must be non-negative
  } catch (e) {
    console.error("Error calculating pressure:", e);
    return null;
  }

  // Step 5: CAS -> EAS の計算 (圧縮性考慮)
  let easMps;
  let easKt;
  try {
    const a0Mps = Math.sqrt(GAMMA * R_AIR * T0_K);
    if (a0Mps === 0) return null; // Avoid division by zero

    const casRatioSq = Math.pow(casMps / a0Mps, 2);
    // Check if the base for the power is valid
    const pressureRatioBase = 1 + (GAMMA - 1) / 2 * casRatioSq;
    if (pressureRatioBase <= 0 && GAMMA / (GAMMA - 1) % 1 !== 0) return null; // Avoid power of non-positive base for non-integer exponent
    const pressureRatioTerm = Math.pow(pressureRatioBase, GAMMA / (GAMMA - 1));
    const qC = P0_PA * (pressureRatioTerm - 1);

    if (isNaN(qC) || RHO0_KGM3 <= 0) return null; // Check validity before sqrt
    const qCDivRho = 2 * qC / RHO0_KGM3;
    if (qCDivRho < 0) return null; // Avoid sqrt of negative number

    easMps = Math.sqrt(qCDivRho);
    easKt = easMps / KT_TO_MPS;
  } catch (e) {
    console.error("Error calculating EAS:", e);
    return null;
  }

  // Step 6: EAS -> TAS の計算
  let tasMps;
  let tasKt;
  let rhoAltKgm3;
  try {
    if (R_AIR === 0 || tAltK === 0) return null; // Avoid division by zero
    rhoAltKgm3 = pAltPa / (R_AIR * tAltK);
    if (isNaN(rhoAltKgm3) || rhoAltKgm3 <= 0 || RHO0_KGM3 <= 0) return null; // Density must be positive

    const sigma = rhoAltKgm3 / RHO0_KGM3;
    if (sigma <= 0) return null; // Avoid sqrt of non-positive

    tasMps = easMps / Math.sqrt(sigma);
    tasKt = tasMps / KT_TO_MPS;
  } catch (e) {
    console.error("Error calculating TAS:", e);
    return null;
  }

  // Step 7: Mach数の計算
  let mach;
  try {
    if (tAltK <= 0) return null; // Temperature must be positive for sound speed calculation
    const aAltMps = Math.sqrt(GAMMA * R_AIR * tAltK);
    if (aAltMps === 0) return null; // Avoid division by zero

    mach = tasMps / aAltMps;
  } catch (e) {
    console.error("Error calculating Mach:", e);
    return null;
  }

  // Check final results for NaN or Infinity
  if (isNaN(easKt) || isNaN(tasKt) || isNaN(mach) || !isFinite(easKt) || !isFinite(tasKt) || !isFinite(mach) || isNaN(rhoAltKgm3)) {
      console.error("Invalid final calculation result.");
      return null;
  }

  return new AirspeedResult(easKt, tasKt, mach, tAltK, pAltPa, rhoAltKgm3);
}

// 実行するケース: 高度24000ft、地上気温20℃、IAS 300ktの場合
const iasKt = 300;
const altitudeFt = 24000;
const groundTempC = 20;
const groundElevationFt = 0;

const result = calculateAirspeeds(iasKt, altitudeFt, groundTempC, groundElevationFt);

if (result) {
  console.log("\n=== 高精度速度計算結果 ===");
  console.log(`入力パラメータ:`);
  console.log(`- IAS (CAS): ${iasKt} kt`);
  console.log(`- 高度: ${altitudeFt} ft`);
  console.log(`- 地上気温: ${groundTempC} °C`);
  console.log(`- 地上標高: ${groundElevationFt} ft`);
  console.log("\n計算結果:");
  console.log(`- EAS: ${result.easKt.toFixed(1)} kt`);
  console.log(`- TAS: ${result.tasKt.toFixed(1)} kt`);
  console.log(`- Mach: ${result.mach.toFixed(3)}`);
  console.log(`- 静大気温度: ${(result.satK - 273.15).toFixed(1)} °C`);
  console.log(`- 静大気圧: ${(result.pressurePa / 100).toFixed(1)} hPa`);
  console.log(`- 空気密度: ${result.densityKgm3.toFixed(4)} kg/m³`);
  
  // 各値を個別に出力して問題を特定
  console.log("\n検証値:");
  console.log(`- 実測Mach: 0.7`);
  console.log(`- 計算Mach: ${result.mach.toFixed(3)}`);
  
  // 実測値と計算値の差を計算
  const diffPercent = Math.abs((0.7 - result.mach) / 0.7 * 100);
  console.log(`- 差異: ${diffPercent.toFixed(1)}%`);
  
  // 結論
  if (diffPercent <= 5) {
    console.log("\n結論: 計算値と実測値は非常に近く、計算モデルは実際の飛行条件をよく反映しています。");
  } else if (diffPercent <= 10) {
    console.log("\n結論: 計算値と実測値にはわずかな差がありますが、現実的な範囲内です。");
  } else {
    console.log("\n結論: 計算値と実測値に顕著な差があります。モデルの前提条件と実際の飛行条件に違いがある可能性があります。");
  }
} else {
  console.log("計算エラーが発生しました。");
} 