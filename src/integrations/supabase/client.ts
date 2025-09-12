// Supabase client (env‑driven)
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Fail early in development if env vars are missing
  // eslint-disable-next-line no-console
  console.error('Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://xkmrtjxhyctfqqwenqbm.supabase.co', 
  SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrbXJ0anhoeWN0ZnFxd2VucWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MDE3NTAsImV4cCI6MjA3MTE3Nzc1MH0.aE-7MHBjfSDjDUIIClndHc7pLiYkbnTP37XpUl8_LQc', 
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);