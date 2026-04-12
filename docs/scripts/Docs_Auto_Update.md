# ドキュメント自動更新システム

**実装ディレクトリ**: `scripts/docs-auto-update/`（`package.json` は当該サブパッケージ内）

## ルートからのコマンド

```bash
npm run docs:watch    # scripts/docs-auto-update で watch
npm run docs:update   # 手動更新
npm run docs:validate # 品質チェック
npm run docs:setup    # npm install + setup-git-hooks
```

## 初回セットアップ（Git Hooks）

```bash
cd scripts/docs-auto-update
npm install
node setup-git-hooks.js
```

## 監視・更新の詳細

- **監視対象**: `src/**/*.{ts,tsx}`, `package.json`, `vite.config.ts`, `docs/**/*.md` 等（`watch-changes.js` 参照）
- **品質チェック**: `validate-docs.js`（必須ファイル、リンク、構造）
- **ログ**: `scripts/docs-auto-update/logs/`

詳細なトラブルシューティング・設定一覧は、必要に応じて `scripts/docs-auto-update/` 内の各 `.js` を直接参照してください。
