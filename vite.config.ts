import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 環境変数をロード - VITE_ プレフィックスなしでも読み込めるように空文字を指定
  const env = loadEnv(mode, process.cwd(), '');
  
  // API_KEYが設定されているかチェック
  const weatherApiKey = env.VITE_WEATHER_API_KEY || '';
  console.log(`Mode: ${mode}, Weather API Key: ${weatherApiKey ? '設定済み' : '未設定'}`);
  
  return {
    plugins: [
      react(),
      mdx({
        // MDX設定
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [],
        rehypePlugins: []
      })
    ],
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
      // 環境変数の置換を確実に行う
      rollupOptions: {
        output: {
          manualChunks: {
            // React関連ライブラリを分離
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // 地図関連ライブラリを分離
            'map-vendor': ['leaflet', 'react-leaflet', 'leaflet-groupedlayercontrol'],
            // UI関連ライブラリを分離
            'ui-vendor': ['@headlessui/react', '@radix-ui/react-tabs', 'react-select', 'lucide-react'],
            // データ関連ライブラリを分離
            'data-vendor': ['@tanstack/react-query', 'zustand'],
            // Supabase関連を分離
            'supabase-vendor': ['@supabase/supabase-js', '@supabase/auth-helpers-react', '@supabase/ssr'],
            // その他のライブラリを分離
            'utils-vendor': ['axios', 'clsx', 'tailwind-merge', 'date-fns-tz', 'mermaid']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['mermaid']
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@content': resolve(__dirname, 'src/content')
      }
    }
  };
});