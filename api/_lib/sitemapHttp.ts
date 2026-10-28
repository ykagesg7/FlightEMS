import { renderSitemapXml } from '../../vite/generateSitemap';
import { resolveAppBaseUrlFromEnv, type AppBaseUrlEnv } from './appBaseUrl';

export function buildRuntimeSitemapXml(env: AppBaseUrlEnv = process.env): string {
  const origin = resolveAppBaseUrlFromEnv(env);
  return renderSitemapXml(origin);
}
