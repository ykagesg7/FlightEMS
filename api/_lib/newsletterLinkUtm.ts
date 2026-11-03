const UTM_SOURCE = 'newsletter';
const UTM_MEDIUM = 'email';

/** Profile notification settings — do not tag with campaign UTMs. */
export function isNewsletterOptOutPath(pathname: string): boolean {
  return pathname === '/profile' || pathname.startsWith('/profile/');
}

/**
 * Append GA4 newsletter UTMs to same-origin app links. Preserves existing query and hash.
 * External URLs and opt-out (/profile) links are returned unchanged.
 */
export function withNewsletterEmailUtm(
  href: string,
  appBaseUrl: string,
  campaignIsoWeek: string,
): string {
  let url: URL;
  try {
    url = new URL(href, appBaseUrl);
  } catch {
    return href;
  }

  let base: URL;
  try {
    base = new URL(appBaseUrl);
  } catch {
    return href;
  }

  if (url.origin !== base.origin) {
    return href;
  }

  if (isNewsletterOptOutPath(url.pathname)) {
    return href;
  }

  url.searchParams.set('utm_source', UTM_SOURCE);
  url.searchParams.set('utm_medium', UTM_MEDIUM);
  url.searchParams.set('utm_campaign', campaignIsoWeek);

  return url.toString();
}
