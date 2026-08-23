declare module 'virtual:articles-index' {
  import type { ArticleMeta } from './articles';

  const articleMetas: Record<string, ArticleMeta>;
  export default articleMetas;
}
