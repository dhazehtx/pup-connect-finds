/**
 * Canonical display name for a dog listing.
 *
 * The schema has both `dog_name` (the real, required name the create form sets)
 * and a separate nullable legacy `title` column that the create flow never
 * populates. Rendering `title` alone produces blank cards. Prefer the real dog
 * name, fall back to a legacy title if one exists, then a neutral placeholder —
 * so a listing can never render a blank name, without any schema migration.
 */
export function listingDisplayName(
  listing: { dog_name?: string | null; title?: string | null } | null | undefined,
): string {
  const name = listing?.dog_name?.trim() || listing?.title?.trim();
  return name || 'Untitled listing';
}
