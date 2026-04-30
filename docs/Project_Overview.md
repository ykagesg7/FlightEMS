# Flight Academy プロジェクト概要ガイド

> **要約の正本**: プロジェクト全体のクイックリファレンス・インデックスは **[docs/README.md](README.md)**。本書は**推奨読み順用の入口**であり、機能一覧・技術スタックの**詳細は README の各節**を参照してください（本書にあった長文は 2026-04 に README 側へ集約）。

## このドキュメントを読むべき人

- **AIアシスタント**: プロジェクトの機能と技術スタックを把握する前の入口
- **新規開発者**: 主要機能の全体像をつかむ前の入口
- **ステークホルダー**: 機能一覧の要約を知りたい場合

**推奨読み順**: [docs/README.md](README.md) → [00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md) → 本書（任意）→ [02_System_Spec.md](02_System_Spec.md)（ルーティング・DB の深掘り）

---

## 一段落概要

Flight Academy は、独立した航空学習プラットフォームです。React・TypeScript・Supabase を基盤とし、PPL/CPL 学科対策コンテンツ、フライトプランニング、ゲーミフィケーション、コミュニティ機能を提供します。事業用操縦士**学科**の自学支援と、個人運営の持続可能性を価値とし、戦略・KPI は [00](00_Flight_Academy_Strategy.md)・[01](01_Current_Status_and_Roadmap.md) を正とします。

---

## 詳細はどこを読むか

| 知りたいこと | 参照先 |
|--------------|--------|
| コア機能・技術スタック・外部 API | [docs/README.md](README.md)（「プロジェクト概要」「コア機能」「技術スタック」） |
| 実装状況・KPI | [README](README.md)「現在の実装状況」・[01](01_Current_Status_and_Roadmap.md) |
| `src/` 配置・コンポーネント規約 | [Component_Structure_Guide.md](Component_Structure_Guide.md) |
| ルーティング・ブログリダイレクト・DB | [02_System_Spec.md](02_System_Spec.md) |
| 記事パイプライン・ID 正本 | [Docs_Consistency_Decisions.md](Docs_Consistency_Decisions.md)・[05](05_Content_Pipeline.md) |
| 長期品質・分析（旧 12 含む） | [06_Long_Term_Execution.md](06_Long_Term_Execution.md) |

---

**最終更新**: 2026-04-25（薄型化: 重複本文を [docs/README.md](README.md) へ集約）  
**バージョン**: Project Overview Guide v4.0（入口専用）
