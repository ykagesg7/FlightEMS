import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  server: {
    host: "::",
    port: "8080",
  },
  build:{
    rollupOptions:{
      input:{
        main:resolve(__dirname,'index.html'),
      }
    },
    target:'es2022'
  },
  envPrefix: 'VITE_',
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      {
        find: "lib",
        replacement: resolve(__dirname, "lib"),
      },
    ],
  },
});