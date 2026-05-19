// server/lib/supabaseAdmin.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabaseApiUrl } from "./serverSupabaseEnv";
import { serviceRoleSupabaseOptions } from "./serviceSupabaseOptions";

const url = getServerSupabaseApiUrl();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url || !serviceKey) {
  console.warn(
    "[SupabaseAdmin] Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Supabase-dependent features may run in degraded mode.",
  );
}

/** Service-role client; null when URL/key missing so the process can boot (e.g. Railway before env is set). */
export const supabaseAdmin: SupabaseClient | null =
  url && serviceKey ? createClient(url, serviceKey, serviceRoleSupabaseOptions) : null;
