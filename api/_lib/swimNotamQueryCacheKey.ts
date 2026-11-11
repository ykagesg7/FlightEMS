import type { SwimNotamQuery } from './swimNotamCore';

export function buildSwimNotamQueryCacheKey(query: SwimNotamQuery): string {
  const parts = [
    query.location?.trim().toUpperCase() ?? '',
    query.keyword?.trim() ?? '',
    query.andOrCondition ?? '',
    query.fir?.trim() ?? '',
    query.nof?.trim() ?? '',
    query.includeRawXml === false ? '0' : '1',
  ];
  return parts.join('|');
}
