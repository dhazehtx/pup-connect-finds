import type { SupabaseClientOptions } from '@supabase/supabase-js';

/** Shared options for every service-role Supabase client on Node (auth verify, storage, etc.). */
export const serviceRoleSupabaseOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    // Server processes do not subscribe to channels; keep Realtime quiet if the socket connects.
    log_level: 'error' as const,
    logger: (_kind: string, _msg: string, _data?: unknown) => {},
  },
} as const satisfies SupabaseClientOptions<'public'>;
