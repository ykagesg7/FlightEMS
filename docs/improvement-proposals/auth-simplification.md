# 認証システム簡素化提案

## 現状の問題

1. **複雑なリトライロジック**: 194行にわたる複雑な認証処理
2. **複数の認証パス**: getProfileWithRetry、bypassEmailVerificationなど
3. **デバッグの困難さ**: 認証エラーの原因特定が困難

## 提案する改善

### 1. 統一認証サービスクラス

```typescript
class AuthService {
  private static instance: AuthService;
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  async signIn(email: string, password: string): Promise<AuthResult> {
    // 統一された認証ロジック
  }
  
  async getProfile(userId: string): Promise<Profile | null> {
    // シンプル化されたプロフィール取得
  }
}
```

### 2. エラー処理の標準化

```typescript
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
  }
}
```

### 3. 実装効果

- **コード行数削減**: 現在の300行→100行程度
- **エラー追跡改善**: 構造化されたエラー情報
- **テスト容易性**: 単一の責任を持つクラス設計 