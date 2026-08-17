import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  TELEMETRY_APPROVE_WORKFLOW,
  filterSlackCallback,
  verifySlackSignature,
  type SlackPayload,
} from './_lib/telemetryApproveCore';

const DEFAULT_REPO = 'ykagesg7/FlightEMS';

async function readRawBody(req: VercelRequest): Promise<string> {
  if (typeof req.body === 'string') {
    return req.body;
  }
  if (Buffer.isBuffer(req.body)) {
    return req.body.toString('utf8');
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length > 0) {
    return Buffer.concat(chunks).toString('utf8');
  }
  if (req.body && typeof req.body === 'object') {
    return JSON.stringify(req.body);
  }
  return '';
}

async function dispatchGithub(payload: {
  command: string;
  threadTs: string;
  slackUserId: string;
}): Promise<void> {
  const token = process.env.GITHUB_TELEMETRY_DISPATCH_TOKEN?.trim();
  const repo = process.env.TELEMETRY_GITHUB_REPO?.trim() || DEFAULT_REPO;
  if (!token) {
    throw new Error('missing GITHUB_TELEMETRY_DISPATCH_TOKEN');
  }
  const response = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/${TELEMETRY_APPROVE_WORKFLOW}/dispatches`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'flight-academy-telemetry-approve',
      },
      body: JSON.stringify({
        ref: process.env.TELEMETRY_GITHUB_REF?.trim() || 'main',
        inputs: {
          command: payload.command,
          thread_ts: payload.threadTs,
          slack_user_id: payload.slackUserId,
        },
      }),
    },
  );
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`github dispatch HTTP ${response.status}: ${detail}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signingSecret = process.env.SLACK_SIGNING_SECRET?.trim() ?? '';
  const timestamp = String(req.headers['x-slack-request-timestamp'] ?? '');
  const signature = String(req.headers['x-slack-signature'] ?? '');
  let rawBody = '';
  try {
    rawBody = await readRawBody(req);
  } catch {
    return res.status(400).json({ error: 'invalid_body' });
  }

  if (
    !verifySlackSignature({
      signingSecret,
      timestamp,
      rawBody,
      signature,
    })
  ) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  let payload: SlackPayload;
  try {
    payload = JSON.parse(rawBody) as SlackPayload;
  } catch {
    return res.status(400).json({ error: 'invalid_json' });
  }

  const filtered = filterSlackCallback(payload);
  if (filtered.kind === 'url_verification') {
    return res.status(200).json({ challenge: filtered.challenge });
  }
  if (filtered.kind === 'ignore') {
    return res.status(200).json({ ok: true, ignored: true, reason: filtered.reason });
  }

  try {
    await dispatchGithub(filtered);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'dispatch_failed';
    return res.status(500).json({ error: message });
  }
  return res.status(200).json({ ok: true, dispatched: true });
}
