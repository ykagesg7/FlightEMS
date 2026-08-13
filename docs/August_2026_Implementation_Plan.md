# 2026年8月期 実装・コンテンツ計画（Phase D 入口）

**作成日**: 2026-07-25  
**最終更新**: 2026-08-12（W35 八月末ゲート + CBT 第3バッチ完走）  
**位置づけ**: [Phase D](01_Current_Status_and_Roadmap.md)（2026年8–12月）の **第1ヶ月**。7月スプリント完了後の実行計画。戦略の正本は [00](00_Flight_Academy_Strategy.md)、ロードマップ KPI は [01](01_Current_Status_and_Roadmap.md)、長期バックログは [06](06_Long_Term_Execution.md)。

**週次の正本**: [05_Content_Pipeline.md](05_Content_Pipeline.md) Phase 2 **週次着手記録表**（**2026-W31〜W35**）。Articles 運用は [ops/Weekend_Content_Pipeline.md](ops/Weekend_Content_Pipeline.md)。

**七月からの引き継ぎ（2026-07-25 ゲート）**:

| 指標 | 値 |
|------|-----|
| PPL 登録 | **63/150**（Subject 1〜5 登録済・3/4 Phase 1 完走） |
| Callout 法規 | **8/8** |
| mapping | **140 行 / 111 記事** |
| verified 未マッピング | 総 **112**（うち CBT 約 **102**、レガシー **10**） |
| `src` Statements | **21.18%** |
| C-1〜C-5 | 未承認・コード未着手 |
| 試験明け Action2/3 | [July §7](July_2026_Implementation_Plan.md) — 検討深化待ち |

**直近スナップショット（2026-08-12）**:

| 指標 | 値 |
|------|-----|
| `learning_contents` | **153**（PPL **64** / メンタリティー **25** 等） |
| mapping | **147 行 / 112 記事** |
| 未マッピング総 | **10**（レガシー **10**・CBT **0**） |
| PPL | **64/150**（+ `PPL-2-3-3` Phase 2 第1本） |
| CBT | **暫定束ね 104/104 完走**（5 科目ハブ）。Action2/3 **方針メモ済** |
| `src` Statements | **21.17%**（W35 ゲート・7728/36505） |

---

## 1. 8月期末の「DONE」条件（再整理）

| 種別 | 2026-08 末までの DONE 条件 | 進捗（2026-08-12） |
|------|---------------------------|-------------------|
| **ゲート・記録** | coverage `src` **≥21.18%** を 01 または Phase_C に 1 行 | **実施済**（**21.17%**・src 増加により -0.01pt。507 tests 緑） |
| **週次パイプライン** | W31〜W35 を [05](05_Content_Pipeline.md) に各週 1 行 | **W31〜W35 追記済** |
| **CBT例題** | [方針メモ](CBT_Example_Reclassification_Memo.md) + **≥1 バッチ** | **済**（暫定束ね **104/104** 完走） |
| **PPL（Phase D）** | `2-3-3`/`2-3-4` **≥1** または Callout/深文化 1 | **済**（`PPL-2-3-3`） |
| **試験明け UX** | Action2/3 **方針メモ**（実装は承認後） | **済**（A2-a **実装済** 2026-08-12） |
| **C-1〜C-5** | 承認時のみ | 未承認 |

---

## 2. ISO 週（再整理後）

| 週（ISO） | 目安締め | フォーカス | 状態 |
|-----------|----------|------------|------|
| **2026-W31** | 〜08-05 | Articles 準備・週末パイプライン。学科 CBT は後追い | **実績記録済** |
| **2026-W32** | 〜08-12 | Articles `4.1.x` ドリップ。Action2/3 は W34 へ | **実績記録済** |
| **2026-W33** | 〜08-19 | Articles `4.2.x` + CBT 方針・第1バッチ | **実績記録済** |
| **2026-W34** | 〜08-26 | CBT 第2バッチ + Action2/3 メモ + PPL-2-3-3 | **実績記録済** |
| **2026-W35** | 〜08-31 | **八月末ゲート** + CBT 第3バッチ（工学+法規） | **実績記録済** |

---

## 3. 優先順位（2026-08-12 改訂）

| 優先 | テーマ | 8月の役割 | Phase D |
|------|--------|-----------|---------|
| **1** | **Articles ドリップ運用** | 止めない（公開確認・登録・digest） | 成長・LTV |
| **2** | **CBT 暫定束ね** | **済** — **104/104** 完走（9月: Phase B 再分類） | D-1 隣接 |
| **3** | **Action2/3 方針メモ** | **済** — A2-a **実装済**（9月: 効果測定） | D-5 |
| **4** | **PPL 二次** | **済** `PPL-2-3-3`（64/150） | D-4 |
| **5** | **カバレッジ** | **21.17%**（W35 ゲート実施） | D-2 |
| **6** | **C-1〜C-5** | 承認がなければ着手しない | 公開準備 |

**スコープ外（8月 FA・2026-08-13 更新）**: Notion 実技正本の学習者向け公開。USAF/FMT は **即時連載ではなくストック**。平日ドリップの補給に使う（[FMT_Formation_2026](content_outlines/FMT_Formation_2026/README.md)）。

---

## 4. CBT例題バックログ

正本: [CBT_Example_Reclassification_Memo.md](CBT_Example_Reclassification_Memo.md)

| main_subject | 件数 | 暫定先 | 状態 |
|--------------|-----:|--------|------|
| 航空通信 | 11 | `CPL-Hub-Communication` | **2026-08-12 済** |
| 航空気象 | 18 | `CPL-Hub-Meteorology` | **2026-08-12 済** |
| 空中航法 | 18 | `CPL-Hub-Navigation` | **2026-08-12 済** |
| 航空工学 | 26 | `engineering_basics` | **2026-08-12 済** |
| 航空法規 | 31 | `3.1.1_AviationLegal0` | **2026-08-12 済** |
| **残** | **0**（CBT） / **10**（レガシー） | — | CBT 暫定束ね完走 |

---

## 5. 原則・禁止（継続）

| 項目 | 内容 |
|------|------|
| 依存バージョン | 無承認で `package.json` をバンプしない |
| UI/UX | 無承認のレイアウト・トークン変更をしない（Action2 は明示承認） |
| SQL 本番 | MCP 適用後 INDEX + [14](Article_Coverage_Backlog.md) を一致 |
| コミット | 英語・Conventional Commits |

---

## 6. 参照

| 役割 | パス |
|------|------|
| 七月 DONE・ゲート | [July_2026_Implementation_Plan.md](July_2026_Implementation_Plan.md)、[July_2026_Content_Sprint.md](July_2026_Content_Sprint.md) |
| Phase D KPI | [01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md) |
| マッピング | [Article_Coverage_Backlog.md](Article_Coverage_Backlog.md) |
| CBT 方針 | [CBT_Example_Reclassification_Memo.md](CBT_Example_Reclassification_Memo.md) |
| Action2/3 | [Post_Exam_Action2_Action3_Policy_Memo.md](Post_Exam_Action2_Action3_Policy_Memo.md) |
| Articles 運用 | [ops/Weekend_Content_Pipeline.md](ops/Weekend_Content_Pipeline.md) |
| 試験明け UX | July 実装計画 §7 |
| NSM / ALPM | [Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md) |

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-08-12 | 9月計画起票 — [September_2026_Implementation_Plan.md](September_2026_Implementation_Plan.md) |
| 2026-08-12 | W35: 八月末ゲート + CBT 工学+法規。CBT 暫定束ね完走。 |
| 2026-08-12 | W34: CBT 気象+航法、PPL-2-3-3、Action2/3 方針。Articles 優先順位反映。 |
| 2026-07-25 | 初版。W30 ゲート数値を引き継ぎ。CBT例題・Action2/3・PPL 二次・Phase D 境界。 |
