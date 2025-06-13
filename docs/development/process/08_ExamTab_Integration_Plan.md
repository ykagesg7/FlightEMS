# 08 ExamTab統合計画

## 概要

既存のExamTabと新しい4択問題システムを統合し、シームレスなユーザー体験を提供します。

## 現状分析

### 既存ExamTabの構造
- **データソース**: `/public/examQuestions.json` (静的ファイル)
- **型定義**: `ExamQuestion` (`src/types/index.ts`)
- **状態管理**: `useExam` フック (`src/hooks/useExam.ts`)
- **UI**: `ExamTab.tsx`, `QuestionCard`, `AnswerFeedback`

### 新システムの構造
- **データソース**: Supabase PostgreSQL (動的データベース)
- **型定義**: `Question` (`src/types/quiz.ts`)
- **状態管理**: React hooks (TestPage, QuizSession)
- **UI**: TestPage, DeckSelector, QuizSession, QuizResults

## 統合戦略

### 1. データ統合アプローチ

#### オプションA: 段階的移行 (推奨)
1. 既存ExamTabを維持しながら新システムを並行運用
2. 既存JSONデータをデータベースに移行
3. ExamTabを新システムのコンポーネント利用に段階的に変更

#### オプションB: 完全置換
1. ExamTabを新システムで完全に置き換え
2. 既存の学習データは失われる

### 2. 技術的統合ポイント

#### 2.1 型定義の統合
```typescript
// 共通インターフェース
interface UnifiedQuestion {
  id: string;
  question_text: string; // 新: question_text, 旧: question  
  options: string[];
  correct_option_index: number; // 新: correct_option_index, 旧: correctOptionIndex
  explanation?: string;
  difficulty_level?: 'easy' | 'medium' | 'hard'; // 新規追加
  subject?: string; // 旧: subject
}
```

#### 2.2 データソース統合
- JSONデータをデータベースに移行
- 互換性レイヤーの作成
- 段階的なデータソース切り替え

#### 2.3 UI/UX統合
- 既存ExamTabのUIを新コンポーネントで置き換え
- QuestionCard → QuestionDisplay
- AnswerFeedback → 統合された解説表示

## 実装計画

### フェーズ4.1: データ移行・互換性 (優先度: 高)

#### 4.1.1 データ変換ユーティリティ
- [ ] JSONからデータベースへの移行スクリプト
- [ ] ExamQuestion ↔ Question 変換関数
- [ ] 後方互換性レイヤー

#### 4.1.2 統合フック
- [ ] `useUnifiedExam` フック (既存useExamの拡張版)
- [ ] データソース抽象化レイヤー
- [ ] 設定による新旧システム切り替え

### フェーズ4.2: UI統合 (優先度: 中)

#### 4.2.1 ExamTab改修
- [ ] 新しいQuestionDisplayコンポーネント利用
- [ ] 統合されたProgressBar利用
- [ ] 結果画面の統合 (QuizResults利用)

#### 4.2.2 ナビゲーション統合
- [ ] ExamタブとTestタブの統合または使い分け
- [ ] 一貫したユーザー体験の提供

### フェーズ4.3: 機能拡張 (優先度: 中)

#### 4.3.1 既存機能の新システム移行
- [ ] JSON問題データのデータベース投入
- [ ] 科目分類のカテゴリシステム対応
- [ ] 難易度レベルの追加設定

#### 4.3.2 学習記録統合
- [ ] 既存問題の回答記録もlearning_recordsに保存
- [ ] 統一された学習進捗管理
- [ ] SRSシステムへの統合

## マイルストーン

### Week 1 (データ基盤)
- [x] 現状システム分析完了
- [ ] データ変換・移行スクリプト作成
- [ ] 互換性レイヤー実装

### Week 2 (UI統合)
- [ ] useUnifiedExamフック実装
- [ ] ExamTab新コンポーネント統合
- [ ] ナビゲーション調整

### Week 3 (機能完成)
- [ ] 全データ移行完了
- [ ] 統合テスト実施
- [ ] パフォーマンス最適化

## リスク・考慮事項

### 技術的リスク
- 既存データの互換性問題
- パフォーマンス劣化の可能性
- TypeScript型の複雑化

### UX的リスク
- ユーザーの混乱（2つのクイズシステム）
- 学習データの不整合
- 機能差異による使い勝手の違い

### 対策
- 段階的移行による影響最小化
- 十分なテスト期間の確保
- ユーザーフィードバックの積極的収集

---

**作成日**: 2025-06-01  
**更新者**: shadow  
**ステータス**: 計画策定完了 