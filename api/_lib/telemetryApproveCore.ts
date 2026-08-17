import { createHmac, timingSafeEqual } from 'node:crypto';

export const TELEMETRY_CHANNEL_ID = 'C0BQ5R19QDV';
export const TELEMETRY_APPROVE_WORKFLOW = 'weekly-telemetry-approve.yml';
export const COMMAND_RE =
  /^(APPROVE-DOC|HOLD|SKIP T-\d{2}|REJECT T-\d{2}|APPROVE T-\d{2})$/;

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

export type FilterResult =
  | { kind: 'url_verification'; challenge: string }
  | { kind: 'ignore'; reason: string }
  | {
      kind: 'dispatch';
      command: string;
      threadTs: string;
      slackUserId: string;
      eventTs: string;
    };

export function normalizeCommand(text: string): string {
  return text.replace(/\u00a0/g, ' ').trim();
}

export function isTelemetryApproveCommand(text: string): boolean {
  return COMMAND_RE.test(normalizeCommand(text));
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

export function filterSlackCallback(payload: SlackPayload): FilterResult {
  if (payload.type === 'url_verification' && payload.challenge) {
    return { kind: 'url_verification', challenge: payload.challenge };
  }
  if (payload.type !== 'event_callback') {
    return { kind: 'ignore', reason: 'not_event_callback' };
  }
  const event = payload.event;
  if (!event || event.type !== 'message') {
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
  const command = normalizeCommand(event.text ?? '');
  if (!isTelemetryApproveCommand(command)) {
    return { kind: 'ignore', reason: 'not_command' };
  }
  if (!event.user || !event.ts) {
    return { kind: 'ignore', reason: 'missing_ids' };
  }
  return {
    kind: 'dispatch',
    command,
    threadTs: event.thread_ts,
    slackUserId: event.user,
    eventTs: event.ts,
  };
}
