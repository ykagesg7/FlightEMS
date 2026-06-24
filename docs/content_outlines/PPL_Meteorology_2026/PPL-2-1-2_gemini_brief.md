# Gemini 向け素案 — PPL `PPL-2-1-2_TemperatureLapseAndInversion`（新規・全文）

**正本 stem**: `PPL-2-1-2_TemperatureLapseAndInversion.mdx`  
**記事 URL（予定）**: `/articles/PPL-2-1-2_TemperatureLapseAndInversion`  
**前提記事**: `/articles/PPL-2-1-1_AtmosphereAndIsaBasics`  
**CPL 扉**: `/articles/3.3.1_StandardAtmosphere`, `/articles/3.3.5_AtmosphericStability`

---

## 1. 記事目的

**気温減率**（環境気温減率 vs 乾燥断熱減率の入口）、**逆転層**、熱の伝わり方（伝導・対流・放射の概要）を PPL 向けに整理。ISA の「上に行くほど寒い」の**例外**として逆転を理解させる。

## 2. 学習目標

- 標準的な気温減率（約 6.5℃/1000ft または 2℃/1000ft の暗算）を ISA 復習と結びつけられる。
- 逆転層が霧・煙・低層 wind shear の温床になりうることを定性的に説明できる。
- 環境気温減率と断熱減率の**名前の違い**を混同しない（詳細計算は 2-1-5 へ）。

## 3. 必須セクション

1. 概要 — 高度と温度の関係が飛行性能・雲発生に効く理由。
2. 熱の伝わり — 3 方式を各 2 文程度。
3. 気温減率 — ISA との関係、ft/m 両方の代表値。
4. 逆転層 — 放射逆転・前線逆転の**名前と現象**（詳細は 2-2-2, 2-1-7 へ）。
5. 五感比喩 + Check Six（3 誤答）+ まとめ。

## 4. リンク要件

- **必須**: `/articles/PPL-2-1-1_AtmosphereAndIsaBasics`, `/articles/PPL-1-1-1_TemperatureBasics`
- **任意 CPL**: `/articles/3.3.5_AtmosphericStability`

## 5. Gemini 依頼文

```
PPL 航空気象「気温減率と逆転層」の Markdown 本文のみ。YAML 禁止。
3000〜4500 字。チェックリスト形式の学習目標 3 つ。
必須リンク: /articles/PPL-2-1-1_AtmosphereAndIsaBasics と /articles/PPL-1-1-1_TemperatureBasics
博多弁教官トーン。数式は KaTeX 用に $...$ で少数。
```

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-06-24 | 初版 |
