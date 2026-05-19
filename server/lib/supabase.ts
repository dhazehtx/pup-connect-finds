import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabaseApiUrl } from "./serverSupabaseEnv";
import { serviceRoleSupabaseOptions } from "./serviceSupabaseOptions";

const supabaseUrl = getServerSupabaseApiUrl();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "[Supabase] Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Storage and Supabase-backed routes may return 503 until configured.",
  );
}

/** Service-role client for server-side storage/auth; null if env is incomplete. */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, serviceRoleSupabaseOptions)
    : null;
