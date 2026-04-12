import mdx from '@mdx-js/rollup';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { devOpenskyApiPlugin } from './vite/devOpenskyApiPlugin';
import { devWeatherApiPlugin } from './vite/devWeatherApiPlugin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 環境変数をロード - VITE_ プレフィックスなしでも読み込めるように空文字を指定
  const env = loadEnv(mode, process.cwd(), '');
  /** Vercel 等は `.env` ではなく process.env に渡すため、ファイルとマージして参照する */
  const getEnv = (name: string): string =>
    String(env[name] ?? process.env[name] ?? '').trim();

  // Vercel Marketplace / Sentry 連携は NEXT_PUBLIC_SENTRY_DSN を注入する。ローカルは VITE_SENTRY_DSN を推奨
  const sentryClientDsn = getEnv('VITE_SENTRY_DSN') || getEnv('NEXT_PUBLIC_SENTRY_DSN');
  const sentryAuthToken = getEnv('SENTRY_AUTH_TOKEN');
  const sentryOrg = getEnv('SENTRY_ORG');
  const sentryProject = getEnv('SENTRY_PROJECT');
  /** Vercel は `.env` ではなく process.env で渡すため、他の VITE_* と同様に define で確実にバンドルへ埋め込む */
  const gaMeasurementId = getEnv('VITE_GA_MEASUREMENT_ID');

  // API_KEYが設定されているかチェック
  const weatherApiKey = env.VITE_WEATHER_API_KEY || '';
  console.log(`Mode: ${mode}, Weather API Key: ${weatherApiKey ? '設定済み' : '未設定'}`);

  // ローカル開発時の /api プロキシ先（ブラウザが相対パス /api を 5173 へ送ったときのみ有効）
  // - /api/weather・/api/aviation-weather・/api/swim-notam-search は Vite プラグインが先に処理
  // - /api/opensky-states 同上
  // - その他 /api/* の既定 3001: npm run dev + npm run dev:weather
  // - npm run dev:full では VITE_VERCEL_DEV_API_ORIGIN で API を 3000 直叩きするため、ここは主に dev+weather 用
  // - 子プロセス Vite に VERCEL_* が付く場合は 3000 をフォールバック
  const proxyFromEnv = process.env.VITE_API_PROXY_TARGET ?? env.VITE_API_PROXY_TARGET;
  const defaultApiProxy =
    process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'development'
      ? 'http://localhost:3000'
      : 'http://localhost:3001';
  const apiProxyTarget = proxyFromEnv || defaultApiProxy;

  // ブラウザからの API URL: cross-env が子プロセスに届かない場合があるため、
  // vercel dev の Vite 子プロセスでは VERCEL_* を見て 3000 を既定にする（define で確実にクライアントへ）
  const vercelDevApiOriginExplicit =
    (process.env.VITE_VERCEL_DEV_API_ORIGIN ?? env.VITE_VERCEL_DEV_API_ORIGIN ?? '').trim();
  const vercelDevApiOrigin =
    vercelDevApiOriginExplicit ||
    (mode === 'development' &&
    (process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'development')
      ? 'http://localhost:3000'
      : '');
  if (mode === 'development') {
    console.log(
      `[vite] Client API base: ${vercelDevApiOrigin || '(same origin /api → proxy ' + apiProxyTarget + ')'}`,
    );
  }

  return {
    plugins: [
      mode === 'development' && devOpenskyApiPlugin(),
      mode === 'development' && devWeatherApiPlugin(),
      react({
        // React 18対応の基本設定
        jsxRuntime: 'automatic',
      }),
      mdx({
        // MDX設定
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex]
      }),
      // Bundle分析プラグイン（開発時のみ）
      mode === 'development' && visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
      // Sentry ソースマップアップロード（本番ビルド + 認証トークンがある場合のみ）
      mode === 'production' &&
        sentryAuthToken &&
        sentryVitePlugin({
          org: sentryOrg,
          project: sentryProject,
          authToken: sentryAuthToken,
        }),
    ].filter(Boolean),
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        }
      }
    },
    define: {
      // 環境変数をクライアントで利用可能にする
      'import.meta.env.VITE_WEATHER_API_KEY': JSON.stringify(weatherApiKey),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_SENTRY_DSN': JSON.stringify(sentryClientDsn),
      'import.meta.env.VITE_VERCEL_DEV_API_ORIGIN': JSON.stringify(vercelDevApiOrigin),
      'import.meta.env.VITE_GA_MEASUREMENT_ID': JSON.stringify(gaMeasurementId),
    },
    build: {
      // Sentry のためソースマップを有効化（hidden: デプロイ先には公開しない）
      sourcemap: true,
      // チャンクサイズ警告を調整
      chunkSizeWarningLimit: 600,
      // 段階的ビルド設定
      rollupOptions: {
        // Stagewise build configuration
        experimental: {
          stagewise: true,
        },
        output: {
          // より詳細なチャンク分割戦略（stagewise対応）
          // 本番ビルドでは循環依存による初期化順序問題を回避するため、manualChunks を無効化
          manualChunks: mode === 'development' ? (id) => {
            // Critical path (最優先読み込み)
            if (id.includes('react') || id.includes('react-dom')) {
              return 'critical-react';
            }

            // Essential routing (第二優先)
            if (id.includes('react-router')) {
              return 'essential-routing';
            }

            // Core utilities (第三優先)
            if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
              return 'core-state';
            }

            // Authentication & Database (第四優先)
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'auth-db';
            }

            // UI Components (遅延読み込み可能)
            if (id.includes('@headlessui') || id.includes('@radix-ui') || id.includes('framer-motion') ||
              id.includes('react-select') || id.includes('lucide-react')) {
              return 'ui-components';
            }

            // Map functionality (必要時読み込み)
            if (id.includes('leaflet') || id.includes('mapbox')) {
              return 'map-features';
            }

            // Content processing (必要時読み込み)
            if (id.includes('@mdx-js') || id.includes('mdx')) {
              return 'content-processing';
            }

            // Utility libraries (遅延読み込み)
            if (id.includes('node_modules')) {
              return 'utility-vendor';
            }
          } : undefined,
          // Progressive loading対応のファイル名戦略
          entryFileNames: (chunkInfo) => {
            const name = chunkInfo.name;
            if (name === 'critical-react') {
              return 'assets/critical-[hash].js';
            }
            return 'assets/[name]-[hash].js';
          },
          chunkFileNames: (chunkInfo) => {
            const name = chunkInfo.name;
            // Priority-based naming for stagewise loading
            if (name?.includes('critical')) {
              return 'assets/critical/[name]-[hash].js';
            }
            if (name?.includes('essential')) {
              return 'assets/essential/[name]-[hash].js';
            }
            if (name?.includes('core')) {
              return 'assets/core/[name]-[hash].js';
            }
            return 'assets/lazy/[name]-[hash].js';
          },
          assetFileNames: 'assets/[name]-[hash].[ext]',
        }
      },
      // 最適化設定（stagewise対応）
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          // Stagewise用の最適化
          passes: 2,
          pure_funcs: mode === 'production' ? ['console.log', 'console.debug'] : [],
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },
    },
    optimizeDeps: {
      include: [
        'mermaid',
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'zustand',
        'leaflet',
        'react-leaflet',
        '@supabase/supabase-js',
        'react-window',
        '@mdx-js/react'
      ],
      // Stagewise対応の依存関係最適化
      esbuildOptions: {
        target: 'esnext',
        treeShaking: true,
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@content': resolve(__dirname, 'src/content'),
        '@components': resolve(__dirname, 'src/components'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@types': resolve(__dirname, 'src/types'),
        '@stores': resolve(__dirname, 'src/stores'),
        '@mdx': resolve(__dirname, 'src/components/mdx'),
      }
    },
    // パフォーマンス監視設定（stagewise対応）
    esbuild: {
      // プロダクションビルドでのコンソール削除
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      // Stagewise用のtree shaking強化
      treeShaking: true,
      target: 'esnext',
    },
    // CSS最適化（stagewise対応）
    css: {
      devSourcemap: mode !== 'production',
      modules: {
        generateScopedName: mode === 'production' ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]',
      },
    },
  };
});
