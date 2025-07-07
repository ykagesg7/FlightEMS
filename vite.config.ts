import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 環境変数をロード - VITE_ プレフィックスなしでも読み込めるように空文字を指定
  const env = loadEnv(mode, process.cwd(), '');

  // API_KEYが設定されているかチェック
  const weatherApiKey = env.VITE_WEATHER_API_KEY || '';
  console.log(`Mode: ${mode}, Weather API Key: ${weatherApiKey ? '設定済み' : '未設定'}`);

  return {
    plugins: [
      react({
        // React 18対応の基本設定
        jsxRuntime: 'automatic',
        // Fast Refresh有効化（デフォルトで含まれる）
        fastRefresh: true,
      }),
      mdx({
        // MDX設定
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [],
        rehypePlugins: []
      }),
      // Bundle分析プラグイン（開発時のみ）
      mode === 'development' && visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        }
      }
    },
    define: {
      // 環境変数をクライアントで利用可能にする
      'import.meta.env.VITE_WEATHER_API_KEY': JSON.stringify(weatherApiKey),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
    // Experimental features
    experimental: {
      buildAdvanced: true,
    },
    build: {
      // ソースマップを無効化（本番環境ではAPIキーを隠すため）
      sourcemap: mode !== 'production',
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
        'react-window'
      ],
      exclude: ['@mdx-js/react'],
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
