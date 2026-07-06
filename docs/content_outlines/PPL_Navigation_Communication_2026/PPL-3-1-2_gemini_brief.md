# Gemini 向け素案 — PPL `PPL-3-1-2_NavigationElementsAndAltitude`（新規・全文）

**正本 stem**: `PPL-3-1-2_NavigationElementsAndAltitude.mdx`  
**記事 URL（予定）**: `/articles/PPL-3-1-2_NavigationElementsAndAltitude`  
**`meta.order`**: **302**  
**CPL 扉**: `/articles/3.4.1_DeadReckoning`  
**DB クラスタ**: 航法要素(18)、高度(26)

---

## 1. 記事目的

**針路（TH）・航跡（Track）**、**指示空速（IAS）・真対気速度（TAS）・対地速度（GS）**、**海里（NM）** と **各種高度（圧力・密度・真・指示）** を PPL 向けに整理。工学記事 [PPL-1-2-2](../../src/content/lessons/PPL-1-2-2_PitotStatic.mdx)・[PPL-1-1-2](../../src/content/lessons/PPL-1-1-2_AirspeedBasics.mdx) からの**航法側の復習・接続**が主眼。風力三角（3-1-4）と飛行計画（3-1-5）の前提。

## 2. 学習目標

- [ ] **針路・航向・航跡**の違いと、風があるとき TH ≠ Track になる理由を説明できる。
- [ ] **IAS → TAS → GS** の関係と、**NM** を距離単位として使う理由を述べられる。
- [ ] **圧力高度・密度高度・真高度・指示高度**の定義と、性能・障害物余裕への含意を PPL レベルで説明できる。

## 3. 必須セクション

1. **概要** — 前回（3-1-1）で座標と時間を揃えた。**今度は「どっち向き・どれくらい速く・どの高さか」**。
2. **方向の三兄弟** — TH（機首）、Heading（磁/真の文脈は Phase 2 予告）、Track（地上の軌跡）。風でズレる — 3-1-4 へ橋。
3. **速度の三兄弟** — IAS（計器）、TAS（真）、GS（対地）。リンク必須: PPL-1-1-2 の復習 Callout。
4. **距離 NM** — 緯度 1′ = 1 NM、海里 vs km、航法計算の単位統一。
5. **高度の種類** — 圧力・密度・真・指示。リンク必須: PPL-1-2-2（ピトー静圧）。ISA との関係は定性。
6. **🍜 五感比喩** — 例: 博多川の流れに逆らう舟＝風、岸を見る速さ＝GS。
7. **💡 Check Six（3〜4 問）**
   - TH と Track の違い（風あり）。
   - IAS と TAS — 高度が上がると TAS > IAS（定性）。
   - 圧力高度 vs 密度高度 — 試験定番の混同。
   - 1 NM の定義（緯度 1 分）。
8. **📝 まとめ** — 次回「航空図の基礎」（3-1-3）予告。

## 4. リンク要件

- **前回必須**: `/articles/PPL-3-1-1_EarthCoordinatesAndTime`
- **次回必須**: `/articles/PPL-3-1-3_AeronauticalChartsBasics`
- **必須復習**: `/articles/PPL-1-2-2_PitotStatic`、 `/articles/PPL-1-1-2_AirspeedBasics`
- **任意 CPL**: `/articles/3.4.1_DeadReckoning`

## 5. Gemini 依頼文

```
PPL 空中航法「航法要素と高度」の Markdown 本文のみ。YAML 禁止。
前回リンク必須: /articles/PPL-3-1-1_EarthCoordinatesAndTime
必須復習リンク: /articles/PPL-1-2-2_PitotStatic, /articles/PPL-1-1-2_AirspeedBasics
3000〜5500 字。表 1 つ（TH/Track/IAS/TAS/GS または高度種別）。
Check Six 3〜4 問（単一正答）。
博多弁教官・道真ペルソナ。専門用語は正確に。
任意リンク: /articles/3.4.1_DeadReckoning
データ連携: 航法要素、高度
```

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-06 | 初版。PPL-1 工学記事との接続骨子 |
