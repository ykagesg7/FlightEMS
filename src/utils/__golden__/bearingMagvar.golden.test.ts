/**
 * ゴールデンテスト: 真方位・磁気偏差・磁方位換算
 * 正解値: gungi/golden-tests/bearing_magvar.json（expected が null のケースは skip）
 * 記入手順: gungi/golden-tests/FILLING_GUIDE.md
 *
 * 型チェック: tsconfig.app.json の exclude により tsc -b 対象外（README 参照）。
 *
 * 許容誤差（JSON の tolerancePolicy / case.tolerance が正）:
 *   - trueBearing      abs 0.2°（現行は球面公式。楕円体実装なら 0.001°）
 *   - magneticVariation abs 0.5°（外挿域・離島は case ごとに 1.0°）
 *   - magneticBearing  abs 1e-9（定義どおりの加算と正規化）
 *
 * knownFailing + it.fails: モデル改修前の既知不合格。マーカーなしで pass すると CI が Red。
 * 期待値をこのファイルや JSON で書き換えて通すことは禁止（golden-guard で検出）。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { calculateTrueBearing, trueToMagneticDeg } from '../bearing';
import {
  initJapanMagneticVariationGrid,
  interpolateJapanMagneticVariationWestDeg,
} from '../japanMagneticVariation';

beforeAll(async () => {
  await initJapanMagneticVariationGrid();
});

type Tolerance = { abs: number };
type Pt = { id: string; lat: number; lon: number };
type Filled = { expected: number | null; source: string | null; tolerance?: Tolerance; knownFailing?: string };
type TbCase = Filled & { id: string; from: Pt; to: Pt };
type MvCase = Filled & { id: string; point: Pt };
type MbCase = Filled & { id: string; input: { trueDeg: number; variationDeg: number } };

type GoldenFile = {
  tolerancePolicy: Record<'trueBearing' | 'magneticVariation' | 'magneticBearing', Tolerance>;
  trueBearing: { cases: TbCase[] };
  magneticVariation: { cases: MvCase[] };
  magneticBearing: { cases: MbCase[] };
};

const golden = JSON.parse(
  readFileSync(resolve(process.cwd(), 'gungi/golden-tests/bearing_magvar.json'), 'utf8'),
) as GoldenFile;

/** 角度差を -180..180 に畳む（359.9° と 0.1° の差を 0.2° として扱う） */
function angleDiffDeg(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

function isFilled<T extends Filled>(c: T): c is T & { expected: number; source: string } {
  return typeof c.expected === 'number' && Number.isFinite(c.expected) && typeof c.source === 'string' && c.source.length > 0;
}

function tol(c: Filled, fallback: Tolerance): number {
  return (c.tolerance ?? fallback).abs;
}

describe('golden: trueBearing (calculateTrueBearing)', () => {
  for (const c of golden.trueBearing.cases) {
    const run = isFilled(c) ? it : it.skip;
    run(`${c.id} ${c.from.id}→${c.to.id}`, () => {
      const got = calculateTrueBearing(c.from.lat, c.from.lon, c.to.lat, c.to.lon);
      expect(got).toBeGreaterThanOrEqual(0);
      expect(got).toBeLessThan(360);
      const diff = Math.abs(angleDiffDeg(got, c.expected as number));
      expect(diff, `got=${got} expected=${c.expected} source=${c.source}`).toBeLessThanOrEqual(
        tol(c, golden.tolerancePolicy.trueBearing),
      );
    });
  }
});

describe('golden: magneticVariation (interpolateJapanMagneticVariationWestDeg)', () => {
  for (const c of golden.magneticVariation.cases) {
    if (!isFilled(c)) {
      it.skip(`${c.id} ${c.point.id}`, () => {});
      continue;
    }
    const title = `${c.id} ${c.point.id}`;
    const body = () => {
      const got = interpolateJapanMagneticVariationWestDeg(c.point.lat, c.point.lon);
      const diff = Math.abs(got - c.expected);
      expect(diff, `got=${got} expected=${c.expected} source=${c.source}`).toBeLessThanOrEqual(
        tol(c, golden.tolerancePolicy.magneticVariation),
      );
    };
    if (c.knownFailing) {
      it.fails(`${title} (known failing ${c.knownFailing})`, body);
    } else {
      it(title, body);
    }
  }
});

describe('golden: magneticBearing (trueToMagneticDeg)', () => {
  for (const c of golden.magneticBearing.cases) {
    const run = isFilled(c) ? it : it.skip;
    run(`${c.id} true=${c.input.trueDeg} var=${c.input.variationDeg}`, () => {
      const got = trueToMagneticDeg(c.input.trueDeg, c.input.variationDeg);
      expect(got).toBeGreaterThanOrEqual(0);
      expect(got).toBeLessThan(360);
      const diff = Math.abs(angleDiffDeg(got, c.expected as number));
      expect(diff).toBeLessThanOrEqual(tol(c, golden.tolerancePolicy.magneticBearing));
    });
  }
});

describe('golden: 記入状況', () => {
  it('JSON の構造が読める', () => {
    expect(golden.trueBearing.cases.length).toBeGreaterThan(0);
    expect(golden.magneticVariation.cases.length).toBeGreaterThan(0);
  });
});
