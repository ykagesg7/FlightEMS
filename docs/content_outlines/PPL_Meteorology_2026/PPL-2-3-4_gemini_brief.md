# Gemini 向け素案 — PPL `PPL-2-3-4_SigmetAndWeatherChartsIntro`（新規・Phase 2）

**正本 stem**: `PPL-2-3-4_SigmetAndWeatherChartsIntro.mdx`  
**記事 URL（予定）**: `/articles/PPL-2-3-4_SigmetAndWeatherChartsIntro`  
**`meta.order`**: **224**  
**CPL 扉**: `/articles/3.3.3_FrontsAndWeatherSystems`、`/articles/3.3.4_LowPressureSystems`（天気図・前線の深掘り）  
**前回必須リンク**: `/articles/PPL-2-3-3_WindShearAndVolcanicAsh`（未執筆時は太字「執筆予定」）

---

## 1. 記事目的

空港の一点情報（METAR/TAF）と局地障害（2-3-3）のあと、**航路・広域スケール**の気象情報 — **SIGMET/AIRMET** と **天気図（実況・予想）** — を PPL 入門レベルで読めるようにする。2-2-2/2-2-3 で学んだ前線・気圧配置を**図面上で再確認**する統合記事。

## 2. 学習目標（3項目）

- [ ] SIGMET と AIRMET の**目的の違い**（重大 vs 軽度・影響の広さ）を説明できる。
- [ ] 実況天気図の**等圧線・前線記号・高低気圧**から、おおまかな風と天気のパターンを読み取れる。
- [ ] 予想天気図を使い、**出発前の広域リスク**（前線通過時刻・悪天候域）を METAR/TAF と組み合わせて腹案を立てられる。

## 3. DB データ連携（`unified_cpl_questions`）

| クラスタ | 問数（MCP 2026-07-06） | 記事での扱い |
|----------|------------------------|--------------|
| `天気図/実況天気図の解析` | **27** | **主軸** — 等圧線・前線・H/L |
| `天気図/予想天気図の利用` | **8** | **主軸** — 予報時刻・移動 |
| `気象情報` | **2** | SIGMET/AIRMET 定義（クラスタ名が粗い — 本文で用語整理） |

> **データ連携 Callout 例**: 本記事は **`天気図/実況天気図の解析`**・**`天気図/予想天気図の利用`** クラスタと紐づく。SIGMET/AIRMET は Master Syllabus Phase 2「空域情報」。

**登録時**: `learning_test_mapping` 新規行が必要（Phase 2 stem 初出）。Skill [learning-contents-registration](../../../.cursor/skills/learning-contents-registration/SKILL.md) 参照。

## 4. 必須セクション（骨子）

### 4.1 概要 — 「空港の一点より、地図一枚の方が先に教えてくれる」

- [METAR/TAF（2-3-2）](/articles/PPL-2-3-2_MetarTafAndWeatherReports) は「その空港の今と未来」。[シアー/火山灰（2-3-3）](/articles/PPL-2-3-3_WindShearAndVolcanicAsh) は「最後の数マイルの急変」。
- 本記事は **ルート全体** — プロは出発前に天気図を広げ、SIGMET で「赤信号」を確認する。

### 4.2 SIGMET / AIRMET — 空域の「赤・黄信号」

| 通報 | PPL で押さえる要点 | 例示（概念） |
|------|-------------------|--------------|
| **SIGMET** | 広域・**重大**な気象現象（CB 群、乱気流、火山灰、着氷等） | 航路変更・高度変更の trigger |
| **AIRMET** | 軽度〜中度、**より広く頻繁** | IFR 条件・山地障害・強風等 |

- METAR/TAF との住み分け: **点 vs 面**、**現況/予報 vs 警戒通報**。
- 2-3-3 火山灰 → SIGMET **VA** の予告リンク。
- **試験**: 定義の逆転選択肢（SIGMET＝軽度、等）。

### 4.3 実況天気図 — 等圧線と前線の「地図読み」

| 記号・要素 | 読み方（PPL） | 復習リンク |
|------------|--------------|------------|
| **等圧線（H/L）** | 高→時計回り outward、低→反時計回り | [2-2-3](/articles/PPL-2-2-3_PressureSystemsAndJapanWeather) |
| **前線記号** | 寒冷・温暖・停滞の位置 | [2-2-2](/articles/PPL-2-2-2_AirMassesAndFronts) |
| **等圧線の間隔** | 詰まる＝風強い（定性） | [2-2-1](/articles/PPL-2-2-1_WindObservationBasics) |

- **図 1 枚**: 簡略スケッチ（MDX `Image` プレースホルダ可）— 日本付近の冬型一例など。
- **UTC/JST**: 2-3-2 と同様 **+9 時間** の復習 1 行。

### 4.4 予想天気図 — 「いつ前線が来るか」

- 予報時刻（例: 00Z / 12Z 面）と **有効時間**。
- 実況 vs 予想の**使い分け**: 出発前ブリーフィングの流れ（定性フロー図可）。
- TAF の BECMG/TEMPO と予想天気図の**相互確認**。

### 4.5 ☕ 五感比喩（空中待機）

- 例: **地図の上に広がる寿司ネタ** — 等圧線＝シャリの粒の密度、前線＝ネタの境界、SIGMET＝「このネタは今日は避けろ」ラベル。
- または東北: **八戸のせんべい汁** — 広がる「面」で温めるイメージ（Phase 1 系列のグルメ継続）。

### 4.6 Check Six（3〜4 問）

1. **SIGMET vs AIRMET** — 重大度・対象範囲の定義。
2. **実況天気図** — 等圧線から風向の読み（北半球・高気圧周辺）。
3. **前線記号** — 寒冷前線通過後の天候変化（2-2-2 復習）。
4. **予想天気図** — 予報時刻と JST 変換（2-3-2 復習）。

### 4.7 まとめ — Subject 2 Phase 2 の入口完結

- Phase 1（12 本）＋ Phase 2 入口（2-3-3/4）で **「点・局地・面」** の三層が揃う。
- CPL 扉: [航空気象ハブ](/articles/CPL-Hub-Meteorology) — ASAS・高層天気図は CPL で深掘り。
- **Phase 2 続き**: `PPL-2-2-4_WindDynamicsBasics`（地衡風・海陸風）は W29 候補。

### 4.8 Callout（必須）

```mdx
<Callout type="warning" title="天気図・通報の正本">
  図面・通報の**最新版**は気象庁・AIS 等の公式情報を正とする。本記事の図例は教育用の模式図。
</Callout>
```

## 5. メタデータ案

| 項目 | 案 |
|------|-----|
| `title` | 【航空気象】SIGMET・天気図入門：ルート全体の「赤信号」と地図の読み方 |
| `slug` | `ppl-2-3-4-sigmet-and-weather-charts-intro` |
| `date` / `publishedAt` | **2026-07-09** 以降（2-3-3 の翌執筆日） |
| `readingTime` | 12 |
| `tags` | `PPL`, `学科試験`, `航空気象`, `SIGMET`, `AIRMET`, `天気図` |

## 6. Gemini 依頼文

```
PPL 航空気象 Phase 2「SIGMET/AIRMET と天気図入門」の Markdown 本文のみ。YAML 禁止。
前回: /articles/PPL-2-3-3_WindShearAndVolcanicAsh（未執筆なら「前回のシアー/火山灰記事で…」とだけ書く）
復習: /articles/PPL-2-3-2_MetarTafAndWeatherReports, /articles/PPL-2-2-2_AirMassesAndFronts, /articles/PPL-2-2-3_PressureSystemsAndJapanWeather
4500〜6000 字。天気図の模式図説明用に表 2〜3。Check Six 3〜4 問。
博多弁・道真。UTC→JST +9 の復習 1 段落。export default 不要。
データ連携: 天気図/実況天気図の解析、天気図/予想天気図の利用
```

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-06 | 初版。Phase 2 第 2 本骨子（C-7 W28〜W29 候補） |
