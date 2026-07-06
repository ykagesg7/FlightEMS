# Gemini 向け素案 — PPL `PPL-3-2-2_RadioNavigationOverview`（新規・全文）

**正本 stem**: `PPL-3-2-2_RadioNavigationOverview.mdx`  
**記事 URL（予定）**: `/articles/PPL-3-2-2_RadioNavigationOverview`  
**`meta.order`**: **307**  
**CPL 扉**: `/articles/3.4.2_VORNavigation`, `/articles/3.4.5_NDBNavigation`, `/articles/3.4.6_DMENavigation`  
**DB クラスタ**: 航法計器(1)

---

## 1. 記事目的

**VOR・DME・NDB・ILS** の PPL 向け**概要**（原理・用途・読み方の入口）。各装置の試験特化は CPL `3.4.2` / `3.4.5` / `3.4.6` へ扉。GNSS は Phase 2（3-2-4 予告）で本格化。地文 Fix（3-2-1）に**計器 Fix** を足す橋渡し記事。

## 2. 学習目標

- [ ] **VOR** — 針路・逆針路、TO/FROM、CDI の基本 — を説明できる。
- [ ] **DME** — 斜距離（NM）、VOR/DME 併用 — の役割を述べられる。
- [ ] **NDB/ADF** と **ILS**（ローカライザ・グライドスロープの役割）を、PPL 学科レベルで区別できる。

## 3. 必須セクション

1. **概要** — 目が見えないとき、電波で「線」を引く。計器航法の地図。
2. **VOR** — 360 方位、OBS、CDI、逆 VOR。VOR Fix のイメージ。深掘りは 3.4.2。
3. **DME** — 距離読み、DME アーク。3.4.6 扉。
4. **NDB/ADF** — 非方向性ビーコン、相対方位。3.4.5 扉。
5. **ILS** — 精密進入の概要。LOC/GS、決心高度は PPL では定性。詳細は CPL/実技。
6. **🍜 五感比喩** — 例: 電波塔が「compass rose の中心」— VOR のイメージ。
7. **💡 Check Six（3〜4 問）**
   - VOR の CDI — 中心 = 選んだ針路上。
   - DME が測るもの（斜距離 NM）。
   - NDB vs VOR — 方向基準の違い（定性）。
   - ILS の 2 本の電波（LOC + GS）。
8. **📝 まとめ** — 次回「VFR 運航と空域」（3-3-1）予告。

## 4. リンク要件

- **前回必須**: `/articles/PPL-3-2-1_PilotageAndPositionFix`
- **次回必須**: `/articles/PPL-3-3-1_VfrOperationsAndAirspace`
- **任意 CPL（各節末尾 Callout）**: `/articles/3.4.2_VORNavigation`, `/articles/3.4.5_NDBNavigation`, `/articles/3.4.6_DMENavigation`

## 5. Gemini 依頼文

```
PPL 空中航法「無線航法の概要」の Markdown 本文のみ。YAML 禁止。
前回リンク必須: /articles/PPL-3-2-1_PilotageAndPositionFix
3000〜5500 字。表 1 つ（VOR/DME/NDB/ILS 比較）。
Check Six 3〜4 問（単一正答）。
博多弁教官・道真ペルソナ。各装置は概要に留め深掘りは CPL へ誘導。
任意リンク: /articles/3.4.2_VORNavigation, /articles/3.4.5_NDBNavigation, /articles/3.4.6_DMENavigation
データ連携: 航法計器
```

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-06 | 初版。CPL 3.4.2/5/6 扉付き |
