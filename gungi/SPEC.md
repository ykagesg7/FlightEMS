# 戦国軍議プロトコル v1.1 — FlightAcademy 陣（改訂案・ドラフト）

> 対象リポジトリ: `ykagesg7/FlightEMS`（public / default `main`）
> 本番: https://flight-lms.vercel.app（Vercel project `flight-lms`）
> 作成: 2026-10-03 JST ／ 状態: **ドラフト（リポジトリ未反映）**
> 決裁済み（2026-10-03 13:31 JST）: ① Work_Allocation.md / AGENTS.md に家老・斥候を追加（セットアップ PR で反映）② 通知先 `#fa-gungi`（`C0C79Q1CCRE`）、Secret `SLACK_GUNGI_WEBHOOK_URL` ③ 第1弾ゴールデン = 真方位・磁気偏差
> Gemini 版 v1.0 からの差分を、実リポジトリの現況に合わせて反映したもの。

---

## 0. 前提（実リポジトリ調査で判明した事実）

| 項目 | 実態 | v1.0 との差 |
|---|---|---|
| フレームワーク | **Vite 5 + React 18 + TypeScript(strict)**、Node 24.x、SPA + Vercel Serverless (`api/`) | v1.0/想定は Next.js → **誤り** |
| 3D | **Cesium**（`src/pages/planning/components/flight/flightViewer3d/`、`/explore/airspace-3d`） | v1.0 は Three.js/R3F・`@/utils/aeroCoords` → **存在しない** |
| テスト | Vitest 3（`src/__tests__/**`、約150ファイル / 約700件）、Playwright 1.52（`e2e/` 5本） | 既に充実。MSW は未導入 |
| 計算ロジック | `src/utils/{bearing,windTriangle,japanMagneticVariation,offset,pressureAltitudeIsa,flightTime,...}.ts`、`src/pages/planning/nav/computeNavLog.ts` ほか | 既存 |
| ゴールデン系 | `src/__tests__/planning/navLogGolden.test.ts` があるが**範囲アサーション**（例 470<距離<485）で正解値セットではない | 正解値データセットは未整備 |
| CI | `test.yml`（test:run + coverage）、`verify-build.yml`（lint + test:run + Cesium CDN pin + build）、週次テレメトリ系 5本 | **型チェック（`tsc -b`）と E2E は CI 未実行**。`test:run` が2重実行 |
| npm scripts | `lint` `test:run` `test:coverage` `test:e2e` `build` `check:cesium-cdn` あり | **`type-check` / `test:golden` なし** |
| エージェント規約 | `AGENTS.md`、`.cursor/rules/*.mdc` 8本（core-project 常時適用ほか）、`.cursor/agents/{verifier,aviation-safety-review,...}`、`.cursor/skills/*` 10本、`.cursor/hooks.json`（危険シェル拒否） | `.cursorrules` ではなく `.cursor/rules` 方式で既に整備済み |
| 実装担当の実績 | 直近の PR は **Cursor クラウドエージェント**（GitHub App `cursor`）が `cursor/<slug>-<id>` ブランチで作成 → ユーザーがマージ | 「侍大将＝クラウド Cursor」は既に稼働中 |
| ラベル / Issue テンプレ | GitHub 既定ラベルのみ。`.github/ISSUE_TEMPLATE` なし | 新設が必要 |
| Slack | 既存 `#fa-telemetry`（`C0BQ5R19QDV`）、Secrets `SLACK_WEBHOOK_URL` / `SLACK_BOT_TOKEN` は週次テレメトリで使用中 | Discord 不要 |
| 役割分担の正本 | `docs/ops/Work_Allocation.md`：**GrokBot は Inspector / Growth の2役のみ、「3本目を足さない」、コード・SQL・マージはしない** | 家老・斥候の追加は**この正本と衝突** → 改訂が必要 |
| データ | クイズ設問（verified 2,129問）・学習カタログは **Supabase** 上。法令条文に絡む設問修正は SQL 作業 | CI では検証できない領域がある |
| ブランチ保護 | API で確認できず（要確認）。マージは手動 | 必須チェック設定が必要 |

---

## 1. 陣形（役割と指揮系統）

```
上様（しゃどー）── Slack 通知 → Vercel Preview / PR 差分を確認 → マージ（＝本番デプロイ）
   ▲
   │ 決裁依頼・急報（Slack）
家老 Grok Bot（box 常駐・定期巡回）
   │ ① Issue 起票（テンプレ準拠）  ② Cursor クラウドエージェント起動
   │ ③ CI 結果監視・三振カウント     ④ 戦況の要約（オンデマンド）
   ▼
侍大将 Cursor クラウドエージェント ── cursor/<slug> ブランチ → Draft PR
   ▼
目付 GitHub Actions `mekiki-ci` ── 型・lint・unit・golden・build（必須）、E2E（当面任意）
斥候 Grok Bot ── 法令・通達の定期巡回 → 差分があれば家老へ（Issue 化）
```

| 役職 | 実体 | やる | やらない |
|---|---|---|---|
| 上様 | しゃどー | PR マージ、`status:stalled` への介入、ゴールデン値の承認、本番 SQL の承認 | 伝令（コピペ中継） |
| 家老 | Grok Bot | Issue 起票、Cursor 起動、CI 監視、三振管理、Slack 報告、戦況要約 | コード・SQL・MDX 本文の作成、マージ、安全・法規の最終判断 |
| 斥候 | Grok Bot | 法令・通達の巡回と差分検知、スナップショット保存 | ライブ NOTAM の巡回（アプリ側に SWIM 連携あり） |
| 侍大将 | Cursor クラウドエージェント | 実装・テスト追加・Draft PR、CI 赤の修正 | main へのマージ、ゴールデン期待値の書き換え、本番 SQL の実行 |
| 目付 | GitHub Actions | 機械的な合否判定 | LLM による主観判定 |
| （任意）検分補佐 | 既存 Inspector（本番観測）、`.cursor/agents/aviation-safety-review` | マージ後の本番観測、航空安全の隔離レビュー | — |

> ✅ `docs/ops/Work_Allocation.md` / `AGENTS.md` の改訂は決裁済み。差分案: `proposed/docs/ops/Work_Allocation.md.diff`、`proposed/AGENTS.md.diff`。

---

## 2. タスクのライフサイクル（ラベル状態機械）

```
[起票] gungi-task + status:ready
   │  家老が Cursor クラウドエージェントを起動（Issue 本文をプロンプトに渡す）
   ▼
status:in-progress ──(Draft PR 作成、PR 本文に "Closes #N")
   │
   ├─ mekiki-ci Green ──▶ status:review ──▶ Slack「決裁待ち」+ Preview URL ──▶ 上様マージ ──▶ close
   │
   └─ mekiki-ci Red
        ├ strike なし → strike:1 付与、失敗ログ要約を添えて Cursor に修正依頼
        ├ strike:1   → strike:2 に置換、再依頼
        └ strike:2   → 停止。status:stalled 付与、Slack 急報（失敗ジョブ URL・要約）
```

- **カウント対象は「エージェントの修正後の CI 失敗」のみ**。Playwright 内部の retries（CI では2）や再実行は数えない。
- 三振の数え先は **Issue のラベル**（PR が作り直されても継続するため）。
- `status:stalled` 中は家老は一切自動再依頼しない。上様が `status:ready` に戻したら strike をリセットして再開。
- 家老が GitHub イベントを受け取る手段: Webhook 受信口がないため **定期ポーリング**（例: 15〜30分ごとに `gungi-task` の Issue/PR とチェック結果を確認）。代替として Cursor の GitHub 連携（PR/Issue への `@cursor` コメントで追作業）を使える場合はそれを修正依頼経路にする（要動作確認）。

---

## 3. 五大防壁（改訂）

### ① Issue / PR 駆動
- テンプレ: `.github/ISSUE_TEMPLATE/gungi-task.md`。**1 Issue = 1 責務**、受入条件はコマンドで書く。
- 侍大将の PR は既存運用どおり Draft で作成、英語 Conventional Commits（`git-commit-en` Skill）、`Closes #N` 必須。
- 「触るな」リストは `docs/Closed_Sprints.md` §2 から該当行を Issue に転記する。

### ② 目付の厳格化
- **必須チェック**（`mekiki-ci` の `inspect` ジョブ）: `tsc -b` → `lint` → `test:run` → `test:golden` → `check:cesium-cdn` → `build`。
- **ゴールデンテスト**: 第1弾は `gungi/golden-tests/bearing_magvar.json` + `src/utils/__golden__/bearingMagvar.golden.test.ts`（null は skip）。航空計算は**許容誤差つき一致**（項目ごとに `tolerance` を JSON に持つ。既定 ε=1e-5 は「純粋関数の数値」に限る。nm・度・分など表示丸め値は表示単位で完全一致）。金額・税計算はこの陣には無い（Property Pal 陣で完全一致方式）。
- **ゴールデン期待値の改ざん防止**: `gungi/golden-tests/**` を変更する PR は `golden-change-approved` ラベル（上様のみ付与）がない限り CI 失敗（`golden-guard` ジョブ）。
- **3D**: Cesium Canvas のピクセル差分は**採用しない**（GPU/タイル依存で不安定）。代わりに `flightViewer3dMath` / `flightViewer3dChaseCamera` / `airspace3dUtils` の数値テスト（既存）を拡充。
- **E2E**: Playwright は当面**任意ジョブ**（必須にしない）。Supabase 依存・外部タイル依存の切り分けが済んでから必須化。

### ③ 三振法度
- §2 のとおり。加えて **1 Issue あたりの Cursor 起動上限 = 3 回**、**同時進行 = 2 Issue まで**（コストと PR 競合の抑制）。

### ④ 外部 API 遮断
- Vitest は既に `VITE_SUPABASE_URL=https://test.supabase.co` のダミーで動く。CI に本番秘密は渡さない（現状どおり）。
- MSW の新規導入は**必須にしない**。外部 I/O（SWIM NOTAM / Open-Meteo / OpenSky / GSI DEM）は既存の「Core 関数を純粋化して単体テスト」方式（`api/_lib/*Core.ts`）を踏襲し、フィクスチャは `src/__tests__/**/fixtures/` に置く。
- 斥候のスナップショットはリポジトリではなく **box**（`/workspace/gungi/flightacademy/scout/`）に保存（コミット増・CI 誤発火を避ける）。

### ⑤ モバイル本陣
- Slack 通知先: `#fa-gungi`（チャンネル ID `C0C79Q1CCRE`、`#fa-telemetry` とは分ける）。CI からは Secret `SLACK_GUNGI_WEBHOOK_URL`（この Webhook は `#fa-gungi` 向けに発行）で投稿、未設定ならスキップ。家老の報告も同チャンネル。
- 決裁は PR の Vercel Preview URL で確認 → GitHub モバイルでマージ。Preview は Vercel の保護（SSO）下なので、スマホで Vercel にログインしておく。
- **main のブランチ保護**（上様が設定）: PR 必須、必須チェック `mekiki-ci / inspect`、`golden-guard`、force-push 禁止。

---

## 4. 戦況板
- `gungi/dashboard.md` は**作らない**。
- 正本は GitHub の Issue/PR ラベル。上様が「戦況」と聞いたら家老がその場で集計して返す。
- 常設ビューが欲しければ GitHub Projects（ボード）を 1 枚作り、`gungi-task` を自動追加（任意）。

---

## 5. 斥候の巡回対象（1日1回、差分時のみ起票）

| 対象 | 取得方法 | アプリへの影響例 |
|---|---|---|
| 航空法・航空法施行規則の改正 | e-Gov 法令（API / 改正履歴） | 法規レッスン MDX（`src/content/lessons/3.1.x_AviationLegal*`）、法規設問（Supabase） |
| 国交省 航空局の通達・サーキュラー・AIC | 公開ページの差分 | 運航・空域関連の記事、設問 |
| 磁気偏差の基準改訂（WMM 等） | 公開値 | `src/utils/japanMagneticVariation.ts` の局点データ |
| 空域区分・AIP の構造変更（必要時） | 公開ページ | 空域レイヤー・3D 空域 |

- ライブ NOTAM は巡回しない（アプリ側の SWIM 連携が担当）。
- 斥候は**条文の解釈をしない**。差分の原文・URL・取得日時のみを Issue に載せ、`needs-source` を付ける。設問・本文への反映は侍大将 + `aviation-safety-review`、最終判断は上様。

---

## 6. 導入ステップ（提案順）

1. ~~上様: 決裁事項の回答~~（済）
2. 上様: ラベル作成（`labels.md`）、`#fa-gungi` 向け Incoming Webhook を発行し Secret `SLACK_GUNGI_WEBHOOK_URL` に登録（チャンネルは作成済み）。
3. 侍大将（Issue 経由）: `package.json` に `type-check` / `test:golden` を追加、`mekiki-ci.yml`・Issue テンプレ・`aviation.mdc`・ゴールデン README を投入、`Work_Allocation.md` / `AGENTS.md` を docs-sync。既存 `test.yml` / `verify-build.yml` の重複整理は別 Issue。
4. 上様: 第1弾 `bearing_magvar.json`（真方位8・磁気偏差7・磁方位換算2）を `FILLING_GUIDE.md` に沿って記入 → `golden-change-approved` で投入。`test:golden` = `vitest run src/utils/__golden__`。
5. 上様: main ブランチ保護で必須チェック設定。
6. 試験運用: 小さな Issue 1件で一巡（起票→実装→CI→通知→マージ）。三振経路はわざと失敗する Issue で確認。

---

## 7. 第1弾ゴールデン（真方位・磁気偏差）で判明した事実
- `calculateTrueBearing` は**球面**大圏の初期方位。国土地理院（GRS80 楕円体）との差は国内で最大約0.15° → 許容誤差 0.2°（楕円体化すれば 0.001°）。
- `interpolateJapanMagneticVariationWestDeg` は**空港10局点の逆距離二乗加重**（各局点値は「2025年頃の概数」、0.1°単位、出典は NOAA / 国土地理院に近い値という注記のみ）。国土地理院の近似式・エポックは使っていない。年変化の補正なし。
- 符号は一貫して**西偏が正**、`磁方位 = 真方位 + 西偏`（`offset.ts` は逆算 `真 = 磁 − 西偏`）。
- 参考試算（ゴールデン値ではない）: 国土地理院 2020.0 の二次近似式と比べると、内挿域で ±0.2〜0.5°、稚内で約 −1.2°、新石垣で約 +2.0°、八丈島で約 +1.0° の差。外挿域では現行モデルが不合格になる見込み。
- `FlightPlanRouteLayer` / `MapTabContent` / `WaypointAddPanel` / `cursorNavaidUtils` の `calculateMagneticBearing` は**偏差を渡さず既定の 8°W 固定**を使い、NavLog（`computeNavLog`）だけが補間値を使う → 画面によって磁方位が最大 1〜2° 食い違い得る。
- テストファイルは `tsconfig.app.json` の exclude 対象のため `tsc -b` で型検査されない（vitest は型を見ない）。

### 7.1 記入結果（2026-10-03 JST、国土地理院の公式ツールから取得）
- 真方位 8/8 合格（現行球面公式との差 −0.14〜+0.005°。GeographicLib との照合差は全件 0.005″ 未満）。
- 磁気偏差 4/7 合格。不合格: MV-03 小松（差 −0.59°、許容 0.5）、MV-05 稚内（−1.57°、許容 1.0）、MV-06 新石垣（+1.04°、許容 1.0）。
- 磁方位換算 2/2 合格。
- 取得時の生データ: `evidence/`。
