import type { VercelRequest } from '@vercel/node';

export const CRON_JOBS = [
  'cohort-weekly',
  'article-publish-sync',
  'article-weekly-digest',
] as const;

export type CronJob = (typeof CRON_JOBS)[number];

function isCronJob(value: string | undefined): value is CronJob {
  return CRON_JOBS.some((job) => job === value);
}

export function resolveCronJob(req: VercelRequest): CronJob | null {
  const raw = req.query.job;
  const fromQuery = Array.isArray(raw) ? raw[0] : raw;
  if (isCronJob(fromQuery)) {
    return fromQuery;
  }

  const path = (req.url ?? '').split('?')[0];
  const match = path.match(/\/cron\/(cohort-weekly|article-publish-sync|article-weekly-digest)$/);
  if (match && isCronJob(match[1])) {
    return match[1];
  }
  return null;
}
