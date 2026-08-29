# CP — 執筆正本（Season 1–5）

**読者**: 空自 T-4 学生（Joe / 博多弁 / 道真）。副次: シミュレータ。サイト全体を軍事化しない。公式教程の代替ではない。  
**呼称**: 公開面は **CP**（空自）。USAF 教範の章名 Contact は出典参照に残す。  
**位置**: 読む順は **CP → FMT**（単機の飛行Envelopeのあと編隊）。FMT Season 2（BFM 幾何）はそのさらに後。  
**既存公開**: **W34 ドリップ** 1-1 月 8/17、1-2 水 8/19、1-3 金 8/21。**W35 ドリップ**: 2-1 月 8/24、2-2 水 8/26、2-3 金 8/28。**W36 ドリップ**: 2-4 月 8/31、2-5 水 9/2、2-6 金 9/4。`is_published` は cron が schedule の日付で反転。当日までは `false`。  
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

**Season 1（1-1〜1-3）は MDX 済（W34 月水金）。** Season 2 の 2-1〜2-6 は精緻化済（W35: 2-1〜2-3、W36: 2-4〜2-6）。Season 3 以降はストック。CP シリーズ完（最終話 5-9 Chandelle）。次の CP ブリーフは作らない。

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

### 公開本文の契約（2026-08-22〜・2-1 精緻化から）

精緻化済みは **2-1〜2-6**。以降の CP もこれに従う。エージェントは MDX 規則と本節の両方を見る。

- **実施禁止:** 学習目標直下の「立場の明確化」に、AFMAN 非代替に加えて次を書く。「本記事は飛行規程（AFM/POH）・教官ブリーフィング・実機手順の代替ではない。記載の操作を、有資格教官と当該機の承認なしに実施してはならない。」
- **数字:** 許可表の値は **T-38 教範枠**と明示する。「T-4 は自機に読み替え」「米空軍もまったく同じ物理」で手順を移植するな。自機値は飛行規程と教官。
- **用語切断:** USAF の演示名が民間用語と衝突する話（例: Deep stall）は、公理の直後で別物だと書く。出典なしに T-4／民事機の制限値を足すな。
- **2つの回復:** 演習の戻しと、意図しない実戦の回復を分ける。後者は操作を発明せず、「まず迎え角を下げる。その先はその機の手順」。引きを持ったまま出力だけ足すな。
- **中止:** 「通常の失速回復」の中身を書くな。演習をやめ、当該機の承認手順へ切り替え。高度の床は教官と規程。
- **口頭試問は今の場面だけ。** 二つの回復の講義は詳細解説へ。話者は `学生：` / `学生（白目）：`。
- **ジョーの笑い:** 瓶バン＋「ひぇぇっ」は使わない。学生は一度反論する。比喩はその話の Holding と揃える（2-1 水炊き、2-2 山笠、2-3 うどん）。ブルシットは遅らせ、対象は学生ではなく説明の長さ／誤った忙しさ。締めは短い行動指示。2-2 の判断は「オーバーシュートを直すために失速に入れるな」。
- **冒頭・締め:** 「全国のT-4…」「今すぐ目を覚ませ」「血の掟をハック」「ラップベルト」で始め／終わるな。読者がやりがちな失敗から入り、Brief で言える一句で閉じる。
- **警報:** 「計器に頼るな」は AOA 計の数字待ち禁止。失速警報・強いバフェットの無視ではない。

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

| # | stem | slug | order | 主題 | 所有 | 状態 |
|---|------|------|-------|------|------|------|
| 2-1 | `CP-2-1_DeepStall` | `cp-2-1-deep-stall` | 1 | Deep stall | **5.7–5.8** | **精緻化済・W35 月 8/24** |
| 2-2 | `CP-2-2_AcceleratedStall` | `cp-2-2-accelerated-stall` | 2 | Accelerated stall | **5.14** | **精緻化済・W35 水 8/26** |
| 2-3 | `CP-2-3_RollAuthority` | `cp-2-3-roll-authority` | 3 | Rudder / aileron / reversal | **5.10, 5.12, 5.15** | **精緻化済・W35 金 8/28** |
| 2-4 | `CP-2-4_Unload` | `cp-2-4-unload` | 4 | Acceleration / stab demo | **5.13, 5.18** | **精緻化済・W36 月 8/31** |
| 2-5 | `CP-2-5_TrimFailure` | `cp-2-5-trim-failure` | 5 | Simulated trim failure | **5.9** | **精緻化済・W36 水 9/2** |
| 2-6 | `CP-2-6_PitchbackSliceback` | `cp-2-6-pitchback-sliceback` | 6 | Pitchback / Sliceback（handling） | **5.16–5.17**。Immelmann / Split-S ではない | **精緻化済・W36 金 9/4** |

`order_index`: **614–619**。

---

## Season 3（2 話）— パターンで死なない（configured + 5C）

5.1 が traffic pattern を Contact に含めている。フレア手順（Ch4）は触らない。

| # | stem | slug | order | 主題 | 所有 | Vol.2 | 状態 |
|---|------|------|-------|------|------|-------|------|
| 3-1 | `CP-3-1_ConfiguredHandling` | `cp-3-1-configured-handling` | 1 | Configured rudder / slow flight | **5.11, 5.20–5.21** | **32** Slow flight −3 / +5 | **ストック** |
| 3-2 | `CP-3-2_PatternATS` | `cp-3-2-pattern-ats` | 2 | Pattern approach-to-stall | **5.22–5.25** | **29** | **ストック** |

`order_index`: **620–621**。

---

## Season 4（2 話）— 戻す（5D）

S2-4 の unload はここでは適用だけ。計器の Area **47a** は混ぜない。

| # | stem | slug | order | 主題 | 所有 | Vol.2 | 状態 |
|---|------|------|-------|------|------|-------|------|
| 4-1 | `CP-4-1_NoseHigh` | `cp-4-1-nose-high` | 1 | Nose-high recovery | **5.26–5.27** | **31** | **ストック** |
| 4-2 | `CP-4-2_NoseLow` | `cp-4-2-nose-low` | 2 | Nose-low recovery | **5.28** | **30** | **ストック** |

`order_index`: **622–623**。

---

## Season 5（9 話）— 定義された図形（5E）

並びは教程どおり。採点は全図形 **Area 33**。

| # | stem | slug | order | 主題 | 所有 | 状態 |
|---|------|------|-------|------|------|------|
| 5-1 | `CP-5-1_AerobaticContract` | `cp-5-1-aerobatic-contract` | 1 | 曲技の契約・表 5.1/5.2 | **5.29–5.32**（5.3 を再講義しない） | **ストック** |
| 5-2 | `CP-5-2_AileronRoll` | `cp-5-2-aileron-roll` | 2 | Aileron roll | **5.33** | **ストック** |
| 5-3 | `CP-5-3_LazyEight` | `cp-5-3-lazy-eight` | 3 | Lazy Eight | **5.34** | **ストック** |
| 5-4 | `CP-5-4_BarrelRoll` | `cp-5-4-barrel-roll` | 4 | Barrel roll | **5.35** | **ストック** |
| 5-5 | `CP-5-5_Loop` | `cp-5-5-loop` | 5 | Loop | **5.36** | **ストック** |
| 5-6 | `CP-5-6_SplitSImmelmann` | `cp-5-6-split-s-immelmann` | 6 | Split-S / Immelmann | **5.37–5.38** | **ストック** |
| 5-7 | `CP-5-7_CubanEight` | `cp-5-7-cuban-eight` | 7 | Cuban Eight | **5.39** | **ストック** |
| 5-8 | `CP-5-8_Cloverleaf` | `cp-5-8-cloverleaf` | 8 | Cloverleaf | **5.40** | **ストック** |
| 5-9 | `CP-5-9_Chandelle` | `cp-5-9-chandelle` | 9 | Chandelle | **5.41** | **ストック** |

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

### Season 2

| 項目 | 値 | 出典 | 話 |
|------|-----|------|----|
| Handling の性質 | 精密 maneuver ではない。feel が先、specific parameter は後 | Fund 5.7 | 2-1 |
| 開始条件 | **FL200 以下** level、**80% rpm 以上**（T-38） | Fund 5.8.3 | 2-1 |
| バフェット / AOA | **0.8** 付近でバフェット増、**1.0** full stall、**1.1** fully developed（T-38） | Fund 5.8.5 | 2-1 |
| 完成失速 | わずかに **nose-low**、**≈140 KIAS**、VVI **6,000 fpm**（T-38） | Fund 5.8.5 | 2-1 |
| 回復（演習） | パワーそのまま、**back stick relax**。速度復帰後に back stick と必要パワー | Fund 5.8.6 | 2-1 |
| 意図しない失速 | **パワー増** で高度ロス最小化を検討 | Fund 5.8.2 | 2-1 |
| 中止 | **bank >90°** または **>60° で安定** → stall recovery | Fund 5.8.7 | 2-1 |
| Vol.2 | 主は **32 Aircraft Handling**（erratic / control 一時喪失）。29 / 33 は出さない | Vol.2 Table 3.1 | 2-1 |
| 進入 | **≈300 KIAS**（G と到達時間を減らす。T-38） | Fund 5.14.1 | 2-2 |
| 開始 | **2–3 G turn**、**MIL**、**≈300 KIAS**（T-38） | Fund 5.14.2 | 2-2 |
| 最適旋回 | **light buffet の level turn** = T-38 optimum turn | Fund 5.14.2 | 2-2 |
| 行き過ぎ | bank / back stick を急増 → increased buffet または mild wing rock。turn rate は一瞬増のあと減、速度ロス増 | Fund 5.14.3 | 2-2 |
| 戻し | 計器なしで useful point 超えを感じ、**back stick relax**、light buffet で turn 継続 | Fund 5.14.4 | 2-2 |
| Rudder clean | **20° nose-high / 300 KIAS / ≈90% rpm**、light buffet で full rudder はロール。**≈½ G** ではほとんどロールせず。AOA **1.0+** に入るな。gear up **6°** / down **30°**（T-38） | Fund 5.10 | 2-3 |
| Aileron | **20° nose-high / ≈90% rpm → 150 KIAS**、moderate buffet。同じ舵角で **≈½ G unload** すると roll rate 増。AOA 減で効く（速度に無関係） | Fund 5.12 | 2-3 |
| Reversal | **350–400 KIAS**、MIL 以上、**≈90° / ≈4 G**。エルロン reversal は速く速度ロス少。ラダーは遅い（top は速度、bottom は高度） | Fund 5.15 | 2-3 |
| 加速比較 | **250→350 KIAS**：1 G より **≈0 G** が速い。**300→400**：2–3 G のままは遅い、unload すると速い。以降は任意速度・バンクで **≈0 G + MIL 以上**（T-38。MAX は T-4 の正解にしない） | Fund 5.13 | 2-4 |
| Stab demo | **60° nose-high**、**85% rpm 以上**。**170 KIAS** で **≈½ G**。引いて level を試すと直ちに失速兆候。**175–200 KIAS** で level。常時 **≥½ G**（油系統、T-38） | Fund 5.18 | 2-4 |
| Trim failure | **FL200 以下**、**300 KIAS 超** で level trim。retrim せず通常の最終進入速度まで減速。**240 KIAS 以下** で **gear & full flaps**（stick force 増）。go-around 模擬は retrim 後に再 trim せず gear/flaps up、**300 KIAS 超** へ（前圧）。演習後は必ず retrim。ATS なら stall recovery と同時 retrim（T-38） | Fund 5.9 | 2-5 |
| Pitchback | **level 450–500 KIAS**、パワー **550° EGT–MIL**（T-38。EGT は T-4 の正解にしない）。desired bank（**0°超〜90°未満**）→ ailerons neutral → **4–5 G** または light buffet。straight nose track **≈180°**。Immelmann ではない | Fund 5.16 | 2-6 |
| Sliceback | **200–300 KIAS**、**90%–MIL**。desired bank（**90°超〜180°未満**）→ ailerons neutral → light buffet。straight nose track **≈180°**。進入速度が高いほど底の G。rolling input は asymmetrical over-G。Split-S ではない | Fund 5.17 | 2-6 |

### Season 3

| 項目 | 値 | 出典 | 話 |
|------|-----|------|----|
| Configured rudder | **gear down**、flaps 任意（full / **60%** / no-flap）。level、**AOA ≈0.8–0.85**。full rudder → すぐ neutral、スティック位置維持、エルロン中立。**1–2 秒後 ≈90°** ロール。near-full はすぐ中立。controlled rudder で level（T-38） | Fund 5.11 | 3-1 |
| Slow flight | 形態後、**計算最終進入の 10 kt 下**。level（わずかな降下可）。indexer slow（red chevron / green donut、**≈0.7 AOA**）は T-38。各種バンクの協調旋回。滑らかな舵。速度公差 **−3 / +5**（T-38 採点） | Fund 5.20 | 3-1 |
| Flap recovery demo | gear down、full flaps、slow flight、**パワー一定**。60% へ → 加速・AOA 減。フルアップへ → 60% 通過で加速、その後バフェット増・減速・失速接近（T-38。フレア手順は書かない） | Fund 5.21 | 3-1 |
| Pattern ATS | 着陸形態、**80% rpm 以上**（T-38）。精密機動ではない。Turning: level / diving / overshot の意図的誤り。level はバンクほぼ一定で減速、**buffet の明らかな増加**で stall recovery。Landing attitude: グライドパスを伸ばす。回復完了は降下停止、plus climb（高度計と VVI 反転）、継続できる速度。低フラップは buffet が曖昧。no-flap は secondary stall 増 | Fund 5.22–5.25 | 3-2 |

### Season 4

| 項目 | 値 | 出典 | 話 |
|------|-----|------|----|
| Nose-high recovery | 軽く：引きを緩めて slight G。極端：近い地平線へロールして機首を下げる。低速：unload。T-38 **約 230–265 KIAS**（燃料重量による）。足りなければ機首が明らかに地平線以下になるまでロールアウトを遅らせ、浅い降下で加速。パワー増は滑らかに（コンプレッサストール／フレームアウト） | Fund 5.26–5.27 | 4-1 |
| Nose-low recovery | 最短旋回半径で level または slight climb。近い地平線へすばやくロール。**moderate buffet または desired recovery G**（早い方）。作業空域は通常 **4–5 G**。速度はパワーとスピードブレーキで **約 250–400 kt**（コーナー約 400 kt、T-38）。目標 G で buffet なし → 減速して半径最小化。目標 G 前に buffet → **MIL 以上**を desired G で buffet 消失まで。地上接近は空力／G 限界まで躊躇しない。**S5 の Loop 数字は先出し禁止** | Fund 5.28 | 4-2 |

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

Barrel の **30–45° オフセット**、4 チェックポイント（真上 90° bank / inverted 180° / 真下 90° bank / 正立）、**positive G 全行程**、終了速度は symmetry 優先は **S5-4**（Fund 5.35）。

Loop の pull **4.5–5 G**、inverted horizon で **wings-level**、下半分 **4–5 G**、完了は **entry parameters**、進入速度に対し **≈10,000 ft 上方**（機動余裕）、over-the-top **150 KIAS** 超（5.31 再掲）、tickle / **green donut**（T-38）は **S5-5**（Fund 5.36）。

Split-S 進入 **200 KIAS / MIL**、inverted wings-level を horizon 前に確立 → ailerons neutral → **light buffet** straight pull、完了は進入方位から **≈180°**、空域 前方/後方 1 nm・下方 7–10 kft。Immelmann 進入 **500 KIAS / MIL**、loop 前半 + 頂点 **half roll**（inverted 直前に back stick relax）、完了は original heading から **180°**、空域 前方 1 nm・上方 8–10 kft。canopy bow on horizon は T-38。これらは **S5-6**（Fund 5.37–5.38）。

Cuban Eight 進入 **500 KIAS / MIL**、**45° nose-low inverted** で half roll、機首 **≈45° below horizon** 維持、その後 **4.5–5 G pullup**、第2 half は **≈50 kt リード**、2 回目のロールは反対、完了は entry speed / original heading、空域 前方 1 nm・後方 2 nm・上方 8–10 kft は **S5-7**（Fund 5.39）。

Cloverleaf 進入 **450 KIAS / MIL**、4 leaf 同方向、各 heading **90°**、**2–3 G pullup**、**≈45° pitch** rolling pull、inverted level **175–200 KIAS**、pullout は Split-S 類似（light buffet）、第1 leaf は最寄り border へ、空域 前方 3 nm・第1 turn 2 nm・反対 3 nm・上方 8–10 kft は **S5-8**（Fund 5.40）。

Chandelle 進入 **400 KIAS / 95% rpm**、**≈180°** climbing turn で maximum altitude gain、**30–45° turn** で horizon（**≈60° bank**）、**≈135–150°** で bank 減、**≈180°** で wings-level（level flight ではない）**≈200 KIAS**、開始 nose が低いほど終了 nose は高い、空域 前方 1 nm・turn 1 nm・上方 6–7 kft は **S5-9**（Fund 5.41）。

S5 の T-38 数字は各話ブリーフ起票時に本表へ足す（表 5.1 / 5.2 の再掲を除く）。先に発明しない。

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
| 2026-08-17 | Season 2-1 Deep stall ブリーフ起票。許可数字（FL200 / 80% rpm / AOA 0.8–1.1 / 140 KIAS / 6,000 fpm）を本表へ。 |
| 2026-08-17 | `CP-2-1` ストック登録（`order_index` 614、`is_published: false`）。2-1 ブリーフ削除。2-2 加速失速ブリーフ起票。 |
| 2026-08-17 | `CP-2-2` ストック登録（`order_index` 615、`is_published: false`）。2-2 ブリーフ削除。2-3 ラダー／エルロン／reversal ブリーフ起票。 |
| 2026-08-17 | `CP-2-3` ストック登録（`order_index` 616、`is_published: false`）。2-3 ブリーフ削除。2-4 Unload／加速ブリーフ起票。 |
| 2026-08-18 | `CP-3-2` ストック登録（`order_index` 621、`is_published: false`）。3-2 ブリーフ削除。4-1 Nose-high ブリーフ起票。許可数字（230–265 KIAS）を本表へ。 |
| 2026-08-19 | `CP-4-1` ストック登録（`order_index` 622、`is_published: false`）。4-1 ブリーフ削除。4-2 Nose-low ブリーフ起票。許可数字（250–400 kt / 4–5 G）を本表へ。 |
| 2026-08-19 | `CP-4-2` ストック登録（`order_index` 623、`is_published: false`）。4-2 ブリーフ削除。5-1 Aerobatic contract ブリーフ起票。 |
| 2026-08-20 | `CP-5-1` ストック登録（`order_index` 624、`is_published: false`）。5-1 ブリーフ削除。5-2 Aileron roll ブリーフ起票。 |
| 2026-08-20 | `CP-5-2` ストック登録（`order_index` 625、`is_published: false`）。5-2 ブリーフ削除。5-3 Lazy Eight ブリーフ起票。 |
| 2026-08-20 | `CP-5-3` ストック登録（`order_index` 626、`is_published: false`）。5-3 ブリーフ削除。5-4 Barrel Roll ブリーフ起票。許可数字（30–45° オフセット / 4 チェックポイント / positive G）を本表へ。 |
| 2026-08-21 | `CP-5-4` ストック登録（`order_index` 627、`is_published: false`）。5-4 ブリーフ削除。5-5 Loop ブリーフ起票。許可数字（4.5–5 G / wings-level at inverted / 150 KIAS 超）を本表へ。 |
| 2026-08-21 | `CP-5-5` ストック登録（`order_index` 628、`is_published: false`）。5-5 ブリーフ削除。5-6 Split-S / Immelmann ブリーフ起票。許可数字（200 KIAS / 500 KIAS / half roll）を本表へ。 |
| 2026-08-21 | `CP-5-6` ストック登録（`order_index` 629、`is_published: false`）。5-6 ブリーフ削除。5-7 Cuban Eight ブリーフ起票。許可数字（45° nose-low / 4.5–5 G pullup / ≈50 kt リード）を本表へ。 |
| 2026-08-21 | `CP-5-7` ストック登録（`order_index` 630、`is_published: false`）。5-7 ブリーフ削除。5-8 Cloverleaf ブリーフ起票。許可数字（4 leaf / 90° / 2–3 G / 175–200 KIAS）を本表へ。 |
| 2026-08-21 | `CP-5-8` ストック登録（`order_index` 631、`is_published: false`）。5-8 ブリーフ削除。5-9 Chandelle ブリーフ起票。許可数字（400 KIAS / 60° bank / ≈200 KIAS）を本表へ。 |
| 2026-08-21 | `CP-5-9` ストック登録（`order_index` 632、`is_published: false`）。5-9 ブリーフ削除。CP シリーズ完。次の CP ブリーフは作らない。 |
| 2026-08-22 | 「公開本文の契約」を 1 話の型へ。2-1・2-2 精緻化。2-2 はオーバーシュートより失速に入れない。以降の CP もこれに従う。 |
| 2026-08-30 | 2-4〜2-6 精緻化。W36 ドリップ（8/31・9/2・9/4）。Season 2 完結。 |
