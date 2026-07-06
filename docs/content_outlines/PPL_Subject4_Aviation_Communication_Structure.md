# Subject 4 航空通信 — PPL 記事の全体像と CPL との対応（構造案）

**用途**: CPL シリーズ `3.5.1`〜`3.5.5` を土台に、**PPL 学科（Master Syllabus Subject 4）**向け記事ツリーを設計するときのブリーフ。正本チェックリストは **[PPL_Master_Syllabus.md](../PPL_Master_Syllabus.md)** §4。コンテンツ原則は **[00 §4](../00_Flight_Academy_Strategy.md)**（**通信手順・用語の更新は原則 PPL 側を正本**）。

**Gemini 執筆の入口**: [PPL_Navigation_Communication_2026/README.md](PPL_Navigation_Communication_2026/README.md)（Phase 1 ブロック索引）。

---

## 1. 結論ファースト（どう割るべきか）

| 視点 | 推奨 |
|------|------|
| **1 CPL 記事 ↔ 1 PPL 記事** | **採らない**。CPL `3.5.x` は **5 本**（KPI 3 + Phase 2 の 3.5.4/5）。PPL Phase 1 は **8 記事**（8 論点と 1:1）。 |
| **正本になるツリー** | **PPL は Master の 4-1〜4-3**。CPL は **試験特化・フレーズロジー厚め**。PPL＝手順の型と安全原則、CPL＝深掘り + PPL リンク。 |
| **読み順** | **業務・SAR → 用語・復唱 → タワー・計画 → 故障・緊急**。Subject 3 のフライトプラン（3-1-5）と **4-2-4 で相互リンク**。 |
| **安全上の注意** | 緊急通信・Mayday は**フィクション比喩可**だが、手順の誤りは不可。末尾 `Callout` で「実運航は最新 AIP/管制指示を正」と明記。 |

---

## 2. CPL 5 本の「役割」サマリ

| CPL ID | メタ上の軸（要約） | PPL Phase 1 の受け皿 | `meta.order`（CPL 通信） |
|--------|-------------------|----------------------|--------------------------|
| [3.5.1](../../src/content/lessons/3.5.1_AirTrafficServices.mdx) | ATS 概論 | **4-1-1** | 1 |
| [3.5.2](../../src/content/lessons/3.5.2_AeronauticalInformation.mdx) | 航空情報・AIP | **Phase 2**（4-1-3 案） | 2 |
| [3.5.3](../../src/content/lessons/3.5.3_RadioCommunication.mdx) | 無線手順・復唱 | **4-2-1**〜**4-2-3** | 3 |
| [3.5.4](../../src/content/lessons/3.5.4_EmergencyProcedures.mdx) | 緊急・故障 | **4-3-1**、**4-3-2** | 4 |
| [3.5.5](../../src/content/lessons/3.5.5_ATCPhraseology.mdx) | 管制用語 | **4-2-1**（用語節） | 5 |

---

## 3. Master Syllabus Subject 4（20 トピック）→ **Phase 1 記事 8 本**

| 記事 # | 推奨 stem | `order` | 07 で束ねるトピック | 主な DB クラスタ（PPL/CPL プール） | 主な張る CPL |
|--------|-----------|---------|---------------------|-----------------------------------|--------------|
| 1 | `PPL-4-1-1_AirTrafficServicesOverview.mdx` | **401** | 管制・情報・警急の概要 | 航空交通業務(52)、概論/航空交通業務(23) | 3.5.1 |
| 2 | `PPL-4-1-2_SearchAndRescueBasics.mdx` | **402** | SAR、121.5、救難信号 | 捜索救難業務(22)、救難信号(6)、緊急機(20) | 3.5.1, 3.5.4 |
| 3 | `PPL-4-2-1_RadioPhraseologyBasics.mdx` | **403** | アルファベット、数字、標準用語 | 管制業務一般/電話通信(41) | 3.5.5, 3.5.3 |
| 4 | `PPL-4-2-2_ClearanceReadbackBasics.mdx` | **404** | クリアランス、復唱 | 飛行場管制/管制許可等(4)、通則(5) | 3.5.3 |
| 5 | `PPL-4-2-3_AerodromeControlBasics.mdx` | **405** | タワー、離着陸、地上滑走 | 地上滑走(5)、到着機(2)、可視信号(15) | 3.5.3 |
| 6 | `PPL-4-2-4_FlightPlanFilingBasics.mdx` | **406** | ファイル、変更、クローズ | 飛行計画/記入(18)、通報(4) | 3.5.2, 3.4.4 |
| 7 | `PPL-4-3-1_CommFailureAndLightSignals.mdx` | **407** | 無線故障、ライトガン、三角形 | 可視信号(15) | 3.5.4 |
| 8 | `PPL-4-3-2_MaydayPanPanBasics.mdx` | **408** | Mayday、Pan-Pan | 緊急機に対する管制(3)、救難手続(9) | 3.5.4 |

**`order_index` 運用**: **`4xx` = Subject 4**。`register_ppl_article.mjs` に `PPL-4-*` → **航空通信** を執筆時に追加。

---

## 4. Phase 2 / Phase 3（記事候補）

| 07 Phase | 代表トピック | 推奨 stem（案） |
|----------|--------------|-----------------|
| **Phase 2** | FIR | `PPL-4-1-3_FlightInformationRegionBasics.mdx`（409） |
| **Phase 2** | レーダー管制 Ident/Vector | `PPL-4-2-5_RadarControlBasics.mdx`（410） |
| **Phase 2** | AIP、NOTAM（通信側） | `PPL-4-1-4_AipNotamIntro.mdx`（411） — Subject 3 `3-3-3` と統合検討可 |
| **Phase 3** | 残論点 | MCP 分布で再優先 |

---

## 5. 執筆・Gemini 委譲ルール

1. **ブリーフ正本**: [External_LLM_Article_Brief.md](../templates/External_LLM_Article_Brief.md) — YAML 禁止、Markdown 本文のみ。
2. **英語フレーズ**: ICAO 標準に近い表記。試験用の**読み方表**（Alpha, Bravo…）を 1 表で。
3. **ダブルトランスミッション**: CPL 3.5.3 と同趣旨 — PPL では**原理を短く**、詳細例文は CPL 扉へ。
4. **DB**: 公開時 [learning-contents-registration Skill](../../.cursor/skills/learning-contents-registration/SKILL.md)。`learning_test_mapping` は `applicable_exams @> PPL` のクラスタから追補。

---

## 6. 推奨執筆順（Phase 1）

1. **`PPL-4-1-1`** — ATS の地図。以降すべての前提。
2. **`PPL-4-2-1`** — 用語は全記事から参照される。
3. **`PPL-4-2-2`** → **`PPL-4-2-3`** — 復唱→タワー実務。
4. **`PPL-4-2-4`** — Subject 3 `PPL-3-1-5` とリンク。
5. **`PPL-4-1-2`** — SAR（単独でも可だが、緊急前に位置づけるなら 4-3 の前）。
6. **`PPL-4-3-1`** → **`PPL-4-3-2`** — Phase 1 締め。

**Subject 3 との並行**: 航法 **3-1-5** と通信 **4-2-4** は同週執筆可。HP（3-3-2）と緊急通信（4-3-2）は**「判断力」**で相互リンク。

---

### 関連ドキュメント

- [PPL_Subject3_Aerial_Navigation_Structure.md](PPL_Subject3_Aerial_Navigation_Structure.md)
- [PPL_Master_Syllabus.md](../PPL_Master_Syllabus.md) §4

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-06 | 初版：CPL 3.5.x × Master §4 を 8 記事にマトリクス化 |
