import {
  classifySpiralLmsRecordAttemptError,
  type SpiralLmsRecordAttemptErrorKind,
} from './spiralLmsRecordAttemptError';

export function spiralLmsErrorKindMessage(kind: SpiralLmsRecordAttemptErrorKind): string {
  switch (kind) {
    case 'not_authenticated':
      return 'ログインが必要です。';
    case 'network':
      return 'ネットワークエラーです。接続を確認してからもう一度お試しください。';
    case 'node_locked':
      return 'この単元はまだ解放されていません。';
    case 'content_not_published':
      return '記事が公開されていないため進められません。';
    case 'quiz_not_ready':
      return 'ミニテストの準備ができていません。';
    case 'rate_limited':
      return '送信回数の上限に達しました。しばらく待ってからお試しください。';
    case 'invalid_score':
    case 'invalid_answer':
    case 'empty_answers':
      return '送信内容に問題があります。入力を確認してください。';
    case 'idempotency_conflict':
      return '同じ操作が重複しています。ページを再読み込みしてください。';
    case 'unknown':
      return 'エラーが発生しました。時間をおいてもう一度お試しください。';
    default:
      return 'エラーが発生しました。';
  }
}

export function spiralLmsQueryErrorMessage(error: unknown): string {
  if (!error) {
    return '';
  }
  const classified = classifySpiralLmsRecordAttemptError(error);
  return spiralLmsErrorKindMessage(classified.kind);
}
