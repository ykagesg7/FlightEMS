import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  TELEMETRY_CHANNEL_ID,
  filterSlackCallback,
  filterSlashCommand,
  isTelemetryApproveCommand,
  verifySlackSignature,
} from '../../../api/_lib/telemetryApproveCore';

function signed(secret: string, timestamp: string, rawBody: string): string {
  const digest = createHmac('sha256', secret).update(`v0:${timestamp}:${rawBody}`).digest('hex');
  return `v0=${digest}`;
}

describe('telemetryApproveCore', () => {
  it('accepts exact approval commands only', () => {
    expect(isTelemetryApproveCommand('APPROVE-DOC')).toBe(true);
    expect(isTelemetryApproveCommand('  HOLD ')).toBe(true);
    expect(isTelemetryApproveCommand('APPROVE T-03')).toBe(true);
    expect(isTelemetryApproveCommand('approve-doc')).toBe(false);
    expect(isTelemetryApproveCommand('APPROVE-DOC please')).toBe(false);
  });

  it('dispatches thread commands in the telemetry channel', () => {
    const result = filterSlackCallback({
      type: 'event_callback',
      event: {
        type: 'message',
        channel: TELEMETRY_CHANNEL_ID,
        user: 'U0928GWP3AA',
        text: 'APPROVE-DOC',
        ts: '1.2',
        thread_ts: '1.0',
      },
    });
    expect(result).toEqual({
      kind: 'dispatch',
      command: 'APPROVE-DOC',
      threadTs: '1.0',
      slackUserId: 'U0928GWP3AA',
      eventTs: '1.2',
      ack: '記録: 正本PRのマージを開始します。',
    });
  });

  it('ignores bots, non-threads, and other channels', () => {
    expect(
      filterSlackCallback({
        type: 'event_callback',
        event: {
          type: 'message',
          channel: TELEMETRY_CHANNEL_ID,
          user: 'U0928GWP3AA',
          text: 'APPROVE-DOC',
          ts: '1.2',
          thread_ts: '1.0',
          bot_id: 'B123',
        },
      }).kind,
    ).toBe('ignore');
    expect(
      filterSlackCallback({
        type: 'event_callback',
        event: {
          type: 'message',
          channel: TELEMETRY_CHANNEL_ID,
          user: 'U0928GWP3AA',
          text: 'APPROVE-DOC',
          ts: '1.2',
        },
      }).kind,
    ).toBe('ignore');
    expect(
      filterSlackCallback({
        type: 'event_callback',
        event: {
          type: 'message',
          channel: 'C0000000000',
          user: 'U0928GWP3AA',
          text: 'HOLD',
          ts: '1.2',
          thread_ts: '1.0',
        },
      }).kind,
    ).toBe('ignore');
  });

  it('returns Slack URL verification challenges', () => {
    expect(filterSlackCallback({ type: 'url_verification', challenge: 'abc' })).toEqual({
      kind: 'url_verification',
      challenge: 'abc',
    });
  });

  it('verifies Slack signatures and rejects stale timestamps', () => {
    const secret = 'test-secret';
    const timestamp = '1000';
    const rawBody = '{"type":"event_callback"}';
    const nowMs = 1000 * 1000;
    expect(
      verifySlackSignature({
        signingSecret: secret,
        timestamp,
        rawBody,
        signature: signed(secret, timestamp, rawBody),
        nowMs,
      }),
    ).toBe(true);
    expect(
      verifySlackSignature({
        signingSecret: secret,
        timestamp,
        rawBody,
        signature: signed(secret, timestamp, rawBody),
        nowMs: nowMs + 6 * 60 * 1000,
      }),
    ).toBe(false);
    expect(
      verifySlackSignature({
        signingSecret: secret,
        timestamp,
        rawBody,
        signature: 'v0=deadbeef',
        nowMs,
      }),
    ).toBe(false);
  });

  it('accepts app mentions and slash commands in the telemetry thread', () => {
    expect(
      filterSlackCallback({
        type: 'event_callback',
        event: {
          type: 'app_mention',
          channel: TELEMETRY_CHANNEL_ID,
          user: 'U0928GWP3AA',
          text: '<@U0BQPPKM997> HOLD',
          ts: '1.2',
          thread_ts: '1.0',
        },
      }),
    ).toMatchObject({
      kind: 'dispatch',
      command: 'HOLD',
      ack: '記録: 今週は実行しません。',
    });
    expect(
      filterSlashCommand({
        text: 'HOLD',
        user_id: 'U0928GWP3AA',
        channel_id: TELEMETRY_CHANNEL_ID,
        thread_ts: '1.0',
        response_url: 'https://hooks.slack.com/commands/T/xxx',
      }),
    ).toMatchObject({
      kind: 'dispatch',
      command: 'HOLD',
      responseUrl: 'https://hooks.slack.com/commands/T/xxx',
    });
  });
});
