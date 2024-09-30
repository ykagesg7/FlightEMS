import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is not set in the environment variables.');
  throw new Error('Supabase URL is missing');
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not set in the environment variables.');
  throw new Error('Supabase Anon Key is missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);