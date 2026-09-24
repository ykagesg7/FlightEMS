# Flight Academy (FlightAcademyTsx)

航空学習プラットフォーム **Flight Academy** の Web アプリです。React / TypeScript / Vite / Supabase / Vercel を使用し、学習記事（MDX）、クイズ（CPL）、フライトプランニング（地図・METAR/TAF）、ゲーミフィケーションなどを提供します。

## クイックスタート

- **要件**: Node.js **24.x**（Vercel / CI と一致。`package.json` の `engines.node`）、npm 9+。
- **依存関係**: `npm install`
- **環境変数**: ルートの `.env.example` を参照し `.env.local` を作成（`VITE_SUPABASE_*`、`VITE_WEATHER_API_KEY` など）。
- **開発**（推奨）:
  - ターミナル1: `npm run dev:weather`（ローカル API、ポート 3001）
  - ターミナル2: `npm run dev`（Vite、`http://localhost:5173`）
- **テスト**: `npm run test:run` / **Lint**: `npm run lint`

## ドキュメント

| 用途 | ドキュメント |
|------|----------------|
| **全体索引（AI・開発者向け）** | [docs/README.md](docs/README.md)（テーマ別ハブ） |
| **プロダクト成長・段階・NSM** | [docs/Product_North_Star_and_GTM.md](docs/Product_North_Star_and_GTM.md) §0 |
| **現行ワークストリーム** | [docs/01_Current_Status_and_Roadmap.md](docs/01_Current_Status_and_Roadmap.md) |
| **完了サマリ（段階1）** | [docs/Closed_Sprints.md](docs/Closed_Sprints.md) |
| **現行仕様（DB・/test 等）** | [docs/Component_Structure_Guide.md](docs/Component_Structure_Guide.md) |
| **`src/` 構成** | [docs/Component_Structure_Guide.md](docs/Component_Structure_Guide.md) |
| **リポジトリフォルダ索引** | [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) |
| **Cursor MCP** | [docs/Cursor_MCP_Setup.md](docs/Cursor_MCP_Setup.md) |
| **Supabase SQL 索引（短）** | [scripts/database/INDEX.md](scripts/database/INDEX.md) |

過去のルート README にあったマップ操作・CPL 資料の詳細は、上記 `docs/` およびアプリ内ヘルプを参照してください。CPL 試験問題は Supabase（`unified_cpl_questions` 等）に取込済みです。

## ライセンス

リポジトリ方針に従ってください（ルートに `LICENSE` ファイルを追加する場合は本READMEのリンクを追記）。

---

**最終更新**: 2026年9月（GitHub 入口。詳細は `docs/`。DESIGN.md はルートに残す）
