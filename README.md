# Flight Academy (FlightAcademyTsx)

航空学習プラットフォーム **Flight Academy** の Web アプリです。React / TypeScript / Vite / Supabase / Vercel を使用し、学習記事（MDX）、クイズ（CPL）、フライトプランニング（地図・METAR/TAF）、ゲーミフィケーションなどを提供します。

## クイックスタート

- **要件**: Node.js 18+、npm 9+ を推奨（古い README の 16.x 記載は廃止）。
- **依存関係**: `npm install`
- **環境変数**: ルートの `.env.example` を参照し `.env.local` を作成（`VITE_SUPABASE_*`、`VITE_WEATHER_API_KEY` など）。
- **開発**（推奨）:
  - ターミナル1: `npm run dev:weather`（ローカル API、ポート 3001）
  - ターミナル2: `npm run dev`（Vite、`http://localhost:5173`）
- **テスト**: `npm run test:run` / **Lint**: `npm run lint`

## ドキュメント

| 用途 | ドキュメント |
|------|----------------|
| **全体索引（AI・開発者向け）** | [docs/README.md](docs/README.md) |
| **戦略・Phase / KPI** | [docs/00_Flight_Academy_Strategy.md](docs/00_Flight_Academy_Strategy.md)、[docs/01_Current_Status_and_Roadmap.md](docs/01_Current_Status_and_Roadmap.md) |
| **現行仕様（DB・/test 等）** | [docs/02_System_Spec.md](docs/02_System_Spec.md) |
| **`src/` 構成** | [docs/Component_Structure_Guide.md](docs/Component_Structure_Guide.md) |
| **リポジトリフォルダ索引** | [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) |
| **Cursor MCP** | [docs/Cursor_MCP_Setup.md](docs/Cursor_MCP_Setup.md) |
| **長期実行計画** | [docs/06_Long_Term_Execution.md](docs/06_Long_Term_Execution.md)（[docs/README.md](docs/README.md) からも導線あり） |

過去のルート README にあったマップ操作・CPL 資料の詳細は、上記 `docs/` およびアプリ内ヘルプを参照してください。`cpl_exam_data/` の実データは `.gitignore` 対象の場合があります。

## ライセンス

リポジトリ方針に従ってください（ルートに `LICENSE` ファイルを追加する場合は本READMEのリンクを追記）。

---

**最終更新**: 2026年4月
