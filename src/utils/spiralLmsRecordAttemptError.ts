export type SpiralLmsRecordAttemptErrorKind =
  | 'not_authenticated'
  | 'invalid_score'
  | 'invalid_answer'
  | 'empty_answers'
  | 'quiz_not_ready'
  | 'rate_limited'
  | 'node_locked'
  | 'content_not_published'
  | 'idempotency_conflict'
  | 'network'
  | 'unknown';

export class SpiralLmsRecordAttemptError extends Error {
  readonly kind: SpiralLmsRecordAttemptErrorKind;

  constructor(kind: SpiralLmsRecordAttemptErrorKind, message: string) {
    super(message);
    this.name = 'SpiralLmsRecordAttemptError';
    this.kind = kind;
  }
}

const MESSAGE_KIND_PATTERNS: ReadonlyArray<{
  kind: SpiralLmsRecordAttemptErrorKind;
  patterns: readonly string[];
}> = [
  { kind: 'not_authenticated', patterns: ['not authenticated', 'not_authenticated', '28000'] },
  { kind: 'invalid_score', patterns: ['invalid score', 'invalid_score', 'spiral_lms_validate_score'] },
  { kind: 'invalid_answer', patterns: ['invalid_answer', 'invalid answer'] },
  { kind: 'empty_answers', patterns: ['empty_answers', 'empty answers'] },
  { kind: 'quiz_not_ready', patterns: ['quiz_not_ready', 'quiz not ready'] },
  { kind: 'rate_limited', patterns: ['rate_limited', 'rate limited'] },
  { kind: 'node_locked', patterns: ['node_locked', 'node locked'] },
  { kind: 'content_not_published', patterns: ['content_not_published', 'content not published'] },
  { kind: 'idempotency_conflict', patterns: ['idempotency_conflict', 'idempotency conflict'] },
];

function messageLooksLikeNetwork(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network error') ||
    lower === 'network'
  );
}

export function classifySpiralLmsRecordAttemptError(error: unknown): SpiralLmsRecordAttemptError {
  if (error instanceof SpiralLmsRecordAttemptError) {
    return error;
  }

  if (error instanceof TypeError && messageLooksLikeNetwork(error.message)) {
    return new SpiralLmsRecordAttemptError('network', error.message);
  }

  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';

  if (messageLooksLikeNetwork(message)) {
    return new SpiralLmsRecordAttemptError('network', message);
  }

  const lower = message.toLowerCase();
  for (const { kind, patterns } of MESSAGE_KIND_PATTERNS) {
    if (patterns.some((pattern) => lower.includes(pattern.toLowerCase()))) {
      return new SpiralLmsRecordAttemptError(kind, message);
    }
  }

  return new SpiralLmsRecordAttemptError('unknown', message);
}
