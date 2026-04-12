# Scripts（ドキュメント索引）

実行スクリプトの実体はリポジトリの **`scripts/`** 配下にあります。本ページは**人向けの説明と正本リンク**を集約します。

| トピック | 正本 / 場所 |
|----------|-------------|
| ディレクトリ一覧・実行例（概要） | [scripts/README.md](../../scripts/README.md)（短いポインタのみ） |
| CPL Master CSV → DB 取込仕様 | [CPL_CSV_IMPORT_SPEC.md](CPL_CSV_IMPORT_SPEC.md) |
| ドキュメント自動更新（watch / validate） | [Docs_Auto_Update.md](Docs_Auto_Update.md)（実装は `scripts/docs-auto-update/`） |
| Git コミットメッセージ（英語・Conventional Commits） | [.cursor/rules/git-conventions.mdc](../../.cursor/rules/git-conventions.mdc) |
| Windows でのコミット文字化け対策（補足） | [Git_Commit_Encoding.md](Git_Commit_Encoding.md) |

ルートからの npm スクリプト例: `npm run cpl:import`、`npm run docs:update`、`npm run sync:public-docs`。
