/// <reference types="vite/client" />

// 環境変数の型定義
interface ImportMetaEnv {
  /** vercel dev 時、API を Vite プロキシではなくこのオリジンへ直接送る（例: http://localhost:3000） */
  readonly VITE_VERCEL_DEV_API_ORIGIN?: string;
  readonly VITE_WEATHER_API_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_ENV: 'development' | 'production';
  /** `true` でシリーズ記事の順次ロックを無効化（E2E・手動検証用。本番では未設定） */
  readonly VITE_UNLOCK_ALL_SERIES_ARTICLES?: string;
  readonly GOOGLE_GEMINI_API_KEY: string;
  readonly GOOGLE_CLOUD_VISION_API_KEY: string;
  readonly NODE_ENV: 'development' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.geojson' {
  const value: GeoJSON.FeatureCollection;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}
