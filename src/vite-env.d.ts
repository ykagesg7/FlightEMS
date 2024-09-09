/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // その他の環境変数を追加
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}