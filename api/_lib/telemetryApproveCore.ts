import { createHmac, timingSafeEqual } from 'node:crypto';

export const TELEMETRY_CHANNEL_ID = 'C0BQ5R19QDV';
export const TELEMETRY_APPROVE_WORKFLOW = 'weekly-telemetry-approve.yml';
export const COMMAND_RE =
  /^(APPROVE-DOC|HOLD|SKIP T-\d{2}|REJECT T-\d{2}|APPROVE T-\d{2})$/;
const MENTION_RE = /<@U[A-Z0-9]+(?:\|[^>]+)?>/g;

export type SlackMessageEvent = {
  type?: string;
  channel?: string;
  user?: string;
  text?: string;
  ts?: string;
  thread_ts?: string;
  bot_id?: string;
  subtype?: string;
};

export type SlackPayload = {
  type?: string;
  challenge?: string;
  event?: SlackMessageEvent;
};

export type SlackSlashPayload = {
  command?: string;
  text?: string;
  user_id?: string;
  channel_id?: string;
  thread_ts?: string;
  response_url?: string;
};

export type FilterResult =
  | { kind: 'url_verification'; challenge: string }
  | { kind: 'ignore'; reason: string }
  | {
      kind: 'dispatch';
      command: string;
      threadTs: string;
      slackUserId: string;
      eventTs: string;
      responseUrl?: string;
      ack: string;
    };

export function stripSlackMentions(text: string): string {
  return text.replace(MENTION_RE, ' ').replace(/\s+/g, ' ').trim();
}

export function normalizeCommand(text: string): string {
  return stripSlackMentions(text.replace(/\u00a0/g, ' ')).trim();
}

export function isTelemetryApproveCommand(text: string): boolean {
  return parseApproveCommand(text) !== null;
}

export function parseApproveCommand(text: string): string | null {
  const command = normalizeCommand(text);
  return COMMAND_RE.test(command) ? command : null;
}

export function ackForCommand(command: string): string {
  if (command === 'HOLD') {
    return '記録: 今週は実行しません。';
  }
  if (command.startsWith('SKIP ')) {
    return '記録: スキップとして残します。';
  }
  if (command.startsWith('REJECT ')) {
    return '記録: 提案は採用しません。';
  }
  if (command.startsWith('APPROVE T-')) {
    return '記録: 許可リストに無いため実行しません。';
  }
  if (command === 'APPROVE-DOC') {
    return '記録: 正本PRのマージを開始します。';
  }
  return '記録: 条件を満たさないため実行しません。';
}

export function verifySlackSignature(opts: {
  signingSecret: string;
  timestamp: string;
  rawBody: string;
  signature: string;
  nowMs?: number;
}): boolean {
  const { signingSecret, timestamp, rawBody, signature, nowMs = Date.now() } = opts;
  if (!signingSecret || !/^\d+$/.test(timestamp) || !signature.startsWith('v0=')) {
    return false;
  }
  const tsMs = Number(timestamp) * 1000;
  if (Math.abs(nowMs - tsMs) > 5 * 60 * 1000) {
    return false;
  }
  const digest = createHmac('sha256', signingSecret)
    .update(`v0:${timestamp}:${rawBody}`)
    .digest('hex');
  const expected = Buffer.from(`v0=${digest}`, 'utf8');
  const actual = Buffer.from(signature, 'utf8');
  if (expected.length !== actual.length) {
    return false;
  }
  return timingSafeEqual(expected, actual);
}

export function verifySlackSignatureAny(opts: {
  signingSecret: string;
  timestamp: string;
  signature: string;
  bodies: string[];
  nowMs?: number;
}): boolean {
  return opts.bodies.some(
    (rawBody) =>
      rawBody.length > 0 &&
      verifySlackSignature({
        signingSecret: opts.signingSecret,
        timestamp: opts.timestamp,
        rawBody,
        signature: opts.signature,
        nowMs: opts.nowMs,
      }),
  );
}

function dispatchResult(opts: {
  command: string;
  threadTs: string;
  slackUserId: string;
  eventTs: string;
  responseUrl?: string;
}): FilterResult {
  return {
    kind: 'dispatch',
    command: opts.command,
    threadTs: opts.threadTs,
    slackUserId: opts.slackUserId,
    eventTs: opts.eventTs,
    ack: ackForCommand(opts.command),
    ...(opts.responseUrl ? { responseUrl: opts.responseUrl } : {}),
  };
}

export function filterSlackCallback(payload: SlackPayload): FilterResult {
  if (payload.type === 'url_verification' && payload.challenge) {
    return { kind: 'url_verification', challenge: payload.challenge };
  }
  if (payload.type !== 'event_callback') {
    return { kind: 'ignore', reason: 'not_event_callback' };
  }
  const event = payload.event;
  if (!event || (event.type !== 'message' && event.type !== 'app_mention')) {
    return { kind: 'ignore', reason: 'not_message' };
  }
  if (event.bot_id || event.subtype) {
    return { kind: 'ignore', reason: 'bot_or_subtype' };
  }
  if (event.channel !== TELEMETRY_CHANNEL_ID) {
    return { kind: 'ignore', reason: 'wrong_channel' };
  }
  if (!event.thread_ts) {
    return { kind: 'ignore', reason: 'not_thread' };
  }
  const command = parseApproveCommand(event.text ?? '');
  if (!command) {
    return { kind: 'ignore', reason: 'not_command' };
  }
  if (!event.user || !event.ts) {
    return { kind: 'ignore', reason: 'missing_ids' };
  }
  return dispatchResult({
    command,
    threadTs: event.thread_ts,
    slackUserId: event.user,
    eventTs: event.ts,
  });
}

export function filterSlashCommand(payload: SlackSlashPayload): FilterResult {
  if (payload.channel_id !== TELEMETRY_CHANNEL_ID) {
    return { kind: 'ignore', reason: 'wrong_channel' };
  }
  if (!payload.thread_ts) {
    return { kind: 'ignore', reason: 'not_thread' };
  }
  const command = parseApproveCommand(payload.text ?? '');
  if (!command) {
    return { kind: 'ignore', reason: 'not_command' };
  }
  if (!payload.user_id) {
    return { kind: 'ignore', reason: 'missing_ids' };
  }
  return dispatchResult({
    command,
    threadTs: payload.thread_ts,
    slackUserId: payload.user_id,
    eventTs: payload.thread_ts,
    responseUrl: payload.response_url,
  });
}

export function slashPayloadFromBody(
  rawBody: string,
  parsed: unknown,
): SlackSlashPayload | null {
  const fromForm = rawBody.includes('=') && !rawBody.trim().startsWith('{')
    ? new URLSearchParams(rawBody)
    : null;
  const fromObject =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;

  const read = (key: string): string => {
    if (fromForm?.has(key)) {
      return fromForm.get(key) ?? '';
    }
    const value = fromObject?.[key];
    return typeof value === 'string' ? value : '';
  };

  const text = read('text');
  const userId = read('user_id');
  const channelId = read('channel_id');
  if (!userId && !channelId && !text && !read('command')) {
    return null;
  }
  return {
    command: read('command'),
    text,
    user_id: userId,
    channel_id: channelId,
    thread_ts: read('thread_ts'),
    response_url: read('response_url'),
  };
}

export function formBodyFromObject(parsed: unknown): string {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return '';
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value === 'string') {
      params.set(key, value);
    }
  }
  return params.toString();
}
