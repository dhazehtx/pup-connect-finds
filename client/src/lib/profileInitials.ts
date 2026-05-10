/** Two-letter initials for avatar placeholders — more personal than a generic icon. */
export function profileInitials(fullName: string, username: string): string {
  const raw = (fullName || username || '').trim();
  if (!raw) return '?';
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return raw.slice(0, 2).toUpperCase();
}
