# Gemini 向け素案 — PPL `PPL-3-1-4_WindTriangleAndFlightComputer`（新規・全文）

**正本 stem**: `PPL-3-1-4_WindTriangleAndFlightComputer.mdx`  
**記事 URL（予定）**: `/articles/PPL-3-1-4_WindTriangleAndFlightComputer`  
**`meta.order`**: **304**  
**CPL 扉**: `/articles/3.4.4_FlightPlanning`  
**DB クラスタ**: 風力三角形(15)、航法計算(7)

---

## 1. 記事目的

**風力三角形（Wind Triangle）** と **風修正角（WCA）**、**航法計算尺（E6-B 等）** の PPL 向け基礎。TH・TAS・風 → Track・GS・WCA の関係を**図と手順**で腹案化し、飛行計画（3-1-5）と CPL `3.4.4` への橋とする。数値例は 1〜2 本（単純な整数 wind/heading）。

## 2. 学習目標

- [ ] 風力三角形の **3 辺（TH/TAS、風、Track/GS）** の関係を図で説明できる。
- [ ] **WCA** の符号（風からの吹き流し）と、TH = Track ± WCA の関係を述べられる。
- [ ] E6-B（または同等計算尺）で **TAS・GS・WCA** を求める**基本手順**を説明できる（試験は概念＋簡単な数値）。

## 3. 必須セクション

1. **概要** — 3-1-2 で TH ≠ Track を予告した。**風を「第三の矢印」として足す**。
2. **風力三角形** — ベクトル図。追い風・向かい風・横風の GS への影響（定性＋簡単数値）。
3. **WCA** — 風修正角の定義、左右の符号、磁気偏差・自差は Phase 2（3-2-3 予告）で本格化。
4. **航法計算尺（E6-B）** — 速度面・風面の役割。回転スライドのイメージ。電子計算機への言及は一言。
5. **🍜 五感比喩** — 例: 屋台の風で傘が斜めになる＝WCA。
6. **💡 Check Six（3〜4 問）**
   - 追い風時 GS > TAS（選択肢）。
   - WCA の符号 — 風が右から → 針路を右に振る（試験型）。
   - 風力三角形の辺の対応（TH/TAS vs Track/GS）。
   - 横風のみ — GS ≒ TAS、Track ≠ TH。
7. **📝 まとめ** — 次回「飛行計画の基礎」（3-1-5）予告。

## 4. リンク要件

- **前回必須**: `/articles/PPL-3-1-3_AeronauticalChartsBasics`
- **次回必須**: `/articles/PPL-3-1-5_FlightPlanningBasics`
- **復習**: `/articles/PPL-3-1-2_NavigationElementsAndAltitude`（TH/Track/IAS/TAS/GS）
- **任意 CPL**: `/articles/3.4.4_FlightPlanning`

## 5. Gemini 依頼文

```
PPL 空中航法「風力三角形と航法計算尺」の Markdown 本文のみ。YAML 禁止。
前回リンク必須: /articles/PPL-3-1-3_AeronauticalChartsBasics
復習: /articles/PPL-3-1-2_NavigationElementsAndAltitude
3000〜5500 字。ASCII または Markdown で風力三角図 1 つ。数値例 1〜2。
Check Six 3〜4 問（単一正答）。
博多弁教官・道真ペルソナ。
任意リンク: /articles/3.4.4_FlightPlanning
データ連携: 風力三角形、航法計算
```

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-06 | 初版 |
