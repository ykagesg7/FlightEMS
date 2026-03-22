import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, ViteDevServer } from 'vite';

type Next = (err?: unknown) => void;

/**
 * npm run dev のみ（dev:weather / vercel なし）でも OpenSky プロキシが動くようにする。
 * /api を 3001 へプロキシするより前に /api/opensky-states を処理する（connect stack 先頭挿入）。
 */
export function devOpenskyApiPlugin(): Plugin {
  return {
    name: 'dev-opensky-states-api',
    enforce: 'pre',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      const handle = async (req: IncomingMessage, res: ServerResponse, next: Next) => {
        const rawUrl = req.url ?? '';
        if (!rawUrl.startsWith('/api/opensky-states')) {
          next();
          return;
        }
        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.end();
          return;
        }
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }
        try {
          const mod = await server.ssrLoadModule('/api/lib/openskyStatesCore.ts');
          const { proxyOpenSkyStates } = mod as {
            proxyOpenSkyStates: (
              q: Record<string, string | string[] | undefined>
            ) => Promise<{ status: number; body: unknown }>;
          };
          const u = new URL(rawUrl, 'http://127.0.0.1');
          const query: Record<string, string | string[] | undefined> = {};
          u.searchParams.forEach((value, key) => {
            query[key] = value;
          });
          const result = await proxyOpenSkyStates(query);
          res.statusCode = result.status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.end(JSON.stringify(result.body));
        } catch (err) {
          console.error('[dev-opensky-states-api]', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
      };

      const stack = (server.middlewares as { stack: { route: string; handle: typeof handle }[] }).stack;
      stack.unshift({ route: '', handle });
    },
  };
}
