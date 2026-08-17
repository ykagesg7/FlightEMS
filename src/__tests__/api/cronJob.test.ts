import { describe, expect, it } from 'vitest';
import { resolveCronJob } from '../../../api/_lib/cronJob';

function req(url: string, job?: string | string[]) {
  return { url, query: job === undefined ? {} : { job } } as Parameters<typeof resolveCronJob>[0];
}

describe('resolveCronJob', () => {
  it('reads job from the query string', () => {
    expect(resolveCronJob(req('/api/cron', 'cohort-weekly'))).toBe('cohort-weekly');
    expect(resolveCronJob(req('/api/cron', 'article-publish-sync'))).toBe('article-publish-sync');
    expect(resolveCronJob(req('/api/cron', ['article-weekly-digest']))).toBe('article-weekly-digest');
  });

  it('reads job from the legacy path', () => {
    expect(resolveCronJob(req('/api/cron/cohort-weekly'))).toBe('cohort-weekly');
  });

  it('rejects unknown jobs', () => {
    expect(resolveCronJob(req('/api/cron', 'nope'))).toBeNull();
    expect(resolveCronJob(req('/api/cron'))).toBeNull();
  });
});
