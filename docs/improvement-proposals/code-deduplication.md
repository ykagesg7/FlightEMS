# コード重複解決提案

## 現状の問題

### 1. コンポーネント重複
- `QuestionComponent`: src/components/ と src/InteractiveLearning/components/ に重複存在
- `QuizComponent`: 複数箇所で類似実装

### 2. 型定義の重複
```typescript
// 複数箇所で定義されている類似の型
interface QuestionComponentProps { /* ... */ }
interface QuizComponentProps { /* ... */ }
```

## 提案する改善

### 1. 共通コンポーネントライブラリの構築

```typescript
// src/components/common/index.ts
export { QuestionComponent } from './QuestionComponent';
export { QuizComponent } from './QuizComponent';
export { ProgressTracker } from './ProgressTracker';

// 統一されたProps型
export interface BaseQuestionProps {
  question: Question;
  onSubmit: (answer: string | number) => void;
  showAnswer?: boolean;
  feedback?: QuestionFeedback;
}
```

### 2. 型定義の統一

```typescript
// src/types/quiz.ts - 中央集約化
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  content: string;
  options?: QuizOption[];
  correctAnswer: string | number;
  explanation?: string;
}

// 各特化型は基本型を拡張
export interface CPLQuizQuestion extends QuizQuestion {
  subject: CPLSubject;
  difficulty: DifficultyLevel;
}
```

### 3. 実装効果

- **ファイル数削減**: 重複コンポーネント削除で約30%のファイル削減
- **保守性向上**: 単一の真実の源（Single Source of Truth）
- **バグ削減**: 重複コードによる不整合の解消

## 移行計画

### Phase 1: 共通型定義の統一（1週間）
1. types/ディレクトリの再構成
2. 重複型定義の特定と統合
3. インポート文の更新

### Phase 2: コンポーネント統合（2週間）
1. 共通コンポーネントの抽出
2. プロップス設計の標準化
3. 段階的移行とテスト

### Phase 3: 検証とクリーンアップ（1週間）
1. 未使用ファイルの削除
2. リファクタリング効果の検証
3. ドキュメント更新 