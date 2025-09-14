# 📚 FlightAcademyTsx ドキュメント自動更新システム

## 概要

このシステムは、FlightAcademyTsxプロジェクトのドキュメントを自動的に更新・管理するための包括的なソリューションです。重要な変更の自動検出、ドキュメント更新、品質チェック、レビュープロセスを統合しています。

## 🚀 機能

### 1. 自動変更検出
- **ファイル監視**: 重要なファイルの変更をリアルタイムで検出
- **キーワード検出**: Phase、TODO、FIXME等の重要なキーワードを自動識別
- **設定ファイル監視**: package.json、vite.config.ts等の設定変更を追跡

### 2. ドキュメント自動更新
- **README.md更新**: 最終更新日、技術スタック情報の自動更新
- **ROADMAP.md更新**: 更新履歴の自動追加
- **FEATURES.md更新**: 新機能情報の自動反映
- **技術スタック同期**: package.jsonとドキュメントの整合性確保

### 3. 品質チェック・レビュー
- **ドキュメント構造検証**: 必須ファイルの存在確認
- **内容品質チェック**: ファイルサイズ、タイトル、目次構造の検証
- **リンク検証**: 破損した内部リンクの検出
- **技術スタック整合性**: バージョン情報の整合性チェック

### 4. Git Hooks統合
- **pre-commit**: コミット前の品質チェック
- **post-commit**: コミット後のドキュメント自動更新
- **pre-push**: プッシュ前の最終品質チェック

## 📦 インストール

```bash
# 依存関係のインストール
cd scripts/docs-auto-update
npm install

# Git Hooksの設定
node setup-git-hooks.js
```

## 🛠️ 使用方法

### 基本的な使用方法

```bash
# ファイル監視の開始
npm run watch

# 手動でドキュメント更新
npm run update-docs

# 品質チェックの実行
npm run validate-docs

# レポート生成
npm run generate-report
```

### 開発ワークフロー

1. **開発開始時**
   ```bash
   npm run watch  # ファイル監視を開始
   ```

2. **コミット時** (自動実行)
   - pre-commit: 品質チェック
   - post-commit: ドキュメント更新

3. **プッシュ時** (自動実行)
   - pre-push: 最終品質チェック

### 手動実行

```bash
# 特定のドキュメントのみ更新
node update-docs.js

# 品質チェックのみ実行
node validate-docs.js

# 変更監視のみ実行
node watch-changes.js
```

## 📁 ファイル構成

```
scripts/docs-auto-update/
├── package.json              # 依存関係定義
├── README.md                 # このファイル
├── watch-changes.js          # ファイル変更監視
├── update-docs.js            # ドキュメント自動更新
├── validate-docs.js          # 品質チェック・レビュー
├── generate-report.js        # レポート生成
├── setup-git-hooks.js        # Git Hooks設定
└── logs/                     # ログファイル
    ├── changes.log           # 変更ログ
    ├── doc-updates.log       # 更新ログ
    └── validation-report.md  # 品質チェックレポート
```

## ⚙️ 設定

### 監視対象ファイル

`watch-changes.js` で設定可能:

```javascript
const WATCH_PATTERNS = [
  'src/**/*.{ts,tsx,js,jsx}',
  'package.json',
  'vite.config.ts',
  'tsconfig*.json',
  'docs/**/*.md',
  'scripts/**/*.{js,ts}'
];
```

### 重要なキーワード

```javascript
const IMPORTANT_KEYWORDS = [
  'Phase',
  'TODO',
  'FIXME',
  'HACK',
  'BREAKING',
  'FEATURE',
  'BUGFIX',
  'SECURITY',
  'PERFORMANCE'
];
```

## 📊 品質指標

システムは以下の品質指標を追跡します：

- **ドキュメント数**: 総Markdownファイル数
- **エラー率**: エラーが発生したファイルの割合
- **警告率**: 警告が発生したファイルの割合
- **リンク健全性**: 破損したリンクの数
- **技術スタック整合性**: バージョン不一致の数

## 🔧 カスタマイズ

### 新しいドキュメントタイプの追加

`update-docs.js` の `DocUpdater` クラスに新しいメソッドを追加：

```javascript
async updateCustomDoc(projectInfo) {
  const customPath = join(this.docsDir, 'CUSTOM.md');
  if (!existsSync(customPath)) return;

  let content = readFileSync(customPath, 'utf-8');
  // カスタム更新ロジック
  writeFileSync(customPath, content);
}
```

### 新しい品質チェックの追加

`validate-docs.js` の `DocValidator` クラスに新しいメソッドを追加：

```javascript
async validateCustomRule() {
  // カスタム検証ロジック
  this.validationResults.push('✅ カスタムルールチェック完了');
}
```

## 🚨 トラブルシューティング

### よくある問題

1. **Git Hooksが実行されない**
   ```bash
   # 実行権限を確認
   ls -la .git/hooks/

   # 権限を付与
   chmod +x .git/hooks/pre-commit
   chmod +x .git/hooks/post-commit
   chmod +x .git/hooks/pre-push
   ```

2. **ファイル監視が動作しない**
   ```bash
   # 依存関係を再インストール
   npm install

   # 手動で監視開始
   node watch-changes.js
   ```

3. **品質チェックでエラーが発生**
   ```bash
   # 詳細なレポートを確認
   cat logs/validation-report.md

   # 特定のファイルをチェック
   node validate-docs.js
   ```

### ログファイルの確認

```bash
# 変更ログ
tail -f logs/changes.log

# 更新ログ
tail -f logs/doc-updates.log

# 品質チェックレポート
cat logs/validation-report.md
```

## 📈 パフォーマンス

- **ファイル監視**: リアルタイム（数秒以内の検出）
- **ドキュメント更新**: 通常1-3秒
- **品質チェック**: 通常5-10秒
- **Git Hooks**: コミット時間に+2-5秒

## 🔮 今後の拡張予定

- [ ] **AI支援レビュー**: 自然言語処理による内容品質評価
- [ ] **自動要約生成**: 変更内容の自動要約
- [ ] **多言語対応**: 英語ドキュメントの自動生成
- [ ] **視覚的レポート**: ダッシュボード形式の品質レポート
- [ ] **CI/CD統合**: GitHub Actionsとの連携強化

## 🤝 コントリビューション

このシステムの改善にご協力いただける場合は、以下の手順でお願いします：

1. イシューの作成
2. ブランチの作成
3. 変更の実装
4. テストの実行
5. プルリクエストの作成

## 📄 ライセンス

このプロジェクトはFlightAcademyTsxプロジェクトの一部として管理されています。

---

**最終更新**: 2025年1月27日
**バージョン**: 1.0.0
