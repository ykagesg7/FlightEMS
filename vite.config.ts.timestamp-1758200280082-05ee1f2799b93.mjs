// vite.config.ts
import mdx from "file:///C:/Users/y_kag/project/FlightAcademyTsx/node_modules/@mdx-js/rollup/index.js";
import react from "file:///C:/Users/y_kag/project/FlightAcademyTsx/node_modules/@vitejs/plugin-react/dist/index.js";
import { resolve } from "path";
import { visualizer } from "file:///C:/Users/y_kag/project/FlightAcademyTsx/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { defineConfig, loadEnv } from "file:///C:/Users/y_kag/project/FlightAcademyTsx/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "C:\\Users\\y_kag\\project\\FlightAcademyTsx";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const weatherApiKey = env.VITE_WEATHER_API_KEY || "";
  console.log(`Mode: ${mode}, Weather API Key: ${weatherApiKey ? "\u8A2D\u5B9A\u6E08\u307F" : "\u672A\u8A2D\u5B9A"}`);
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:3001";
  return {
    plugins: [
      react({
        // React 18対応の基本設定
        jsxRuntime: "automatic"
      }),
      mdx({
        // MDX設定
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [],
        rehypePlugins: []
      }),
      // Bundle分析プラグイン（開発時のみ）
      mode === "development" && visualizer({
        filename: "dist/stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),
    server: {
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true
        }
      }
    },
    define: {
      // 環境変数をクライアントで利用可能にする
      "import.meta.env.VITE_WEATHER_API_KEY": JSON.stringify(weatherApiKey),
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
    },
    build: {
      // ソースマップを無効化（本番環境ではAPIキーを隠すため）
      sourcemap: mode !== "production",
      // チャンクサイズ警告を調整
      chunkSizeWarningLimit: 600,
      // 段階的ビルド設定
      rollupOptions: {
        // Stagewise build configuration
        experimental: {
          stagewise: true
        },
        output: {
          // より詳細なチャンク分割戦略（stagewise対応）
          // 本番ビルドでは循環依存による初期化順序問題を回避するため、manualChunks を無効化
          manualChunks: mode === "development" ? (id) => {
            if (id.includes("react") || id.includes("react-dom")) {
              return "critical-react";
            }
            if (id.includes("react-router")) {
              return "essential-routing";
            }
            if (id.includes("zustand") || id.includes("@tanstack/react-query")) {
              return "core-state";
            }
            if (id.includes("@supabase") || id.includes("supabase")) {
              return "auth-db";
            }
            if (id.includes("@headlessui") || id.includes("@radix-ui") || id.includes("framer-motion") || id.includes("react-select") || id.includes("lucide-react")) {
              return "ui-components";
            }
            if (id.includes("leaflet") || id.includes("mapbox")) {
              return "map-features";
            }
            if (id.includes("@mdx-js") || id.includes("mdx")) {
              return "content-processing";
            }
            if (id.includes("node_modules")) {
              return "utility-vendor";
            }
          } : void 0,
          // Progressive loading対応のファイル名戦略
          entryFileNames: (chunkInfo) => {
            const name = chunkInfo.name;
            if (name === "critical-react") {
              return "assets/critical-[hash].js";
            }
            return "assets/[name]-[hash].js";
          },
          chunkFileNames: (chunkInfo) => {
            const name = chunkInfo.name;
            if (name?.includes("critical")) {
              return "assets/critical/[name]-[hash].js";
            }
            if (name?.includes("essential")) {
              return "assets/essential/[name]-[hash].js";
            }
            if (name?.includes("core")) {
              return "assets/core/[name]-[hash].js";
            }
            return "assets/lazy/[name]-[hash].js";
          },
          assetFileNames: "assets/[name]-[hash].[ext]"
        }
      },
      // 最適化設定（stagewise対応）
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: mode === "production",
          // Stagewise用の最適化
          passes: 2,
          pure_funcs: mode === "production" ? ["console.log", "console.debug"] : []
        },
        mangle: {
          safari10: true
        },
        format: {
          comments: false
        }
      }
    },
    optimizeDeps: {
      include: [
        "mermaid",
        "react",
        "react-dom",
        "react-router-dom",
        "@tanstack/react-query",
        "zustand",
        "leaflet",
        "react-leaflet",
        "@supabase/supabase-js",
        "react-window",
        "@mdx-js/react"
      ],
      // Stagewise対応の依存関係最適化
      esbuildOptions: {
        target: "esnext",
        treeShaking: true
      }
    },
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "src"),
        "@content": resolve(__vite_injected_original_dirname, "src/content"),
        "@components": resolve(__vite_injected_original_dirname, "src/components"),
        "@utils": resolve(__vite_injected_original_dirname, "src/utils"),
        "@hooks": resolve(__vite_injected_original_dirname, "src/hooks"),
        "@types": resolve(__vite_injected_original_dirname, "src/types"),
        "@stores": resolve(__vite_injected_original_dirname, "src/stores"),
        "@mdx": resolve(__vite_injected_original_dirname, "src/components/mdx")
      }
    },
    // パフォーマンス監視設定（stagewise対応）
    esbuild: {
      // プロダクションビルドでのコンソール削除
      drop: mode === "production" ? ["console", "debugger"] : [],
      // Stagewise用のtree shaking強化
      treeShaking: true,
      target: "esnext"
    },
    // CSS最適化（stagewise対応）
    css: {
      devSourcemap: mode !== "production",
      modules: {
        generateScopedName: mode === "production" ? "[hash:base64:5]" : "[name]__[local]___[hash:base64:5]"
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5X2thZ1xcXFxwcm9qZWN0XFxcXEZsaWdodEFjYWRlbXlUc3hcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHlfa2FnXFxcXHByb2plY3RcXFxcRmxpZ2h0QWNhZGVteVRzeFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMveV9rYWcvcHJvamVjdC9GbGlnaHRBY2FkZW15VHN4L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IG1keCBmcm9tICdAbWR4LWpzL3JvbGx1cCc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcic7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xyXG4gIC8vIFx1NzRCMFx1NTg4M1x1NTkwOVx1NjU3MFx1MzA5Mlx1MzBFRFx1MzBGQ1x1MzBDOSAtIFZJVEVfIFx1MzBEN1x1MzBFQ1x1MzBENVx1MzBBM1x1MzBDM1x1MzBBRlx1MzBCOVx1MzA2QVx1MzA1N1x1MzA2N1x1MzA4Mlx1OEFBRFx1MzA3Rlx1OEZCQ1x1MzA4MVx1MzA4Qlx1MzA4OFx1MzA0Nlx1MzA2Qlx1N0E3QVx1NjU4N1x1NUI1N1x1MzA5Mlx1NjMwN1x1NUI5QVxyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xyXG5cclxuICAvLyBBUElfS0VZXHUzMDRDXHU4QTJEXHU1QjlBXHUzMDU1XHUzMDhDXHUzMDY2XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMEMxXHUzMEE3XHUzMEMzXHUzMEFGXHJcbiAgY29uc3Qgd2VhdGhlckFwaUtleSA9IGVudi5WSVRFX1dFQVRIRVJfQVBJX0tFWSB8fCAnJztcclxuICBjb25zb2xlLmxvZyhgTW9kZTogJHttb2RlfSwgV2VhdGhlciBBUEkgS2V5OiAke3dlYXRoZXJBcGlLZXkgPyAnXHU4QTJEXHU1QjlBXHU2RTA4XHUzMDdGJyA6ICdcdTY3MkFcdThBMkRcdTVCOUEnfWApO1xyXG5cclxuICAvLyBcdTMwRURcdTMwRkNcdTMwQUJcdTMwRUJcdTk1OEJcdTc2N0FcdTY2NDJcdTMwNkVBUElcdTMwRDdcdTMwRURcdTMwQURcdTMwQjdcdTUxNDhcdUZGMDhcdTUxMkFcdTUxNDhcdTk4MDZcdTRGNEQ6IFZJVEVfQVBJX1BST1hZX1RBUkdFVCAtPiAzMDAxXHVGRjA5XHJcbiAgY29uc3QgYXBpUHJveHlUYXJnZXQgPSBlbnYuVklURV9BUElfUFJPWFlfVEFSR0VUIHx8ICdodHRwOi8vbG9jYWxob3N0OjMwMDEnO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICByZWFjdCh7XHJcbiAgICAgICAgLy8gUmVhY3QgMThcdTVCRkVcdTVGRENcdTMwNkVcdTU3RkFcdTY3MkNcdThBMkRcdTVCOUFcclxuICAgICAgICBqc3hSdW50aW1lOiAnYXV0b21hdGljJyxcclxuICAgICAgfSksXHJcbiAgICAgIG1keCh7XHJcbiAgICAgICAgLy8gTURYXHU4QTJEXHU1QjlBXHJcbiAgICAgICAgcHJvdmlkZXJJbXBvcnRTb3VyY2U6ICdAbWR4LWpzL3JlYWN0JyxcclxuICAgICAgICByZW1hcmtQbHVnaW5zOiBbXSxcclxuICAgICAgICByZWh5cGVQbHVnaW5zOiBbXVxyXG4gICAgICB9KSxcclxuICAgICAgLy8gQnVuZGxlXHU1MjA2XHU2NzkwXHUzMEQ3XHUzMEU5XHUzMEIwXHUzMEE0XHUzMEYzXHVGRjA4XHU5NThCXHU3NjdBXHU2NjQyXHUzMDZFXHUzMDdGXHVGRjA5XHJcbiAgICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiYgdmlzdWFsaXplcih7XHJcbiAgICAgICAgZmlsZW5hbWU6ICdkaXN0L3N0YXRzLmh0bWwnLFxyXG4gICAgICAgIG9wZW46IHRydWUsXHJcbiAgICAgICAgZ3ppcFNpemU6IHRydWUsXHJcbiAgICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcclxuICAgICAgfSksXHJcbiAgICBdLmZpbHRlcihCb29sZWFuKSxcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBwcm94eToge1xyXG4gICAgICAgICcvYXBpJzoge1xyXG4gICAgICAgICAgdGFyZ2V0OiBhcGlQcm94eVRhcmdldCxcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBkZWZpbmU6IHtcclxuICAgICAgLy8gXHU3NEIwXHU1ODgzXHU1OTA5XHU2NTcwXHUzMDkyXHUzMEFGXHUzMEU5XHUzMEE0XHUzMEEyXHUzMEYzXHUzMEM4XHUzMDY3XHU1MjI5XHU3NTI4XHU1M0VGXHU4MEZEXHUzMDZCXHUzMDU5XHUzMDhCXHJcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9XRUFUSEVSX0FQSV9LRVknOiBKU09OLnN0cmluZ2lmeSh3ZWF0aGVyQXBpS2V5KSxcclxuICAgICAgJ2ltcG9ydC5tZXRhLmVudi5WSVRFX1NVUEFCQVNFX1VSTCc6IEpTT04uc3RyaW5naWZ5KGVudi5WSVRFX1NVUEFCQVNFX1VSTCksXHJcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9TVVBBQkFTRV9BTk9OX0tFWSc6IEpTT04uc3RyaW5naWZ5KGVudi5WSVRFX1NVUEFCQVNFX0FOT05fS0VZKSxcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICAvLyBcdTMwQkRcdTMwRkNcdTMwQjlcdTMwREVcdTMwQzNcdTMwRDdcdTMwOTJcdTcxMjFcdTUyQjlcdTUzMTZcdUZGMDhcdTY3MkNcdTc1NkFcdTc0QjBcdTU4ODNcdTMwNjdcdTMwNkZBUElcdTMwQURcdTMwRkNcdTMwOTJcdTk2QTBcdTMwNTlcdTMwNUZcdTMwODFcdUZGMDlcclxuICAgICAgc291cmNlbWFwOiBtb2RlICE9PSAncHJvZHVjdGlvbicsXHJcbiAgICAgIC8vIFx1MzBDMVx1MzBFM1x1MzBGM1x1MzBBRlx1MzBCNVx1MzBBNFx1MzBCQVx1OEI2Nlx1NTQ0QVx1MzA5Mlx1OEFCRlx1NjU3NFxyXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDYwMCxcclxuICAgICAgLy8gXHU2QkI1XHU5NjhFXHU3Njg0XHUzMEQzXHUzMEVCXHUzMEM5XHU4QTJEXHU1QjlBXHJcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICAvLyBTdGFnZXdpc2UgYnVpbGQgY29uZmlndXJhdGlvblxyXG4gICAgICAgIGV4cGVyaW1lbnRhbDoge1xyXG4gICAgICAgICAgc3RhZ2V3aXNlOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICAvLyBcdTMwODhcdTMwOEFcdThBNzNcdTdEMzBcdTMwNkFcdTMwQzFcdTMwRTNcdTMwRjNcdTMwQUZcdTUyMDZcdTUyNzJcdTYyMjZcdTc1NjVcdUZGMDhzdGFnZXdpc2VcdTVCRkVcdTVGRENcdUZGMDlcclxuICAgICAgICAgIC8vIFx1NjcyQ1x1NzU2QVx1MzBEM1x1MzBFQlx1MzBDOVx1MzA2N1x1MzA2Rlx1NUZBQVx1NzRCMFx1NEY5RFx1NUI1OFx1MzA2Qlx1MzA4OFx1MzA4Qlx1NTIxRFx1NjcxRlx1NTMxNlx1OTgwNlx1NUU4Rlx1NTU0Rlx1OTg0Q1x1MzA5Mlx1NTZERVx1OTA3Rlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzAwMW1hbnVhbENodW5rcyBcdTMwOTJcdTcxMjFcdTUyQjlcdTUzMTZcclxuICAgICAgICAgIG1hbnVhbENodW5rczogbW9kZSA9PT0gJ2RldmVsb3BtZW50JyA/IChpZCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBDcml0aWNhbCBwYXRoIChcdTY3MDBcdTUxMkFcdTUxNDhcdThBQURcdTMwN0ZcdThGQkNcdTMwN0YpXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3QnKSB8fCBpZC5pbmNsdWRlcygncmVhY3QtZG9tJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ2NyaXRpY2FsLXJlYWN0JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRXNzZW50aWFsIHJvdXRpbmcgKFx1N0IyQ1x1NEU4Q1x1NTEyQVx1NTE0OClcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyZWFjdC1yb3V0ZXInKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiAnZXNzZW50aWFsLXJvdXRpbmcnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDb3JlIHV0aWxpdGllcyAoXHU3QjJDXHU0RTA5XHU1MTJBXHU1MTQ4KVxyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3p1c3RhbmQnKSB8fCBpZC5pbmNsdWRlcygnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5JykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ2NvcmUtc3RhdGUnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBdXRoZW50aWNhdGlvbiAmIERhdGFiYXNlIChcdTdCMkNcdTU2REJcdTUxMkFcdTUxNDgpXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQHN1cGFiYXNlJykgfHwgaWQuaW5jbHVkZXMoJ3N1cGFiYXNlJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ2F1dGgtZGInO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBVSSBDb21wb25lbnRzIChcdTkwNDVcdTVFRjZcdThBQURcdTMwN0ZcdThGQkNcdTMwN0ZcdTUzRUZcdTgwRkQpXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQGhlYWRsZXNzdWknKSB8fCBpZC5pbmNsdWRlcygnQHJhZGl4LXVpJykgfHwgaWQuaW5jbHVkZXMoJ2ZyYW1lci1tb3Rpb24nKSB8fFxyXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdyZWFjdC1zZWxlY3QnKSB8fCBpZC5pbmNsdWRlcygnbHVjaWRlLXJlYWN0JykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ3VpLWNvbXBvbmVudHMnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBNYXAgZnVuY3Rpb25hbGl0eSAoXHU1RkM1XHU4OTgxXHU2NjQyXHU4QUFEXHUzMDdGXHU4RkJDXHUzMDdGKVxyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2xlYWZsZXQnKSB8fCBpZC5pbmNsdWRlcygnbWFwYm94JykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ21hcC1mZWF0dXJlcyc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENvbnRlbnQgcHJvY2Vzc2luZyAoXHU1RkM1XHU4OTgxXHU2NjQyXHU4QUFEXHUzMDdGXHU4RkJDXHUzMDdGKVxyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0BtZHgtanMnKSB8fCBpZC5pbmNsdWRlcygnbWR4JykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ2NvbnRlbnQtcHJvY2Vzc2luZyc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFV0aWxpdHkgbGlicmFyaWVzIChcdTkwNDVcdTVFRjZcdThBQURcdTMwN0ZcdThGQkNcdTMwN0YpXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ3V0aWxpdHktdmVuZG9yJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgIC8vIFByb2dyZXNzaXZlIGxvYWRpbmdcdTVCRkVcdTVGRENcdTMwNkVcdTMwRDVcdTMwQTFcdTMwQTRcdTMwRUJcdTU0MERcdTYyMjZcdTc1NjVcclxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAoY2h1bmtJbmZvKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBjaHVua0luZm8ubmFtZTtcclxuICAgICAgICAgICAgaWYgKG5hbWUgPT09ICdjcml0aWNhbC1yZWFjdCcpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9jcml0aWNhbC1baGFzaF0uanMnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAoY2h1bmtJbmZvKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBjaHVua0luZm8ubmFtZTtcclxuICAgICAgICAgICAgLy8gUHJpb3JpdHktYmFzZWQgbmFtaW5nIGZvciBzdGFnZXdpc2UgbG9hZGluZ1xyXG4gICAgICAgICAgICBpZiAobmFtZT8uaW5jbHVkZXMoJ2NyaXRpY2FsJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9jcml0aWNhbC9bbmFtZV0tW2hhc2hdLmpzJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobmFtZT8uaW5jbHVkZXMoJ2Vzc2VudGlhbCcpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvZXNzZW50aWFsL1tuYW1lXS1baGFzaF0uanMnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuYW1lPy5pbmNsdWRlcygnY29yZScpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICdhc3NldHMvY29yZS9bbmFtZV0tW2hhc2hdLmpzJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9sYXp5L1tuYW1lXS1baGFzaF0uanMnO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uW2V4dF0nLFxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgLy8gXHU2NzAwXHU5MDY5XHU1MzE2XHU4QTJEXHU1QjlBXHVGRjA4c3RhZ2V3aXNlXHU1QkZFXHU1RkRDXHVGRjA5XHJcbiAgICAgIG1pbmlmeTogJ3RlcnNlcicsXHJcbiAgICAgIHRlcnNlck9wdGlvbnM6IHtcclxuICAgICAgICBjb21wcmVzczoge1xyXG4gICAgICAgICAgZHJvcF9jb25zb2xlOiBtb2RlID09PSAncHJvZHVjdGlvbicsXHJcbiAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiBtb2RlID09PSAncHJvZHVjdGlvbicsXHJcbiAgICAgICAgICAvLyBTdGFnZXdpc2VcdTc1MjhcdTMwNkVcdTY3MDBcdTkwNjlcdTUzMTZcclxuICAgICAgICAgIHBhc3NlczogMixcclxuICAgICAgICAgIHB1cmVfZnVuY3M6IG1vZGUgPT09ICdwcm9kdWN0aW9uJyA/IFsnY29uc29sZS5sb2cnLCAnY29uc29sZS5kZWJ1ZyddIDogW10sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtYW5nbGU6IHtcclxuICAgICAgICAgIHNhZmFyaTEwOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9ybWF0OiB7XHJcbiAgICAgICAgICBjb21tZW50czogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBvcHRpbWl6ZURlcHM6IHtcclxuICAgICAgaW5jbHVkZTogW1xyXG4gICAgICAgICdtZXJtYWlkJyxcclxuICAgICAgICAncmVhY3QnLFxyXG4gICAgICAgICdyZWFjdC1kb20nLFxyXG4gICAgICAgICdyZWFjdC1yb3V0ZXItZG9tJyxcclxuICAgICAgICAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5JyxcclxuICAgICAgICAnenVzdGFuZCcsXHJcbiAgICAgICAgJ2xlYWZsZXQnLFxyXG4gICAgICAgICdyZWFjdC1sZWFmbGV0JyxcclxuICAgICAgICAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJyxcclxuICAgICAgICAncmVhY3Qtd2luZG93JyxcclxuICAgICAgICAnQG1keC1qcy9yZWFjdCdcclxuICAgICAgXSxcclxuICAgICAgLy8gU3RhZ2V3aXNlXHU1QkZFXHU1RkRDXHUzMDZFXHU0RjlEXHU1QjU4XHU5NUEyXHU0RkMyXHU2NzAwXHU5MDY5XHU1MzE2XHJcbiAgICAgIGVzYnVpbGRPcHRpb25zOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnZXNuZXh0JyxcclxuICAgICAgICB0cmVlU2hha2luZzogdHJ1ZSxcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXHJcbiAgICAgICAgJ0Bjb250ZW50JzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY29udGVudCcpLFxyXG4gICAgICAgICdAY29tcG9uZW50cyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbXBvbmVudHMnKSxcclxuICAgICAgICAnQHV0aWxzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvdXRpbHMnKSxcclxuICAgICAgICAnQGhvb2tzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaG9va3MnKSxcclxuICAgICAgICAnQHR5cGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvdHlwZXMnKSxcclxuICAgICAgICAnQHN0b3Jlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3N0b3JlcycpLFxyXG4gICAgICAgICdAbWR4JzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY29tcG9uZW50cy9tZHgnKSxcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIFx1MzBEMVx1MzBENVx1MzBBOVx1MzBGQ1x1MzBERVx1MzBGM1x1MzBCOVx1NzZFM1x1ODk5Nlx1OEEyRFx1NUI5QVx1RkYwOHN0YWdld2lzZVx1NUJGRVx1NUZEQ1x1RkYwOVxyXG4gICAgZXNidWlsZDoge1xyXG4gICAgICAvLyBcdTMwRDdcdTMwRURcdTMwQzBcdTMwQUZcdTMwQjdcdTMwRTdcdTMwRjNcdTMwRDNcdTMwRUJcdTMwQzlcdTMwNjdcdTMwNkVcdTMwQjNcdTMwRjNcdTMwQkRcdTMwRkNcdTMwRUJcdTUyNEFcdTk2NjRcclxuICAgICAgZHJvcDogbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nID8gWydjb25zb2xlJywgJ2RlYnVnZ2VyJ10gOiBbXSxcclxuICAgICAgLy8gU3RhZ2V3aXNlXHU3NTI4XHUzMDZFdHJlZSBzaGFraW5nXHU1RjM3XHU1MzE2XHJcbiAgICAgIHRyZWVTaGFraW5nOiB0cnVlLFxyXG4gICAgICB0YXJnZXQ6ICdlc25leHQnLFxyXG4gICAgfSxcclxuICAgIC8vIENTU1x1NjcwMFx1OTA2OVx1NTMxNlx1RkYwOHN0YWdld2lzZVx1NUJGRVx1NUZEQ1x1RkYwOVxyXG4gICAgY3NzOiB7XHJcbiAgICAgIGRldlNvdXJjZW1hcDogbW9kZSAhPT0gJ3Byb2R1Y3Rpb24nLFxyXG4gICAgICBtb2R1bGVzOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVTY29wZWROYW1lOiBtb2RlID09PSAncHJvZHVjdGlvbicgPyAnW2hhc2g6YmFzZTY0OjVdJyA6ICdbbmFtZV1fX1tsb2NhbF1fX19baGFzaDpiYXNlNjQ6NV0nLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9O1xyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpVCxPQUFPLFNBQVM7QUFDalUsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixTQUFTLGtCQUFrQjtBQUMzQixTQUFTLGNBQWMsZUFBZTtBQUp0QyxJ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
