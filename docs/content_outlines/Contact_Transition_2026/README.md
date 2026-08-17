# CP — 執筆正本（Season 1–5）

**読者**: 空自 T-4 学生（Joe / 博多弁 / 道真）。副次: シミュレータ。サイト全体を軍事化しない。公式教程の代替ではない。  
**呼称**: 公開面は **CP**（空自）。USAF 教範の章名 Contact は出典参照に残す。  
**位置**: 読む順は **CP → FMT**（単機の飛行Envelopeのあと編隊）。FMT Season 2（BFM 幾何）はそのさらに後。  
**既存公開**: なし。**W34 ドリップ**: 1-1 月 8/17、1-2 水 8/19、1-3 金 8/21。Season 1 の 3 本は MDX 済。`is_published` は cron が schedule の日付で反転。  
**共通ルール**: [External_LLM_Article_Brief.md](../../templates/External_LLM_Article_Brief.md)  
**MDX 規則**: [`.cursor/rules/mdx-article-guide.mdc`](../../../.cursor/rules/mdx-article-guide.mdc)  
**登録**: Skill [`learning-contents-registration`](../../../.cursor/skills/learning-contents-registration/SKILL.md) — `category`: **操縦**、`sub_category`: **曲技飛行**、`series`: **USAF-Contact-Phase**  
**公開**: [articlePublishSchedule.ts](../../../api/_lib/articlePublishSchedule.ts)  
**一次ソース**: T-38 Flying Fundamentals **Ch5 Contact**（Obsidian `T38-Flying-Fundamentals.ja/Ch05*`）。採点は Vol.2 Table 3.1。briefing 契約は Vol.3 Att 6 を S1-1 に折り込む。

---

## 分割規則（MECE）

1. Season は Fund **5A / 5B / 5C / 5D / 5E** に一致させる。
2. 節 **5.1–5.41** は「1 話が所有する / 他話へ折り込む / シリーズ外」のどれか一つ。
3. 横断知識（エネルギー、unload）は最初に所有した Season が公理を持ち、後続はリンクするだけ。
4. 1 話 = 公理 1・サイトピクチャ 1。例外は **S5-6** のみ（教程が loop の前後半と定義）。
5. 書く順は **S1 → S2 → S3 → S4 → S5**。S5 を S4 より先に書かない。

Heat-to-Guns、CAS 9-Line、FMT の HCA / CZ は載せない。Pitchback / Sliceback の **mechanics は S2-6**、戦術用法は FMT Season 2。

---

## 進め方（1 話あたり）

FMT と同じ。Gemini は Markdown 本文のみ。YAML 禁止。レビュー通過後だけ MDX。ストック登録。**全話を一括起票しない。**

**Season 1（1-1〜1-3）は MDX 済（W34 月水金）。** 次のブリーフは Season 2-1（Deep stall / Fund 5.7–5.8）。求められたときだけ起票。

---

## 1 話の型

- 公理 1 つ
- サイトピクチャ 1 つ
- **不合格要件**を日本語で 1 つ（読者は原本を見ない。本文・見出し・口頭試問・excerpt に **Area / Fund / Att / Vol.2 のカタログ番号を出すな**。番号は本 README の所有者表だけ）
- Joe の口頭クイズ 1 つ
- T-4 に AB はない
- 数字は本 README「許可数字」と当該ブリーフに書いたものだけ
- T-38 の EGT / canopy bow / shark fin / green donut / CSW・CDI を T-4 の正解にしない（読み替え。CDW/CDB は使わない）
- 太字は `「**…**」`（カギ括弧の内側）
- 詳細解説の `###` は PREP（P / R / E / 締めの P）
- 口頭試問の話者は **学生：** / **学生（白目）：**（`学生（あんさん）` も `お前（学生）` も使わない。ジョー台詞内の「お前」は二人称として残す）
- 道真の語尾はひらがな **ばい**（`バイ！` は使わない）
- 飛行包線・エンベロープ・envelope は **飛行Envelope** に統一
- 呼称は **教官ジョー**（`教官ジョー（凄腕パイロット）` は使わない）

---

## Season 1（3 話）— 学校の契約（5A）

| # | stem | slug | order | 主題 | 所有 | Vol.2 | 状態 |
|---|------|------|-------|------|------|-------|------|
| 1-1 | `CP-1-1_AreaAndPurpose` | `cp-1-1-area-and-purpose` | 1 | CP の目的 / エリア維持 | **5.1–5.2**。Att 6 の空域契約を折込 | Att 6 / **16**（33 は出さない） | **W34 月 8/17** |
| 1-2 | `CP-1-2_Energy` | `cp-1-2-energy` | 2 | エネルギー管理 | **5.3**（50 kt / 1,000 ft の唯一の所有者） | **32** の erratic（33 は出さない） | **W34 水 8/19** |
| 1-3 | `CP-1-3_ControlsGPio` | `cp-1-3-controls-g-pio` | 3 | 操縦面 / PIO / G-awareness | **5.4–5.6** | **32** の smooth | **W34 金 8/21** |

`order_index`: **611–613**。

---

## Season 2（6 話）— 機体を感じる（5B・clean）

精密図形ではない。feel の実験。configured は S3 へ渡す。

| # | stem | slug | order | 主題 | 所有 |
|---|------|------|-------|------|------|
| 2-1 | `CP-2-1_DeepStall` | `cp-2-1-deep-stall` | 1 | Deep stall | **5.7–5.8** |
| 2-2 | `CP-2-2_AcceleratedStall` | `cp-2-2-accelerated-stall` | 2 | Accelerated stall | **5.14** |
| 2-3 | `CP-2-3_RollAuthority` | `cp-2-3-roll-authority` | 3 | Rudder / aileron / reversal | **5.10, 5.12, 5.15** |
| 2-4 | `CP-2-4_Unload` | `cp-2-4-unload` | 4 | Acceleration / stab demo | **5.13, 5.18** |
| 2-5 | `CP-2-5_TrimFailure` | `cp-2-5-trim-failure` | 5 | Simulated trim failure | **5.9** |
| 2-6 | `CP-2-6_PitchbackSliceback` | `cp-2-6-pitchback-sliceback` | 6 | Pitchback / Sliceback（handling） | **5.16–5.17**。Immelmann / Split-S ではない |

`order_index`: **614–619**。

---

## Season 3（2 話）— パターンで死なない（configured + 5C）

5.1 が traffic pattern を Contact に含めている。フレア手順（Ch4）は触らない。

| # | stem | slug | order | 主題 | 所有 | Vol.2 |
|---|------|------|-------|------|------|-------|
| 3-1 | `CP-3-1_ConfiguredHandling` | `cp-3-1-configured-handling` | 1 | Configured rudder / slow flight | **5.11, 5.20–5.21** | **32** Slow flight −3 / +5 |
| 3-2 | `CP-3-2_PatternATS` | `cp-3-2-pattern-ats` | 2 | Pattern approach-to-stall | **5.22–5.25** | **29** |

`order_index`: **620–621**。

---

## Season 4（2 話）— 戻す（5D）

S2-4 の unload はここでは適用だけ。計器の Area **47a** は混ぜない。

| # | stem | slug | order | 主題 | 所有 | Vol.2 |
|---|------|------|-------|------|------|-------|
| 4-1 | `CP-4-1_NoseHigh` | `cp-4-1-nose-high` | 1 | Nose-high recovery | **5.26–5.27** | **31** |
| 4-2 | `CP-4-2_NoseLow` | `cp-4-2-nose-low` | 2 | Nose-low recovery | **5.28** | **30** |

`order_index`: **622–623**。

---

## Season 5（9 話）— 定義された図形（5E）

並びは教程どおり。採点は全図形 **Area 33**。

| # | stem | slug | order | 主題 | 所有 |
|---|------|------|-------|------|------|
| 5-1 | `CP-5-1_AerobaticContract` | `cp-5-1-aerobatic-contract` | 1 | 曲技の契約・表 5.1/5.2 | **5.29–5.32**（5.3 を再講義しない） |
| 5-2 | `CP-5-2_AileronRoll` | `cp-5-2-aileron-roll` | 2 | Aileron roll | **5.33** |
| 5-3 | `CP-5-3_LazyEight` | `cp-5-3-lazy-eight` | 3 | Lazy Eight | **5.34** |
| 5-4 | `CP-5-4_BarrelRoll` | `cp-5-4-barrel-roll` | 4 | Barrel roll | **5.35** |
| 5-5 | `CP-5-5_Loop` | `cp-5-5-loop` | 5 | Loop | **5.36** |
| 5-6 | `CP-5-6_SplitSImmelmann` | `cp-5-6-split-s-immelmann` | 6 | Split-S / Immelmann | **5.37–5.38** |
| 5-7 | `CP-5-7_CubanEight` | `cp-5-7-cuban-eight` | 7 | Cuban Eight | **5.39** |
| 5-8 | `CP-5-8_Cloverleaf` | `cp-5-8-cloverleaf` | 8 | Cloverleaf | **5.40** |
| 5-9 | `CP-5-9_Chandelle` | `cp-5-9-chandelle` | 9 | Chandelle | **5.41** |

`order_index`: **624–632**。

---

## 所有者表（5.1–5.41）

| 節 | 内容 | 所有者 |
|----|------|--------|
| 5.1–5.2 | 目的 / エリア維持 | **S1-1** |
| 5.3 | エネルギー | **S1-2** |
| 5.4–5.6 | 操縦面 / PIO / G | **S1-3** |
| 5.7–5.8 | Handling 一般 / deep stall | **S2-1** |
| 5.9 | Trim failure | **S2-5** |
| 5.10, 5.12, 5.15 | Rudder clean / aileron / reversal | **S2-3** |
| 5.11 | Rudder configured | **S3-1** |
| 5.13, 5.18 | Acceleration / stab demo | **S2-4** |
| 5.14 | Accelerated stall | **S2-2** |
| 5.16–5.17 | Pitchback / Sliceback | **S2-6** |
| 5.19 | Supersonic | **対象外**（T-4 に超音速も AB もない。記事にしない） |
| 5.20–5.21 | Slow flight | **S3-1** |
| 5.22–5.25 | Pattern ATS | **S3-2** |
| 5.26–5.27 | Nose-high | **S4-1** |
| 5.28 | Nose-low | **S4-2** |
| 5.29–5.32 | 曲技契約 | **S5-1** |
| 5.33–5.41 | 各図形 | **S5-2〜S5-9**（上表） |

**シリーズに入れない隣接物**

| 題材 | 置き場 |
|------|--------|
| Ch4 着陸・フレア | 着陸シリーズ。S3-2 からリンク可 |
| Vol.2 Area 29–33, 47a, 48 | 採点オーバーレイ。各話の不合格箱だけ |
| Vol.3 Att 6 briefing | **S1-1** の短い契約 |
| FMT Season 2 | Pitchback/Sliceback の **戦術用法**だけ |

---

## 許可数字（原本突合済みのみ）

数字を記事に書くときは、当該話のブリーフに再掲したものだけ。ここに無い値は書かない。BFM の Assessment Window / 6K / 3K は出さない。本文に書くときは **T-38 枠** と明記。EGT を T-4 の正解にしない。

### Season 1

| 項目 | 値 | 出典 | 話 |
|------|-----|------|----|
| Center Radial vs Pie-in-the-Sky | 狭いエリア **20 radials 以下** / 広い **20 radials 以上** | Fund 5.2 | 1-1 |
| 高度↔速度の目安 | **1,000 ft ≈ 50 kt** | Fund 5.3.2 | 1-2 |
| working の目安 | 作業空域の中間高度で **300 KIAS** ならほぼ全機動可（T-38） | Fund 5.3.3 | 1-2 |
| Speed brake | **250 KIAS 以下** 効果 minimal。超えると extend で slight pitch up | Fund 5.4 | 1-3 |
| G-awareness | **MIL、420–450 KIAS**。最低 **90° @ 4 G**、**180° @ 5 G**。T-4 の合格 G にしない | Fund 5.6 | 1-3 |
| Vol.2 | S1-3 の主は **32 Aircraft Handling**（erratic / control 一時喪失） | Vol.2 Table 3.1 | 1-3 |

### Season 5（表 5.1 / 5.2。各話ブリーフでのみ再掲）

| Maneuver | Proficiency | 空域（表 5.2） | 話 |
|----------|-------------|---------------|----|
| Aileron roll | 任意速度 / pitch | — | 5-2 |
| Lazy Eight | **350 KIAS / 95% rpm** | 前方 2 nm、turn 方向 6 nm、上方 4–6 kft | 5-3 |
| Barrel Roll | **400 KIAS / 95% rpm** | 前方 3 nm、上方 4–8 kft | 5-4 |
| Loop | **500 KIAS / MIL** | 前方 1–2 nm、上方 8–10 kft | 5-5 |
| Split-S | **200 KIAS / MIL** | 前方 1 nm、後方 1 nm、下方 7–10 kft | 5-6 |
| Immelmann | **500 KIAS / MIL** | 前方 1 nm、上方 8–10 kft | 5-6 |
| Cuban Eight | **500 KIAS / MIL** | 前方 1 nm、後方 2 nm、上方 8–10 kft | 5-7 |
| Cloverleaf | **450 KIAS / MIL** | 前方 3 nm、第1 turn 方向 2 nm、反対 3 nm、上方 8–10 kft | 5-8 |
| Chandelle | **400 KIAS / 95% rpm** | 前方 1 nm、turn 方向 1 nm、上方 6–7 kft | 5-9 |

垂直面の計画 **≥10,000 ft**、descent からのリード **10° nose-low ごとに 10 kt および/または 500 ft** は **S5-1**（Fund 5.31–5.32）。S1-2 で先出ししない。

Loop の pull **4.5–5 G**、over-the-top **150 KIAS** 超、Chandelle 終了 **≈200 KIAS / ≈180°** は当該話のブリーフでのみ再掲。

S2–S4 の T-38 数字（stall IAS、G、configured AOA 等）は各話ブリーフ起票時に本表へ足す。先に発明しない。

---

## 禁止

- YAML フロントマター
- ブリーフに無い数字の発明（とくに T-4 の「正しい KIAS / G」）
- T-4 にアフターバーナーがある記述。MAX AB を T-4 の正解にする
- T-38 の EGT / canopy bow / green donut を T-4 の正解にする
- Area 名の新造（シャンデル専用 Area など）
- Heat-to-Guns、CAS 9-Line、FMT Season 2 の HCA / CZ
- Pitchback を Immelmann、Sliceback を Split-S として教える
- 5.19 超音速を T-4 の課目にする
- 「これでトランジション合格」
- 全 22 本の Gemini ブリーフを一度に書くこと
- S5 を S4 より先に書くこと

---

## トーン

FMT と同じ。テキサスのカントリー・バー。道真 + 教官ジョー。博多弁。内部リンクは `/articles/{slug}`。

---

## 登録メモ

| 項目 | 値 |
|------|-----|
| `learning_contents.id` | stem と同じ（`CP-1-1_AreaAndPurpose`。旧 `CTX-*` は使わない） |
| `category` | 操縦 |
| `sub_category` | 曲技飛行（シリーズ統一。Season で割らない） |
| `content_type` | text |
| `is_published` | **ストックは `false`** |
| `order_index` | 1-1 = **611**、以降連番（FMT 610 の次）。最終 5-9 = **632** |
| `meta.series` | `USAF-Contact-Phase` |
| `meta.order` | Season 内 1–N（S1 は 1–3、S5 は 1–9） |
| 詳細解説 | **PREP**（`P（Point）` / `R（Reason）` / `E（Example）` / 締めの `P（Point）`）。FMT と同じ |
| `category` | 操縦 |
| `sub_category` | 曲技飛行（シリーズ統一。Season で割らない） |
| `content_type` | text |
| `is_published` | **ストックは `false`** |
| `order_index` | 1-1 = **611**、以降連番（FMT 610 の次）。最終 5-9 = **632** |
| `meta.series` | `USAF-Contact-Phase` |
| `meta.order` | Season 内 1–N（S1 は 1–3、S5 は 1–9） |

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-08-16 | 初版。FMT Season 2 の前に Contact 8 話。 |
| 2026-08-16 | **5 Season / 22 話**に改定。Fund Ch5 の 5A–5E を MECE 所有者に。1-1 は Area / Purpose（5.1–5.2）。 |
| 2026-08-16 | 読む順を **Contact → FMT** に変更。`CP-1-1` ストック登録（`order_index` 611）。1-1 ブリーフ削除。 |
| 2026-08-16 | W34 を Contact 1-1〜1-3 に差し替え（FMT ドリップ取消）。1-2 ブリーフ起票。 |
| 2026-08-16 | `CP-1-2` 登録（`order_index` 612、`publishedAt` 8/19）。1-2 ブリーフ削除。1-3 ブリーフ起票。 |
| 2026-08-16 | `CP-1-3` 登録（`order_index` 613、`publishedAt` 8/21）。Season 1 完。1-3 ブリーフ削除。 |
| 2026-08-17 | 公開呼称を **CP** に統一。1-1 計器は T-38 CSW/CDI を読み替え（T-4 の正解にしない）。見出しはエリア維持。 |
| 2026-08-17 | ファイル名・slug・DB id を `CP-*` に改名（旧 `ctx-*` URL は alias）。詳細解説は PREP（P/R/E/P）見出しに FMT と統一。 |
| 2026-08-17 | 公開本文から Area / Fund / Att / Vol.2 番号を外す。不合格は「不合格要件」だけ。 |
