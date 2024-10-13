import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      external: ['@tinymce/tinymce-react']
    },
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});