# Quiz 削除・要レビュー候補レポート（CBT 整合 + 法規改正）

**作成日**: 2026-05-28  
**データ源**: Supabase `unified_cpl_questions`（`verification_status = 'verified'` 基準時 **2,289** 件）  
**Phase 1 実行**: `scripts/database/20260528_quiz_cbt_phase1_needs_review.sql`（**41 件**を `needs_review` へ降格）  
**Phase 1 適用済み**: 2026-05-28 Supabase MCP — verified **2,289 → 2,248**（41 件すべて `needs_review` 確認）  
**D-2 改稿・復帰済み**: 2026-05-28 — **8 件** `verified` 復帰、**3 件**は正本重複のため `needs_review`（`duplicate_superseded`）→ verified **2,255**  
**Phase 2 削除済み**: 2026-05-28 — D-1 **2 件** + Tier A **28 件** = **30 件**物理削除。`learning_test_mapping` から ID 除去、`user_test_results` **20 行**削除。verified **2,255**（不変）、needs_review **20**  
**Phase 3 削除・棚卸し済み**: 2026-05-28 — D-2 重複 **3 件** + Tier B **141 件** + 破損/不完全 **2 件** = **146 件**物理削除。needs_review **17 件**を修正 **4** + verified 復帰 **9** + 削除 **7**（重複・Tier B 含む）。verified **2,129**、needs_review **0**

---

## 1. 現行 CBT 形式（国土交通省）

| 項目 | 内容 | 出典 |
|------|------|------|
| 出題形式 | **1問1答のみ**（CBT 体験版第1問と同形式） | [CBT 手引き PDF](https://www.mlit.go.jp/koku/content/001633018.pdf) |
| 航法計算盤 | **必要な問題は出題しない** | 同上 |
| 試験実施 | 会場 PC・問題用紙なし | 同上 |

本アプリは `parseUnifiedCplQuestion` が **4 肢固定**（それ以外はプレースホルダ置換）のため、5 肢・形式不整合は UX 上も危険。

---

## 2. Phase 1 実行サマリー（2026-05-28）

| Tier | 区分 | 件数 | tag | 処置 |
|------|------|------|-----|------|
| A-1 | 航法計算盤の明示 | 5 | `cbt_mismatch_flight_computer` | `needs_review` |
| A-2 | 選択肢 ≠ 4 | 6 | `cbt_mismatch_non_four_options` | `needs_review` |
| A-3 | 「説明せよ」stem | 17 | `cbt_mismatch_essay_stem` | `needs_review` |
| D-1 | 特定救急用具（旧第152条） | 2 | `obsolete_law_art152_specific_emergency_equipment` | `needs_review` |
| D-2 | 救急用具点検期間（解説/正答不整合） | 11 | `wrong_art151_inspection_intervals` | `needs_review` |
| **合計** | | **41** | | |

**verified 残数（予想）**: 2,289 − 41 = **2,248**

### Phase 2 削除（2026-05-28 適用済み）

| 区分 | 件数 | SQL |
|------|------|-----|
| D-1 特定救急用具 | 2 | [`20260528_quiz_phase2_delete_d1_tier_a.sql`](../scripts/database/20260528_quiz_phase2_delete_d1_tier_a.sql) |
| Tier A（航法計算盤・5肢・説明せよ） | 28 | 同上 |
| **合計削除** | **30** | `learning_test_mapping` 配列から除去 + `user_test_results` 20 行削除 |

**needs_review 残（Phase 2 時点）**: **20**（D-2 重複 3 件 + その他 pending 17 件）

### Phase 3 削除 + needs_review 棚卸し（2026-05-28 適用済み）

| 区分 | 件数 | SQL |
|------|------|-----|
| D-2 重複（`duplicate_superseded`） | 3 | [`20260528_quiz_phase3_delete_d2_dupes_tier_b.sql`](../scripts/database/20260528_quiz_phase3_delete_d2_dupes_tier_b.sql) |
| Tier B（変針点 CAS/TAS E6B 型） | 141 | 同上 |
| 破損 options / 不完全 stem | 2 | 同上（`4be5ee98`, `069dda53`） |
| **合計削除** | **146** | `learning_test_mapping` 配列から除去 + 依存行削除 |
| needs_review 修正→verified | 4 | [`20260528_quiz_phase3_needs_review_fix_verify.sql`](../scripts/database/20260528_quiz_phase3_needs_review_fix_verify.sql) |
| needs_review 内容確認→verified | 9 | 同上 |
| **最終** | verified **2,129** / needs_review **0** | |

**needs_review 17 件の処置内訳**

| 処置 | UUID | 理由 |
|------|------|------|
| 削除 | `43943690`, `9fe2eec5`, `f0e30596` | D-2 正本重複 |
| 削除 | `9c29bab5`, `ba995188` | Tier B（E6B 型 CAS/TAS） |
| 削除 | `4be5ee98` | options 破損（stem と option[0] 結合） |
| 削除 | `069dda53` | 巡航時間欠落・E6B 型燃料計算 |
| 正答修正→verified | `d7fca726` | 揚力: 正答 4→3 |
| 正答修正→verified | `a48c6f58` | 登録機関: 正答 2→1（国土交通省） |
| 正答+解説修正→verified | `4181cbd9` | 日没計算: 正答 2→4（17:00） |
| 解説修正→verified | `01c08418` | ETOPS: 解説を正答（エンジン信頼性）に整合 |
| verified 復帰 | `66276f09`, `98073d7e`, `2869fd4e`, `f9b9d811`, `6de6164d`, `80e3a0d5`, `9235a21e`, `f4735938`, `0a1bad07` | 内容確認 OK |

---

## 3. Tier A — CBT 形式乖離（28 件）

### A-1 航法計算盤（5）

```
23085074-8c1f-43c9-b7b8-18b5abb6a058
317728de-368f-40fc-a739-b16752278957
69bc6a6b-bdf4-4e3b-ac00-a553ac1b13c7
88111e0a-d9d4-41c9-bcb7-2184f7bf88a3
d7c2cebc-e04e-4774-8cec-e2d2435f0ab6
```

### A-2 5 肢問題（6）

```
96ba47fc-ddfc-4730-9836-2093e8549e28
652b3a72-0b04-416a-b2cd-4b21c1455b97
5482dce0-be85-43b4-9ffb-79adac6e1d16
b55d3abd-9d4c-4c8c-a39e-bc6f7ae4db7e
7e7e6f26-7895-472e-871a-9df2bc946e52
8a45911a-1829-46e6-b7f4-34798d0b3083
```

### A-3 「説明せよ」（17）

```
0d7e147b-a3fe-4344-9fb5-18225ebe9899  1dd8d8d2-1f83-47f3-b8ce-17624cbc8ec7
304ba53f-a86c-4806-a948-8a7f9e8edcf6  88841c39-f174-4a14-ac43-1ea857c82e46
8f684ce4-d289-43ca-9dd2-deb44b1ac6b8  96b9fa47-0b29-48ea-b565-e619986da711
98cc55f9-b9f8-4306-9ca4-d985c5404103  a004190a-8b55-4bf6-a272-28552337b3af
a633206a-ca5a-40ad-a568-fa5b2abb67be  b2415d46-5d84-4722-a5af-b3f23532d222
d676b42f-8b8e-4068-858b-5989485e31d1  294ba61c-3bf2-427a-a767-8c2b9888dfc3
57f3068c-28a3-4cc0-8d07-1ad0eeae887d  11ab1c75-91e2-48dc-9261-32136c5b851c
7f070367-23a9-4345-840c-4a66ff441a7f  a2fa6667-d8d3-4d0d-b439-907f9a4ca671
a8936a54-1536-44ec-b846-4d75e9e4946b
```

**重複整理候補（Phase 2 で削除検討）**

| 残す | 削除候補 |
|------|---------|
| `294ba61c` | `57f3068c` |
| `11ab1c75` | `a2fa6667` |
| `7f070367` | `a8936a54` |
| `a004190a` | `0d7e147b` |

---

## 4. Tier D — 法規改正・解説不整合

### 4.1 現行 航空法施行規則 第151条（点検期間）— hourei MCP / e-Gov ファクトチェック（2026-05-28）

| ソース | 結果 |
|--------|------|
| **hourei `get_law_data`**（昭和二十七年運輸省令第五十六号） | 現行 **第151条**は「救急用具は**技術的基準**により点検」に一本化。**第152条は「削除」**（特定救急用具検査制度廃止を確認） |
| **hourei `search_law`** | キーワード検索はヒット精度低（要 `get_law_data` + 法令番号指定） |
| **e-Gov API** | 条文本文と一致。試験で暗記する **60/180/12か月表**は技術的基準側に残存（学科試験・口述定番） |

令和7年運輸省令第56号（2025-04-08）で省令本文の列挙は技術的基準へ委譲されたが、**試験用の期間表は変更なし**。

| 品目 | 点検期間 |
|------|----------|
| 落下傘 | **60日** |
| 非常信号灯・携帯灯・防水携帯灯 | **60日** |
| 救命胴衣・相当救急用具・救命ボート | **180日** |
| 救急箱 | **60日** |
| 非常食糧 | **180日** |
| 航空機用救命無線機 | **12か月** |

**覚え方（口述・試験定番）**: 救命無線機のみ12か月、胴衣・ボート・非常食糧は180日、その他60日。

参考: [mjblog 救急用具](https://mjblog271.com/emergencyequipment/)、[MLIT 装備品改正スライド](https://www.mlit.go.jp/common/001465768.pdf)

### 4.2 令和4年（2022）— 特定救急用具制度廃止（D-1: 2 件）

**規則第152条**に基づく「特定救急用具の国による検査」は **令和4年6月18日施行の改正で廃止**。装備品基準適合証等の一般装備品扱いへ移行。

| UUID | 問題の要点 |
|------|-----------|
| `57977f21-b0d7-4376-ae08-2302bc392c1a` | 「国土交通大臣の検査に合格した特定救急用具」 |
| `fe22181a-26cd-4dbb-9bd1-4e51b6647a12` | 同上（別バリエーション） |

→ **試験範囲外（削除候補）**

### 4.3 救急用具点検期間 — DB 解説の誤り（D-2: 11 件）

verified **19 件**の点検期間問題のうち、**11 件**が解説または正答ロジックで **現行第151条と矛盾**。

**典型誤り**

- 非常信号灯・携帯灯を **180日** と記載（正: **60日**）
- 救急箱・非常食糧を **1年** と記載（正: 救急箱 **60日**、非常食糧 **180日**）

**Phase 1 で needs_review に降格 → D-2 改稿（2026-05-28）**

| 結果 | 件数 | UUID |
|------|------|------|
| **verified 復帰** | 8 | 18051db7, 27ab60f8, 6da02c74, 7990a0c8, a873245e, b469cd6d, bd91f261, eaec3f3e |
| **重複正本あり（needs_review 維持）** | 3 | 43943690 → 9648b962, 9fe2eec5 → b7aeb6a2, f0e30596 → 44af9836 |

SQL: [`scripts/database/20260528_quiz_art151_d2_fix_and_reverify.sql`](../scripts/database/20260528_quiz_art151_d2_fix_and_reverify.sql)

```
18051db7-4b4a-4e9a-a43e-ddcb85880720
27ab60f8-fa2f-429f-ba5b-3d91d7e18aa0
43943690-c691-402c-8349-b62d780828bf
6da02c74-3045-49bb-a852-cb11aed01ae9
7990a0c8-de14-48d6-80f0-9dffab42e24d
9fe2eec5-d1c1-4264-afe1-cbc4ddccc08e
a873245e-7fcd-437e-8772-21d7302d586c
b469cd6d-5532-40af-bd97-bc7055074b81
bd91f261-b509-489f-af56-cabcf88ddb68
f0e30596-4d06-406b-9286-7c91a1b3f59f
eaec3f3e-875a-4756-a0a6-f44b4af35f97
```

**現行法と整合が取れており verified 維持（4）— Phase 2 で正答再確認推奨**

```
44af9836-06c0-4746-91c2-92c540e66830
9648b962-bcdd-4436-abd8-5ec61057598d
41bad5fd-fa0f-4a95-95c5-f081dc7eb410
b7aeb6a2-21ad-406a-b5ce-2a31e507290d
```

### 4.4 今後の改正（監視）

2024-11 航空局パブリックコメント: [救急用具点検の省令・通達改正](http://www.japan-soaring.or.jp/publiccomment_20241126/) — 点検**内容・方法**の見直し案。期間数字の変更は未確認。**施行後に D-2 相当問題を再監査**すること。

---

## 5. Tier B — 変針点 CAS/TAS（2026-05-28 削除済み）

| 区分 | 件数 | 方針 | 結果 |
|------|------|------|------|
| 変針点 CAS/TAS 数値計算 | **141**（verified 139 + needs_review 2） | CBT「航法計算盤不要」と整合せず → **物理削除** | Phase 3 適用済 |
| 「いくつあるか」型 | **641** | 一括削除非推奨。4 択 MCQ として成立するものが多い | 未着手 |
| `sub_subject = '航法'` 粗分類 | **60** | メタデータ再分類 | 未着手 |
| 解説欠落 | **8** | 修正優先 | 未着手 |

監査 SQL: `scripts/database/20260607_audit_unified_cpl_questions.sql`

---

## 6. 推奨フォローアップ

1. **コンテンツ**: PPL 法規 MDX に第151条点検期間の現行表を追加（Quiz と整合）  
2. **コード**: `parseUnifiedCplQuestion` で `options.length !== 4` を **出題除外**（サイレント置換廃止）  
3. **Tier B 残**: 「いくつあるか」641 件・粗分類 60 件・解説欠落 8 件の段階的精査  
4. **3.4.x マッピング**: 変針点 CAS/TAS 削除後、`learning_test_mapping` の空中航法クラスタ件数を再集計

---

## 7. 参照 URL

- [CBT 申請・受験（MLIT）](https://www.mlit.go.jp/koku/koku_tk12_000005.html)
- [CBT 手引き 2026（001633018.pdf）](https://www.mlit.go.jp/koku/content/001633018.pdf)
- [学科試験 過去問・シラバス](https://www.mlit.go.jp/koku/koku_fr10_000025.html)
- [装備品・特定救急用具改正説明（001465768.pdf）](https://www.mlit.go.jp/common/001465768.pdf)
