import type { SupabaseClient } from '@supabase/supabase-js';
import type { SpiralLmsDatabase } from '../types/spiralLmsDatabase';
import { supabase } from './supabase';

/** Single boundary cast until spiral tables are merged into generated `Database` types. */
export const spiralLmsSupabase = supabase as unknown as SupabaseClient<SpiralLmsDatabase>;
