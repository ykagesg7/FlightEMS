# PPL Subject 2 航空気象 — Gemini 執筆索引（2026-07〜）

**構造正本**: [PPL_Subject2_Aviation_Meteorology_Structure.md](../PPL_Subject2_Aviation_Meteorology_Structure.md)  
**共通ルール**: [External_LLM_Article_Brief.md](../../templates/External_LLM_Article_Brief.md)  
**ロードマップ**: [01 §2026年7月期](../../01_Current_Status_and_Roadmap.md)（Phase C 後半・C-6/C-7）

---

## 進め方（1 記事あたり）

1. 下表の **Gemini ブリーフ** を開き、§4 の依頼文をコピペ。
2. 出力は **Markdown 本文のみ**（メタ・YAML なし）。
3. リポジトリ側で `docs/templates/PPL_Article_Template.mdx` に沿い **`export const meta`** を付与 → `src/content/lessons/PPL-2-*.mdx` として保存。
4. [`learning-contents-registration`](../../../.cursor/skills/learning-contents-registration/SKILL.md) で `learning_contents` 登録（`sub_category`: **航空気象**）。
5. 対応 CPL に **PPL 復習 Callout** を追記（[構造案 §8](../PPL_Subject2_Aviation_Meteorology_Structure.md)）。

---

## ブロック A — 大気の物理（優先・執筆順）

| 順 | stem | ブリーフ | 状態 |
|----|------|----------|------|
| 1 | `PPL-2-1-1_AtmosphereAndIsaBasics` | [PPL-2-1-1_gemini_brief.md](PPL-2-1-1_gemini_brief.md) | **済（2026-06-24）** |
| 2 | `PPL-2-1-2_TemperatureLapseAndInversion` | [PPL-2-1-2_gemini_brief.md](PPL-2-1-2_gemini_brief.md) | **済（2026-06-24）** |
| 3 | `PPL-2-1-3_PressureAltimeterSettings` | [PPL-2-1-3_gemini_brief.md](PPL-2-1-3_gemini_brief.md) | **済（2026-06-25）** |
| 4 | `PPL-2-1-4_MoistureHumidityDewpoint` | [PPL-2-1-4_gemini_brief.md](PPL-2-1-4_gemini_brief.md) | **済（2026-06-27）** |
| 5 | `PPL-2-1-5_AtmosphericStabilityBasics` | （ブロック A 後半で起票） | — |
| 6 | `PPL-2-1-6_CloudTypesAndFormation` | （同上） | — |
| 7 | `PPL-2-1-7_FogTypesAndFormation` | （同上） | — |

**内部リンク**: `/articles/{ファイル stem}`（例: `/articles/PPL-2-1-1_AtmosphereAndIsaBasics`）。

**トーンサンプル（任意で Gemini に添付）**: [PPL-1-1-1_TemperatureBasics](../../src/content/lessons/PPL-1-1-1_TemperatureBasics.mdx) の「概要」〜「詳細解説」1 節分。

---

## ブロック B — 運動・障害・情報（ブロック A 後）

| 順 | stem | 備考 |
|----|------|------|
| 8 | `PPL-2-2-1_WindObservationBasics` | 3.3.7 扉 |
| 9 | `PPL-2-2-2_AirMassesAndFronts` | 3.3.3 |
| 10 | `PPL-2-2-3_PressureSystemsAndJapanWeather` | 3.3.3, 3.3.4 |
| 11 | `PPL-2-3-1_FlightWeatherHazardsBasics` | 3.3.9, 3.3.12 |
| 12 | `PPL-2-3-2_MetarTafAndWeatherReports` | アプリ `/weather` ツールへの言及可（仕様変更なし） |

ブロック B の個別 `*_gemini_brief.md` は **ブロック A の 4 本取り込み後**に起票する。

---

## 取り込みチェックリスト

- [ ] `meta.order` が [構造案 §3](../PPL_Subject2_Aviation_Meteorology_Structure.md) と一致
- [ ] `tags` に `PPL`, `学科試験`, `航空気象` を含む
- [ ] 関連 PPL/CPL への `/articles/...` リンクが stem 正本どおり
- [ ] `npm run build` 成功
- [ ] `learning_contents` 行（`category`: PPL, `sub_category`: 航空気象）
- [ ] [PPL_Master_Syllabus.md](../../PPL_Master_Syllabus.md) §2 の該当チェックを更新

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-06-27 | `PPL-2-1-4` 本文化・DB 登録（`order_index` 204） |
| 2026-06-25 | `PPL-2-1-2`・`PPL-2-1-3` 本文化・DB 登録（201〜203） |
| 2026-06-24 | 初版。ブロック A ブリーフ 4 本、執筆フロー、チェックリスト |
