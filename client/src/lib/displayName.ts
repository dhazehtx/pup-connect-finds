/**
 * Safe public display name for a profile. Public identity must NEVER be derived
 * from the user's email or its local-part. Prefer an explicit full name, then a
 * username, then a neutral placeholder — never an email fragment.
 */
export function safeDisplayName(
  profile: { full_name?: string | null; username?: string | null } | null | undefined,
  fallback = 'Member',
): string {
  return profile?.full_name?.trim() || profile?.username?.trim() || fallback;
}
