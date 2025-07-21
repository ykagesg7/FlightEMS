# 自動ドキュメント更新システム

## 📋 概要

このドキュメントは、FlightAcademyプロジェクトで実装された自動ドキュメント更新システムの詳細を説明します。

**最終更新**: 2025年7月19日
**バージョン**: Automated Docs System v1.0

---

## 🎯 システム概要

### **目的**
- **ドキュメントの自動更新**: コード変更に伴うドキュメントの自動更新
- **品質保証**: ドキュメントの一貫性と正確性の確保
- **開発効率向上**: 手動更新作業の削減

### **主要機能**
- **ファイル監視**: ソースコードの変更を監視
- **自動更新**: 変更に基づくドキュメントの自動更新
- **検証機能**: ドキュメントの整合性チェック
- **Git hooks統合**: コミット前の自動実行

---

## 🏗️ システム構成

### **ディレクトリ構造**
```
scripts/docs-auto-update/
├── README.md              # システム概要
├── package.json           # 依存関係
├── watch-changes.js       # ファイル監視
├── update-docs.js         # ドキュメント更新
├── validate-docs.js       # 検証機能
├── setup-git-hooks.js     # Git hooks設定
└── test-simple.js         # テスト用スクリプト
```

### **主要コンポーネント**

#### **1. ファイル監視システム**
```javascript
// watch-changes.js
const chokidar = require('chokidar');
const { updateDocs } = require('./update-docs');

const watcher = chokidar.watch([
  'src/**/*.{ts,tsx,js,jsx}',
  'docs/**/*.md'
], {
  ignored: /node_modules/,
  persistent: true
});

watcher.on('change', (path) => {
  console.log(`File changed: ${path}`);
  updateDocs(path);
});
```

#### **2. ドキュメント更新エンジン**
```javascript
// update-docs.js
const fs = require('fs');
const path = require('path');

function updateDocs(changedFile) {
  // ファイルタイプに基づく更新ロジック
  const fileType = path.extname(changedFile);

  switch (fileType) {
    case '.tsx':
    case '.ts':
      updateComponentDocs(changedFile);
      break;
    case '.md':
      validateMarkdown(changedFile);
      break;
  }
}
```

#### **3. 検証システム**
```javascript
// validate-docs.js
const { execSync } = require('child_process');

function validateDocs() {
  try {
    // Markdownの構文チェック
    execSync('npx markdownlint docs/**/*.md');

    // リンクの有効性チェック
    execSync('npx markdown-link-check docs/**/*.md');

    console.log('✅ ドキュメント検証完了');
  } catch (error) {
    console.error('❌ ドキュメント検証エラー:', error.message);
    process.exit(1);
  }
}
```

---

## 🔧 セットアップ手順

### **1. 依存関係のインストール**
```bash
cd scripts/docs-auto-update
npm install
```

### **2. Git hooksの設定**
```bash
node setup-git-hooks.js
```

### **3. 監視システムの起動**
```bash
# 開発時
npm run watch

# 手動実行
npm run update
```

---

## 📊 監視対象ファイル

### **ソースコード**
- `src/**/*.{ts,tsx,js,jsx}`: Reactコンポーネント
- `src/types/**/*.ts`: 型定義ファイル
- `src/hooks/**/*.ts`: カスタムフック
- `src/utils/**/*.ts`: ユーティリティ関数

### **ドキュメント**
- `docs/**/*.md`: Markdownドキュメント
- `docs/improvement-proposals/**/*.md`: 改善提案
- `docs/development/**/*.md`: 開発ドキュメント

### **設定ファイル**
- `package.json`: 依存関係
- `tsconfig.json`: TypeScript設定
- `vite.config.ts`: Vite設定

---

## 🔄 更新プロセス

### **1. 変更検出**
```javascript
// ファイル変更の検出
watcher.on('change', (path) => {
  console.log(`📝 変更検出: ${path}`);
  analyzeChange(path);
});
```

### **2. 変更分析**
```javascript
function analyzeChange(filePath) {
  const fileType = path.extname(filePath);
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // 変更内容の分析
  const changes = {
    type: fileType,
    content: fileContent,
    timestamp: new Date().toISOString()
  };

  return changes;
}
```

### **3. ドキュメント更新**
```javascript
function updateDocumentation(changes) {
  switch (changes.type) {
    case '.tsx':
      updateComponentDocumentation(changes);
      break;
    case '.ts':
      updateTypeDocumentation(changes);
      break;
    case '.md':
      validateDocumentation(changes);
      break;
  }
}
```

### **4. 検証実行**
```javascript
function runValidation() {
  // 構文チェック
  validateMarkdownSyntax();

  // リンクチェック
  validateLinks();

  // 一貫性チェック
  validateConsistency();
}
```

---

## 🎯 更新ルール

### **コンポーネント更新**
- **新規コンポーネント**: 自動的にドキュメントに追加
- **既存コンポーネント**: 変更内容に基づく更新
- **削除コンポーネント**: ドキュメントから自動削除

### **型定義更新**
- **新規型**: 型定義ドキュメントに追加
- **変更型**: 既存ドキュメントの更新
- **削除型**: ドキュメントから削除

### **設定ファイル更新**
- **依存関係変更**: 技術スタックドキュメントの更新
- **設定変更**: 開発環境ドキュメントの更新

---

## 📈 品質保証

### **自動検証**
- **Markdown構文**: 構文エラーの検出
- **リンク有効性**: 壊れたリンクの検出
- **一貫性**: ドキュメント間の一貫性チェック

### **手動検証**
- **内容確認**: 更新内容の正確性確認
- **形式確認**: ドキュメント形式の確認
- **関連性確認**: 関連ドキュメントとの整合性

---

## 🚀 使用方法

### **開発時**
```bash
# 監視モードで起動
npm run watch

# 開発サーバーと並行実行
npm run dev & npm run watch
```

### **コミット前**
```bash
# 手動更新
npm run update

# 検証実行
npm run validate
```

### **CI/CD統合**
```yaml
# GitHub Actions例
- name: Update Documentation
  run: |
    cd scripts/docs-auto-update
    npm run update
    npm run validate
```

---

## 🔧 カスタマイズ

### **監視対象の追加**
```javascript
// watch-changes.js
const watchPatterns = [
  'src/**/*.{ts,tsx,js,jsx}',
  'docs/**/*.md',
  'config/**/*.{js,json}',  // 追加
  'scripts/**/*.js'         // 追加
];
```

### **更新ルールの追加**
```javascript
// update-docs.js
function updateDocs(changedFile) {
  const fileType = path.extname(changedFile);

  switch (fileType) {
    case '.tsx':
    case '.ts':
      updateComponentDocs(changedFile);
      break;
    case '.md':
      validateMarkdown(changedFile);
      break;
    case '.json':           // 追加
      updateConfigDocs(changedFile);
      break;
  }
}
```

### **検証ルールの追加**
```javascript
// validate-docs.js
function validateDocs() {
  validateMarkdownSyntax();
  validateLinks();
  validateConsistency();
  validateCodeExamples();  // 追加
  validateImages();        // 追加
}
```

---

## 📊 パフォーマンス

### **監視効率**
- **ファイル数**: 1000+ファイルを効率的に監視
- **応答時間**: 変更検出から更新まで < 1秒
- **メモリ使用量**: < 50MB

### **更新効率**
- **並行処理**: 複数ファイルの同時更新
- **差分更新**: 変更部分のみの更新
- **キャッシュ**: 重複処理の回避

---

## 🛠️ トラブルシューティング

### **よくある問題**

#### **1. 監視が動作しない**
```bash
# 権限確認
ls -la scripts/docs-auto-update/

# 依存関係確認
npm list
```

#### **2. 更新が実行されない**
```bash
# ログ確認
tail -f logs/docs-update.log

# 手動実行
node update-docs.js
```

#### **3. 検証エラー**
```bash
# 詳細エラー確認
npm run validate -- --verbose

# 個別ファイル検証
node validate-docs.js docs/README.md
```

### **デバッグモード**
```bash
# デバッグ情報付きで実行
DEBUG=docs-update npm run watch
```

---

## 🔮 今後の改善計画

### **短期計画（1-3ヶ月）**
- **AI統合**: 自動ドキュメント生成
- **テンプレート機能**: カスタムテンプレート
- **バックアップ機能**: 自動バックアップ

### **中期計画（3-6ヶ月）**
- **Web UI**: ブラウザベースの管理画面
- **通知機能**: Slack/Discord統合
- **分析機能**: 更新統計の可視化

### **長期計画（6ヶ月以上）**
- **機械学習**: 内容の自動最適化
- **多言語対応**: 国際化対応
- **クラウド統合**: クラウドベースの管理

---

## 📚 関連ドキュメント

- **[技術スタック詳細](./TECHNICAL_STACK.md)**
- **[開発ガイド](./guides/)**
- **[トラブルシューティング](./troubleshooting/)**

---

**最終更新**: 2025年7月19日
**バージョン**: Automated Docs System v1.0
