import type {
  AircraftPerformanceOverrides,
  AircraftPreset,
  DescentMode,
  VerticalRatePoint,
} from '../types';

/**
 * Kawasaki T-4 教育用モック。実機の Dash-1 / 性能表ではない。
 *
 * 値の出典は 3 段階で管理する。
 * - 教官提供: 現場の教官から口頭で受領した運用値。プリセットの既定はこれを優先する
 * - 公開値: Wikipedia 等の二次情報。教官提供と食い違う場合はコメントに併記のみ
 * - 要確認: 暫定のまま。実測値の受領後に差し替える
 *
 * 公開値（二次情報）:
 * - 実用上昇限度 15,240 m（約 50,000 ft）
 * - 上昇率 51 m/s（約 10,000 fpm）
 * - 内部燃料 2,241 L（約 592 US gal ≒ 3,950 lb @ 6.7 lb/gal）
 * - 増槽 450 L × 2 を加えると約 5,550 lb
 *
 * 教官提供値は訓練で実際に使うプロファイルであり、公開値のカタログ性能とは
 * 意図的に異なる。計画側で上書きしたい場合は FlightPlan.performanceOverrides を使う。
 */
export const aircraftPresets: AircraftPreset[] = [
  {
    id: 't4',
    name: 'Kawasaki T-4 (mock)',
    cruiseFuelFlowLbPerHr: 2200, // 教官提供: 当面は高度によらず 2200 PPH
    taxiFuelLb: 200, // 要確認
    reserveFuelLb: 800, // 要確認
    defaultInitialFuelLb: 5000, // 要確認
    maxFuelLb: 5500, // 要確認（公開値の内部 + 増槽 2 本が約 5,550 lb）
    alternateFuelLb: 400, // 要確認
    serviceCeilingFt: 40_000, // 教官提供（公開値は 50,000 ft）
    climb: {
      targetCasKt: 300, // 教官提供
      targetMach: 0.65, // 教官提供: クロスオーバー
      // 教官提供: 高度帯別の内訳は未受領のため平均 3000 fpm を一律に置く
      ratesFpm: [
        { altitudeFt: 0, fpm: 3000 },
        { altitudeFt: 10_000, fpm: 3000 },
        { altitudeFt: 20_000, fpm: 3000 },
        { altitudeFt: 30_000, fpm: 3000 },
      ],
      fuelFlowLbPerHr: 4000, // 教官提供: 約 4000 PPH
    },
    descent: {
      targetCasKt: 300, // 教官提供
      ratesFpm: [{ altitudeFt: 0, fpm: 3000 }], // 教官提供: 標準降下
      idleRatesFpm: [{ altitudeFt: 0, fpm: 6000 }], // 教官提供: アイドル降下
      fuelFlowLbPerHr: 2000, // 教官提供: 約 2000 PPH
    },
  },
];

export const getAircraftPreset = (id?: string) =>
  aircraftPresets.find((preset) => preset.id === id);

function flatRate(fpm: number): VerticalRatePoint[] {
  return [{ altitudeFt: 0, fpm }];
}

function positive(value: number | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
}

/**
 * プリセットに計画単位の上書きと降下モードを適用した実効プリセットを返す。
 * 上書きは正の有限値のみ採用し、未指定・不正値はプリセット既定に落とす。
 */
export function resolveAircraftPreset(
  preset: AircraftPreset | undefined,
  overrides?: AircraftPerformanceOverrides,
  descentMode: DescentMode = 'standard',
): AircraftPreset | undefined {
  if (!preset) return undefined;

  const climb = preset.climb
    ? {
        ...preset.climb,
        targetCasKt: positive(overrides?.climbCasKt) ?? preset.climb.targetCasKt,
        targetMach: positive(overrides?.climbMach) ?? preset.climb.targetMach,
        ratesFpm: positive(overrides?.climbRateFpm)
          ? flatRate(overrides!.climbRateFpm!)
          : preset.climb.ratesFpm,
        fuelFlowLbPerHr:
          positive(overrides?.climbFuelFlowLbPerHr) ?? preset.climb.fuelFlowLbPerHr,
      }
    : undefined;

  let descent = preset.descent;
  if (descent) {
    const overriddenRate =
      descentMode === 'idle'
        ? positive(overrides?.descentIdleRateFpm)
        : positive(overrides?.descentRateFpm);
    const modeRates =
      descentMode === 'idle' ? descent.idleRatesFpm ?? descent.ratesFpm : descent.ratesFpm;
    descent = {
      ...descent,
      targetCasKt: positive(overrides?.descentCasKt) ?? descent.targetCasKt,
      ratesFpm: overriddenRate ? flatRate(overriddenRate) : modeRates,
      fuelFlowLbPerHr:
        positive(overrides?.descentFuelFlowLbPerHr) ?? descent.fuelFlowLbPerHr,
    };
  }

  return {
    ...preset,
    cruiseFuelFlowLbPerHr:
      positive(overrides?.cruiseFuelFlowLbPerHr) ?? preset.cruiseFuelFlowLbPerHr,
    serviceCeilingFt: positive(overrides?.serviceCeilingFt) ?? preset.serviceCeilingFt,
    maxFuelLb: positive(overrides?.maxFuelLb) ?? preset.maxFuelLb,
    climb,
    descent,
  };
}

/** UI の既定値表示用。プリセットから現在の実効値を読み出す */
export function describeAircraftPerformance(
  preset: AircraftPreset | undefined,
  descentMode: DescentMode = 'standard',
): Required<AircraftPerformanceOverrides> {
  const descentRates =
    descentMode === 'idle'
      ? preset?.descent?.idleRatesFpm ?? preset?.descent?.ratesFpm
      : preset?.descent?.ratesFpm;
  return {
    climbCasKt: preset?.climb?.targetCasKt ?? 0,
    climbMach: preset?.climb?.targetMach ?? 0,
    climbRateFpm: preset?.climb?.ratesFpm?.[0]?.fpm ?? 0,
    climbFuelFlowLbPerHr: preset?.climb?.fuelFlowLbPerHr ?? 0,
    descentCasKt: preset?.descent?.targetCasKt ?? 0,
    descentRateFpm: descentRates?.[0]?.fpm ?? 0,
    descentIdleRateFpm: preset?.descent?.idleRatesFpm?.[0]?.fpm ?? 0,
    descentFuelFlowLbPerHr: preset?.descent?.fuelFlowLbPerHr ?? 0,
    cruiseFuelFlowLbPerHr: preset?.cruiseFuelFlowLbPerHr ?? 0,
    serviceCeilingFt: preset?.serviceCeilingFt ?? 0,
    maxFuelLb: preset?.maxFuelLb ?? 0,
  };
}
