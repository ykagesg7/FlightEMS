import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: './', // この行を追加
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'), // この行を変更
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});