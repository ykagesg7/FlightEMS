# ゴールデンテスト（正解値スイート）— FlightEMS

> 状態: **第1弾 `bearing_magvar.json` 記入済み（2026-10-03 JST、国土地理院公式ツール由来）。**  
> 正解値は上様（または出典のある公式資料）から提供されたものだけを入れる。エージェントが計算して埋めることは禁止（自分の実装で自分の答え合わせになるため）。

## 1. 目的
既存の単体テスト（`src/__tests__/**`）は「範囲内か」「大小関係」を確かめるものが多い（例: `navLogGolden.test.ts` は 470 < 距離 < 485）。ゴールデンテストは**出典つきの正解値と、決めた許容誤差で一致するか**を機械判定する。

## 2. 置き場所と実行
| もの | パス |
|---|---|
| 正解値 JSON | `gungi/golden-tests/<suite>.json`（第1弾: `bearing_magvar.json`、記入手順は `FILLING_GUIDE.md`） |
| 取得時の生データ | `gungi/golden-tests/evidence/`（参考。テストは JSON の expected のみ参照） |
| ランナー | `src/utils/__golden__/*.golden.test.ts`（vitest の include が `src/**` のため `src/` 配下に置き、JSON を `readFileSync` で読む） |
| 実行 | `npm run test:golden` |

`gungi/golden-tests/**` の変更は CI の `golden-guard` で `golden-change-approved` ラベル必須。

### 型チェックについて
`src/utils/__golden__/*.golden.test.ts` は `tsconfig.app.json` の `exclude`（`**/*.test.ts`）対象のため **`tsc -b` では型検査されない**。Vitest 実行時も型は検査されない。ランナーを変更するときは IDE / 手動で型を確認する。

## 3. JSON 形式
```json
{
  "suite": "trueBearing",
  "target": "src/utils/bearing.ts#calculateTrueBearing",
  "version": 1,
  "units": { "output": "deg (true, 0<=x<360)" },
  "defaultTolerance": { "abs": 1e-5 },
  "cases": [
    {
      "id": "TB-001",
      "description": "<例: RJFF→RJTT の真コース>",
      "input": { "lat1": "<PLACEHOLDER>", "lng1": "<PLACEHOLDER>", "lat2": "<PLACEHOLDER>", "lng2": "<PLACEHOLDER>" },
      "expected": "<PLACEHOLDER — 出典の値をそのまま>",
      "tolerance": { "abs": "<任意。省略時 defaultTolerance>" },
      "source": "<PLACEHOLDER — 出典（書名・頁、公式計算機の URL と取得日 JST 等）>",
      "addedBy": "<上様>",
      "addedAt": "<YYYY-MM-DD>"
    }
  ]
}
```

### 許容誤差の決め方
| 種類 | 比較 | 例 |
|---|---|---|
| 純粋関数の数値（度・nm・kt） | `abs`（既定 1e-5）または `rel` | 真コース、風三角形の偏流角・対地速度 |
| 表示用に丸めた値 | 丸め後の**完全一致**（`"tolerance": { "exact": true }`） | NavLog の ETE `"HH:MM"`、nm 小数1桁 |
| 教育用近似モデル | モデル自体の誤差に合わせて広めに設定し、`source` に「近似モデル」と明記 | `japanMagneticVariation`（IDW 補間、WMM の代替ではない） |
| 文字列・パース結果 | 完全一致 | DMS 変換、NOTAM 要約のフィールド |

既知のモデル欠陥は `knownFailing`（例 `"#66"`）を付け、ランナー側で `it.fails` にする。マーカーを外さずにテストが通るようになったら CI が Red になる（修正を Issue で追跡するため）。

金額・税（Decimal 完全一致）はこの陣には無い。Property Pal 陣で別途定義する。

## 4. 候補スイート（関数は実在、値は未記入）
| suite | 対象関数 | 備考 |
|---|---|---|
| `trueBearing` | `src/utils/bearing.ts` `calculateTrueBearing` | 大圏初期方位 |
| `magneticBearing` | `src/utils/bearing.ts` `trueToMagneticDeg` | 西偏を正・真+偏差＝磁 |
| `windTriangle` | `src/utils/windTriangle.ts` `solveWindTriangle` / `crosswindComponentKt` | |
| `offsetPoint` | `src/utils/offset.ts` `calculateOffsetPoint` | 磁方位・nm 入力 |
| `pressureAltitudeIsa` | `src/utils/pressureAltitudeIsa.ts` | ISA |
| `navLog` | `src/pages/planning/nav/computeNavLog.ts` | 既存 `navLogGolden.test.ts` の範囲アサーションを値に置換 |
| `chaseCamera` | `flightViewer3d/flightViewer3dMath.ts` `chaseCameraOffsetEnuMeters` | 3D はピクセルではなく数値で |
| `dms` | `src/utils/dms.ts` | 完全一致 |

旋回半径・CA/AA 幾何は**現時点で該当関数が見当たらない**。実装する Issue を立てるときに、同時に正解値を用意する。

## 5. 追加手順
1. 上様が正解値と出典を用意（Issue に貼るか、JSON を直接 PR）。
2. 侍大将が JSON 化し PR。PR に `golden-change-approved` を付けるのは上様のみ。
3. ランナーは JSON の `target` から関数を呼び、`tolerance` で判定。不一致時は `id` と差分を出す。

ラベル一覧（作成は上様）: [`../labels.md`](../labels.md)
