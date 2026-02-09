// Supabase client singleton - prevents multiple GoTrueClient instances
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;


// Singleton pattern: reuse existing client if available (survives HMR)
declare global {
  interface Window {
    __supabase_client?: SupabaseClient<Database>;
  }
}

function getSupabaseClient(): SupabaseClient<Database> {
  if (typeof window !== 'undefined' && window.__supabase_client) {
    return window.__supabase_client;
  }
  
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
  
  if (typeof window !== 'undefined') {
    window.__supabase_client = client;
  }
  
  return client;
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = getSupabaseClient();