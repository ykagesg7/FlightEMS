# React コンポーネント トラブルシューティング ガイド

このガイドは、Flight Academy プロジェクトにおいて発生するReact コンポーネントのエラーと、その具体的な解決策をまとめたものです。エラー内容、原因、解決策を明確に区分けし、状況に応じた対処を容易にします。

## 目次

1. [概要](#概要)
2. [一般的なエラー: 未使用の関数や変数](#一般的なエラー-未使用の関数や変数)
3. [レンダリングエラー: MDX CalloutBox未定義](#レンダリングエラー-mdx-calloutbox未定義)
4. [Hooks 使用順序エラー](#hooks-使用順序エラー)
5. [状態管理の問題](#状態管理の問題)
6. [パフォーマンスの問題](#パフォーマンスの問題)
7. [コード品質の改善](#コード品質の改善)
8. [まとめと注意点](#まとめと注意点)

## 概要

Flight Academy プロジェクトで発生するReact関連のエラーとその対応策を、以下の各セクションで詳細に説明します。これにより、エラー発生時に迅速なトラブルシューティングが可能です。

## 一般的なエラー: 未使用の関数や変数

### エラー内容

```
'functionName' is declared but its value is never read.
```

### 原因

未使用の変数や関数が存在する場合、TypeScript がコード品質の警告を出します。

### 解決策

- 不要な関数や変数を削除する
- 将来的に使用する可能性がある場合は、一時的にコメントアウトまたは `// @ts-ignore` を使用する

### 実施例

FlightSummary コンポーネントでは、未使用の `formatDuration` 関数と `calculateSegmentETE` 関数が、`recalculateETAs` 関数に統合され、削除されました。

## レンダリングエラー: MDX CalloutBox未定義

### エラー内容

```
Uncaught Error: Expected component `CalloutBox` to be defined: you likely forgot to import, pass, or provide it.
```

### 原因

MDXファイル内で `<CalloutBox>` タグが利用されているにもかかわらず、`src/components/MDXContent.tsx` 内のMDXProviderの `components` オブジェクトに `CalloutBox` のマッピングが存在しません。

### 解決策

`src/components/MDXContent.tsx` の `components` オブジェクトに以下のようなマッピングを追加してください。

```jsx
CalloutBox: MDXComponents.CalloutBox,
```

**備考**: 他のコンポーネント（例: `<Callout>`）との整合性も確認してください。

## Hooks 使用順序エラー

### エラー内容

```
Warning: Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. You can only call Hooks at the top level of your React function.
```

### 原因

React では、Hooks はコンポーネント関数のトップレベルでのみ呼び出されるべきです。内部で呼び出すと、呼び出し順序が変動しエラーが発生します。

### 解決策

- Hooks は常にコンポーネントのトップレベルで呼び出す
- 非同期処理や条件付き処理の場合は、処理を別関数に切り出し、トップレベルでHooksを呼び出す

**例**: MDXLoader コンポーネントでは、動的インポート処理のみを `useEffect` 内で行い、その他のHooksは直接呼び出すようにしてください。

## 状態管理の問題

（ここに具体的な状態管理の問題と解決策を追記してください。）

## パフォーマンスの問題

（ここにパフォーマンス関連の問題点と改善策を追記してください。）

## コード品質の改善

（ここにコード品質向上に関する改善策を追記してください。）

## まとめと注意点

各エラーについて、原因と解決策を明確に示しました。エラー発生時には、エラーメッセージを正確に把握し、適切な対策を講じるとともに、コード全体の見直しを行うことが推奨されます。チーム内で情報共有し、同じエラーの再発防止に努めてください。
