/// <reference types="vite/client" />

// 環境変数の型定義
interface ImportMetaEnv {
  readonly VITE_WEATHER_API_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_ENV: 'development' | 'production';
  readonly GOOGLE_GEMINI_API_KEY: string;
  readonly GOOGLE_CLOUD_VISION_API_KEY: string;
  readonly NODE_ENV: 'development' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.geojson' {
  const value: GeoJSON.FeatureCollection;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}
