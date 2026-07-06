# Gemini 向け素案 — PPL `PPL-3-1-5_FlightPlanningBasics`（新規・全文）

**正本 stem**: `PPL-3-1-5_FlightPlanningBasics.mdx`  
**記事 URL（予定）**: `/articles/PPL-3-1-5_FlightPlanningBasics`  
**`meta.order`**: **305**  
**CPL 扉**: `/articles/3.4.4_FlightPlanning`  
**DB クラスタ**: 航法計算(7)

---

## 1. 記事目的

**飛行計画の型** — 区間距離・**所要時間（ETE/ETA）**・**燃料（Trip + Reserve）** — を PPL 学科向けに整理。3-1-1〜3-1-4 の集大成。**通信側の飛行計画提出**は [PPL-4-2-4](../../src/content/lessons/PPL-4-2-4_FlightPlanFilingBasics.mdx) へ扉、CPL `3.4.4` は深掘りハブ。地文・Fix（3-2-1）へ進む前の**計画思考の正本**。

## 2. 学習目標

- [ ] 区間 **距離（NM）÷ GS = 時間** の基本式で ETE を概算できる。
- [ ] **Trip fuel** と **Reserve**（45 分等 — 試験レベルの代表値）の区別を説明できる。
- [ ] チェックポイント・代替空港を計画に含める**理由**を PPL レベルで述べられる。

## 3. 必須セクション

1. **概要** — 図（3-1-3）にルートを引き、風（3-1-4）を入れた。**数字で「着けるか」を確認する**。
2. **時間計算** — Distance/GS = Time。UTC で ETA を書く（3-1-1 復習）。単位混同（km/h vs kt）に注意。
3. **燃料計画** — Trip、Reserve、Contingency は PPL では Reserve 中心。消費率（GPH）× 時間。安全側の丸め。
4. **計画の型** — 出発・経路・チェックポイント・到着・代替。NOTAM/AIP は Phase 2 予告。
5. **🍜 五感比喩** — 例: 高速道路の SA 計画 — ガソリンと休憩時間。
6. **💡 Check Six（3〜4 問）**
   - 120 NM、GS 90 kt → ETE 80 分（数値問題）。
   - Reserve の意味 — Trip との混同。
   - ETA を UTC で書く理由。
   - 追い風で GS 増 → 燃料消費時間は？（定性: 時間短縮）。
7. **📝 まとめ** — 次回「地文航法と機位確認」（3-2-1）予告。

## 4. リンク要件

- **前回必須**: `/articles/PPL-3-1-4_WindTriangleAndFlightComputer`
- **次回必須**: `/articles/PPL-3-2-1_PilotageAndPositionFix`
- **通信扉**: `/articles/PPL-4-2-4_FlightPlanFilingBasics` — 「提出手順は通信 4-2-4」
- **任意 CPL**: `/articles/3.4.4_FlightPlanning`

## 5. Gemini 依頼文

```
PPL 空中航法「飛行計画の基礎」の Markdown 本文のみ。YAML 禁止。
前回リンク必須: /articles/PPL-3-1-4_WindTriangleAndFlightComputer
通信扉: /articles/PPL-4-2-4_FlightPlanFilingBasics
3000〜5500 字。表 1 つ（計画項目チェックリスト）。
Check Six 3〜4 問（数値 1 問含む）。
博多弁教官・道真ペルソナ。
任意リンク: /articles/3.4.4_FlightPlanning
データ連携: 航法計算
```

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-06 | 初版。PPL-4-2-4・CPL 3.4.4 扉付き |
