import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';

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
          manualChunks: undefined
        }
      }
    }
  };
});