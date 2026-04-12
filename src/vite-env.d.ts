/// <reference types="vite/client" />

// 環境変数の型定義
interface ImportMetaEnv {
  /** vercel dev 時、API を Vite プロキシではなくこのオリジンへ直接送る（例: http://localhost:3000） */
  readonly VITE_VERCEL_DEV_API_ORIGIN?: string;
  readonly VITE_WEATHER_API_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** 本番ビルド時のみ使用。未設定なら Sentry は無効 */
  readonly VITE_SENTRY_DSN?: string;
  /** GA4 の測定 ID（例: G-XXXXXXXXXX）。未設定なら送信しない */
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_APP_ENV: 'development' | 'production';
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
