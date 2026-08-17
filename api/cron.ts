import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleArticlePublishSync } from './_lib/cronArticlePublishSync';
import { handleArticleWeeklyDigest } from './_lib/cronArticleWeeklyDigest';
import { handleCohortWeekly } from './_lib/cronCohortWeekly';
import { resolveCronJob } from './_lib/cronJob';

/**
 * Hobby の関数本数を抑えるため、週次 cron 3 本を 1 ファイルにまとめる。
 * 既存 URL は vercel.json の rewrite で `?job=` に載せる。
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const job = resolveCronJob(req);
  if (!job) {
    return res.status(404).json({ error: 'Not found' });
  }

  switch (job) {
    case 'cohort-weekly':
      return handleCohortWeekly(req, res);
    case 'article-publish-sync':
      return handleArticlePublishSync(req, res);
    case 'article-weekly-digest':
      return handleArticleWeeklyDigest(req, res);
    default:
      return res.status(404).json({ error: 'Not found' });
  }
}
