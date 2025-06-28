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
      'import.meta.env.VITE_WEATHER_API_KEY': JSON.stringify(weatherApiKey)
    },
    build: {
      // ソースマップを無効化（本番環境ではAPIキーを隠すため）
      sourcemap: mode !== 'production',
      // チャンクサイズ警告を調整
      chunkSizeWarningLimit: 600,
      // 環境変数の置換を確実に行う
      rollupOptions: {
        output: {
          // より詳細なチャンク分割戦略
          manualChunks: (id) => {
            // React関連
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }

            // 地図関連ライブラリ
            if (id.includes('leaflet') || id.includes('mapbox')) {
              return 'map-vendor';
            }

            // UI/アニメーションライブラリ
            if (id.includes('@headlessui') || id.includes('@radix-ui') || id.includes('framer-motion') ||
              id.includes('react-select') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }

            // データ関連ライブラリ
            if (id.includes('@tanstack/react-query') || id.includes('zustand') || id.includes('axios')) {
              return 'data-vendor';
            }

            // Supabase関連
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'supabase-vendor';
            }

            // MDX関連
            if (id.includes('@mdx-js') || id.includes('mdx')) {
              return 'mdx-vendor';
            }

            // その他のnode_modules
            if (id.includes('node_modules')) {
              return 'utils-vendor';
            }
          },
          // ファイル名にハッシュを追加
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        }
      },
      // 最適化設定
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
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
      exclude: ['@mdx-js/react']
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
    // パフォーマンス監視設定
    esbuild: {
      // プロダクションビルドでのコンソール削除
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});
