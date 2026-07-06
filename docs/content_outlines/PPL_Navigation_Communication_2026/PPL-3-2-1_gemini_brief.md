# Gemini 向け素案 — PPL `PPL-3-2-1_PilotageAndPositionFix`（新規・全文）

**正本 stem**: `PPL-3-2-1_PilotageAndPositionFix.mdx`  
**記事 URL（予定）**: `/articles/PPL-3-2-1_PilotageAndPositionFix`  
**`meta.order`**: **306**  
**CPL 扉**: `/articles/3.4.1_DeadReckoning`, `/articles/3.4.7_DeadReckoningAdvanced`  
**DB クラスタ**: 機位の確認(2)

---

## 1. 記事目的

**地文航法（pilotage）** と **機位確認（position fix）**、**DR チェックポイント** を PPL 向けに整理。目で見たランドマークと地図（3-1-3）・計画（3-1-5）を結び、**「今どこにいるか」** を確認する実務感覚の正本。無線航法（3-2-2）の前段。CPL `3.4.7` は DR 応用の深掘り扉。

## 2. 学習目標

- [ ] **地文航法** — 目視ランドマークで位置・進路を確認 — を DR と対比して説明できる。
- [ ] **Fix（位置確認）** の方法（地文 Fix、DR Fix、交差方位は 3-2-2 予告）を列挙できる。
- [ ] **チェックポイント** を計画に設定し、ずれを早期発見する重要性を述べられる。

## 3. 必須セクション

1. **概要** — 計画は紙の上。**空では地図と景色を重ねる** — pilotage の本質。
2. **地文航法** — 河川、道路、湖、海岸、塔、空港等。VFR の基本。夜・IMC 限界は 3-3-1 へ。
3. **Fix の種類** — 地文 Fix、DR 位置、計器 Fix（VOR 等は 3-2-2）。Fix の精度と更新頻度。
4. **DR チェックポイント** — 計画時に通過時刻・地物を決める。ずれ → 針路・高度・再計画。
5. **🍜 五感比喩** — 例: 福岡タワーが見えたら「あ、ここや」— 地標 Fix。
6. **💡 Check Six（3〜4 問）**
   - pilotage の定義 vs DR。
   - Fix とは何か（現在位置の確定）。
   - チェックポイントの目的 — 迷子防止。
   - 地文 Fix が困難な条件（低視程・夜 — 選択肢）。
7. **📝 まとめ** — 次回「無線航法の概要」（3-2-2）予告。

## 4. リンク要件

- **前回必須**: `/articles/PPL-3-1-5_FlightPlanningBasics`
- **次回必須**: `/articles/PPL-3-2-2_RadioNavigationOverview`
- **復習**: `/articles/PPL-3-1-3_AeronauticalChartsBasics`, `/articles/PPL-3-1-1_EarthCoordinatesAndTime`
- **任意 CPL**: `/articles/3.4.1_DeadReckoning`, `/articles/3.4.7_DeadReckoningAdvanced`

## 5. Gemini 依頼文

```
PPL 空中航法「地文航法と機位確認」の Markdown 本文のみ。YAML 禁止。
前回リンク必須: /articles/PPL-3-1-5_FlightPlanningBasics
復習: /articles/PPL-3-1-3_AeronauticalChartsBasics
3000〜5500 字。表 1 つ（Fix 種別比較）。
Check Six 3〜4 問（単一正答）。
博多弁教官・道真ペルソナ。九州の地文例（玄界灘、筑後川等）可。
任意リンク: /articles/3.4.1_DeadReckoning, /articles/3.4.7_DeadReckoningAdvanced
データ連携: 機位の確認
```

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-06 | 初版 |
