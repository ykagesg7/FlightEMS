import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  type CohortNotificationTemplateKey,
  sendNotificationEmail,
} from '../_lib/notificationEmail';

interface SendBody {
  userId: string;
  templateKey: CohortNotificationTemplateKey;
  subject: string;
  htmlContent: string;
  dedupeKey: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as SendBody;
  if (!body?.userId || !body.subject || !body.htmlContent || !body.dedupeKey || !body.templateKey) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    const result = await sendNotificationEmail({
      userId: body.userId,
      templateKey: body.templateKey,
      dedupeKey: body.dedupeKey,
      subject: body.subject,
      htmlContent: body.htmlContent,
    });

    if (result.error) {
      return res.status(502).json({ error: result.error });
    }
    if (result.skipped) {
      return res.status(200).json({ skipped: true, reason: result.reason });
    }
    return res.status(200).json({ sent: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
