// Supabaseクライアントの統一エクスポート
export { 
  createBrowserSupabaseClient as supabase,
  getSupabaseAdmin as supabaseAdmin,
  supabaseUrl,
  supabaseKey
} from '../utils/supabase';

// デフォルトエクスポート用のクライアント
import { createBrowserSupabaseClient } from '../utils/supabase';
export default createBrowserSupabaseClient(); 