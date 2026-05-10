/**
 * Authenticated user attached to `req.user` after `authMiddleware` (Supabase JWT + profile row).
 */
export interface AuthUser {
  id: string;
  email?: string | null;
  /** From profiles.is_admin — used by requireAdmin and public-profile admin viewers */
  is_admin: boolean;
  username?: string | null;
  full_name?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  /** Supabase auth user_metadata keys (string values typical) */
  [key: string]: unknown;
}
