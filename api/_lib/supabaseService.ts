import { createClient } from '@supabase/supabase-js';

export function getServiceSupabase() {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase service credentials missing');
  }
  return createClient(url, key);
}
