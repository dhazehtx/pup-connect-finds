import { createClient } from "@supabase/supabase-js";
import { getServerSupabaseApiUrl } from "./serverSupabaseEnv";
import { serviceRoleSupabaseOptions } from "./serviceSupabaseOptions";

export const serverSupabase = () => {
  const url = getServerSupabaseApiUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, serviceRoleSupabaseOptions);
};
