# 完了スプリント索引（2026-05〜09）

**最終更新**: 2026-09-20  
**ライブ正本**: 実行中の状態は [01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md)。週次の着手行は [05_Content_Pipeline.md](05_Content_Pipeline.md) Phase 2 表。Articles 運用は [ops/Weekend_Content_Pipeline.md](ops/Weekend_Content_Pipeline.md)。

月次 Implementation / Content Sprint ファイル（May Late〜September、計 7 本）は **完了ログの重複**だったため削除した。全文は Git 履歴。10月以降の月次ファイルは起票しない。

## 畳み込んだファイル

| ファイル（削除） | 最終 git | 根拠 |
|------------------|----------|------|
| May_2026_Late_Content_Sprint | 2026-09-19 | W20〜W22 完了。週次は 05。 |
| June_2026_Implementation_Plan | 2026-06-21 | W23〜W26 完了。01 v4.0.34。 |
| June_2026_Content_Sprint | 2026-07-01 | 同上の週次メモ重複。 |
| July_2026_Implementation_Plan | 2026-07-16 | W27〜W30・Phase C クローズ。01 v4.0.41。 |
| July_2026_Content_Sprint | 2026-07-22 | 同上の週次メモ重複。 |
| August_2026_Implementation_Plan | 2026-08-13 | W31〜W35 完了と自己申告。週次は 05。 |
| September_2026_Implementation_Plan | 2026-08-13 | 作成後 **一度も週次状態を更新していない**（W36〜W40 が全て「予定」のまま）。 |

復元: `git log -- docs/<filename>.md`。

## 月次 DONE（01 / 05 と一致する範囲だけ）

| 月 | ISO 週 | 残してよい事実 |
|----|--------|----------------|
| 5月後半 | W20〜W22 | `3.2.7`〜`3.2.9` 深文化と対応 PPL。Gemini 素案は実装後削除済み。 |
| 6月 | W23〜W26 | PPL Subject 2 Phase 1 **12/12**。`src` **18.07%**（当時）。 |
| 7月 | W27〜W30 | Subject 3/4 Phase 1 完走。Callout 法規 8/8。`src` **21.18%**。C-1〜C-5 未承認。 |
| 8月 | W31〜W35 | Articles ドリップ継続。CBT 暫定束ね **104/104** は 05 の記録。A2-a 実装（科目 default 5問）。coverage **21.17%**。 |
| 9月 | W36〜W40 | **守れたのは週3本の CP ドリップだけ。** A2-a は GA4 `quiz_*` が連続 0 のため判定不能。CBT Phase B・PPL-2-3-4 は未着手。10月計画ファイルは作らない。 |

## 欠ファイルだったメモ（作らない）

次のリンク先は **git に一度も存在しない**（`git log -- <path>` が空）。本文を捏造しない。

| 欠ファイル | 代わりに読む場所 |
|------------|------------------|
| CBT_Example_Reclassification_Memo | 05 の **W33〜W35** 行（暫定束ねの記録）。SQL `20260812_learning_test_mapping_cbt_*` も **リポジトリに無い**。 |
| Post_Exam_Action2_Action3_Policy_Memo | 01 の A2-a 行、[02_System_Spec.md](02_System_Spec.md) の Quiz 節。成功指標の「2週連続改善」は母数不足で未判定。 |

## PPL-2-3-3 / 2-3-4

- **2-3-3**: 01 / 05 は W34 で「深文化 + mapping」と書く。`src/content/lessons/` に MDX は無い。`20260812_*ppl233*.sql` も git に無い。残っているのは [骨子](content_outlines/PPL_Meteorology_2026/PPL-2-3-3_gemini_brief.md) のみ。
- **2-3-4**: 未執筆。骨子のみ [PPL-2-3-4_gemini_brief.md](content_outlines/PPL_Meteorology_2026/PPL-2-3-4_gemini_brief.md)。
