# GeminiCLI 対話環境使用ガイド

## 📝 概要

FlightAcademyTsxプロジェクトにGoogle GeminiCLI v0.1.7が正常に構築され、プロジェクト分析と開発支援のための対話環境が利用可能になりました。

## 🚀 基本使用方法

### 1. シンプルな対話
```bash
# 基本的な質問
echo "TypeScriptの型エラーを解決する方法は？" | gemini

# プロジェクト固有の質問
echo "認証システムの改善提案をしてください" | gemini
```

### 2. デバッグモード
```bash
# 詳細なデバッグ情報を表示
echo "プロジェクト構造を分析してください" | gemini -d
```

### 3. インタラクティブモード
```bash
# 継続的な対話セッション
gemini
```

## 🎯 効果的な質問例

### Phase 4 開発支援
```bash
echo "Phase 4（パフォーマンス最適化）の具体的な実装計画を提案してください" | gemini
```

### コード品質改善
```bash
echo "src/components/ディレクトリの構造最適化を提案してください" | gemini
```

### 技術的課題解決
```bash
echo "React 18のConcurrent Features活用方法を提案してください" | gemini
```

## ⚙️ 設定詳細

### 現在の設定
- **モデル**: gemini-2.5-pro（デフォルト）
- **デバッグ**: 有効
- **テレメトリ**: 無効
- **ファイルスキャン**: プロジェクト全体（最大200ディレクトリ）

### 設定ファイル
```json
{
  "defaultModel": "gemini-2.5-pro",
  "debug": true,
  "context": {
    "maxFileSize": "1MB",
    "excludePatterns": [
      "node_modules", "dist", "build", ".next", "*.log", "*.tmp", ".venv"
    ]
  }
}
```

## 🔧 高度な使用例

### 1. ファイル分析
```bash
# 特定ファイルの分析
echo "src/App.tsx の構造を分析し、改善提案をしてください" | gemini

# 複数ファイルの比較
echo "認証関連ファイルの一貫性を確認してください" | gemini
```

### 2. 型安全性チェック
```bash
# 型エラーの特定と修正
echo "プロジェクト全体のTypeScript型エラーを検出し、修正方法を提案してください" | gemini
```

### 3. パフォーマンス分析
```bash
# Bundle サイズ最適化
echo "Viteバンドルサイズの最適化方法を提案してください" | gemini

# React パフォーマンス
echo "Reactコンポーネントのレンダリング最適化を提案してください" | gemini
```

## 📋 コンテキスト情報

GeminiCLIは以下の情報を自動的に認識しています：

### プロジェクト構造
- ✅ React 18 + TypeScript + Vite
- ✅ Supabase（認証・データベース）
- ✅ Tailwind CSS スタイリング
- ✅ Zustand 状態管理

### 開発状況
- ✅ Phase 1: 基盤構築 (完了)
- ✅ Phase 2: コンポーネント分割 (完了)
- ✅ Phase 3: any型削除・型安全性強化 (85%完了)
- 🔄 Phase 4: パフォーマンス最適化・UX改善 (推奨)

### アーキテクチャ情報
- 認証システム（Supabase Auth）
- 学習管理システム
- 地図機能（Leaflet）
- クイズ・試験システム

## 🎯 最適な質問テンプレート

### 分析系
```bash
echo "[分析対象] の [具体的観点] を分析し、[期待する提案内容] を提示してください" | gemini
```

### 実装系
```bash
echo "[機能名] の実装で [技術的課題] があります。[制約条件] を考慮した解決策を提案してください" | gemini
```

### 最適化系
```bash
echo "[対象コンポーネント/システム] の [最適化目標] を達成するための具体的方法を提案してください" | gemini
```

## 🚨 注意事項

1. **長いプロンプト**: 複雑な質問は段階的に分割することを推奨
2. **ファイル変更**: Geminiの提案は検討後に慎重に適用
3. **依存関係**: 大規模変更前にはテスト実行を推奨
4. **バックアップ**: 重要な変更前にはgitコミットを推奨

## 🔄 継続的な活用

### 開発フロー統合
1. 課題の特定（GeminiCLI分析）
2. 解決策の検討（GeminiCLI提案）
3. 実装（手動またはGeminiCLI支援）
4. テスト（npm test）
5. 検証（GeminiCLI レビュー）

この環境により、FlightAcademyTsxの開発効率と品質向上が期待されます。
