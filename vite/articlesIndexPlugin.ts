import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { articleMetasRecord } from './articlesMeta';

export const ARTICLES_INDEX_VIRTUAL_ID = 'virtual:articles-index';
export const ARTICLES_INDEX_RESOLVED_ID = `\0${ARTICLES_INDEX_VIRTUAL_ID}`;

export function articlesIndexPlugin(): Plugin {
  return {
    name: 'articles-index',
    enforce: 'pre',
    resolveId(id) {
      const bare = id.split('?')[0];
      if (bare === ARTICLES_INDEX_VIRTUAL_ID || bare.endsWith(`/${ARTICLES_INDEX_VIRTUAL_ID}`)) {
        return ARTICLES_INDEX_RESOLVED_ID;
      }
      return undefined;
    },
    load(id) {
      if (id !== ARTICLES_INDEX_RESOLVED_ID) return undefined;
      const metas = articleMetasRecord();
      return `export default ${JSON.stringify(metas)};`;
    },
    configureServer(server) {
      const contentRoot = resolve(process.cwd(), 'src/content');
      server.watcher.add(resolve(contentRoot, 'articles'));
      server.watcher.add(resolve(contentRoot, 'lessons'));
      const invalidate = (file: string) => {
        if (!file.endsWith('.mdx')) return;
        const normalized = file.replace(/\\/g, '/');
        if (!normalized.includes('/content/articles/') && !normalized.includes('/content/lessons/')) {
          return;
        }
        const mod = server.moduleGraph.getModuleById(ARTICLES_INDEX_RESOLVED_ID);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: 'full-reload' });
        }
      };
      server.watcher.on('change', invalidate);
      server.watcher.on('add', invalidate);
      server.watcher.on('unlink', invalidate);
    },
  };
}
