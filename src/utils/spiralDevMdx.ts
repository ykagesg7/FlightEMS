import type { MDXModule } from '../types/articles';

const devMdxModules = import.meta.env.DEV
  ? import.meta.glob<MDXModule>('../dev/mdx/*.mdx')
  : ({} as Record<string, () => Promise<MDXModule>>);

/** Dev-only MDX under `src/dev/mdx/` (excluded from production bundle via `import.meta.env.DEV`). */
export function loadDevMdxModule(contentId: string): (() => Promise<MDXModule>) | undefined {
  if (!import.meta.env.DEV) {
    return undefined;
  }
  const suffix = `/dev/mdx/${contentId}.mdx`;
  for (const [path, loader] of Object.entries(devMdxModules)) {
    if (path.endsWith(suffix)) {
      return loader;
    }
  }
  return undefined;
}
