# Phase C 準備 — 自動検出メモ（監査のみ）

**日付**: 2026-05-06  
**方針**: [Phase_C_Quality_Preparation.md](../docs/Phase_C_Quality_Preparation.md) §2–§3。**UI 修正は行わない**。

## 実行内容（このターン）

| 手段 | 対象（本番 URL 例） | 出力 |
|------|---------------------|------|
| Chrome DevTools — **Issues / Accessibility** の自動検出一覧 | `/`（Home）、`/articles`、`/test` | スクリーンショットは別紙。レポジトリには**パス一覧と「要 Phase C で仕分け」フラグのみ**を残す。 |
| （任意）axe DevTools | 上記と同義 | CI 未導入。HTML ログは未取得のとき本ファイルのみでゲートする。 |

## 備考

- Lighthouse HTML はローカルに `lighthouse-YYYYMMDD.html` 形式で溜める運用が [Phase_C](../docs/Phase_C_Quality_Preparation.md) §2。本環境では**ファイル未添付**。再実行時は同パスへ追記。
