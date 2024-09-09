import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('VITE_SUPABASE_PROJECT_URL is not set in the environment variables. Using fallback URL for development.');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('VITE_SUPABASE_API_KEY is not set in the environment variables. Using fallback key for development.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);