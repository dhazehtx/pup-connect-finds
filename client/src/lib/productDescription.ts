const DEFAULT_PREVIEW_LENGTH = 100;

/** Strip HTML-ish noise and collapse whitespace for card previews */
export function normalizeProductDescription(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

export function truncateProductDescription(
  text: string | null | undefined,
  maxLength = DEFAULT_PREVIEW_LENGTH,
): { preview: string; isTruncated: boolean; full: string } {
  const full = normalizeProductDescription(text);
  if (!full) {
    return { preview: '', isTruncated: false, full: '' };
  }
  if (full.length <= maxLength) {
    return { preview: full, isTruncated: false, full };
  }
  const cut = full.slice(0, maxLength).trimEnd();
  const preview = `${cut.replace(/[.,;:!?\s]+$/, '')}…`;
  return { preview, isTruncated: true, full };
}

export const PRODUCT_DESCRIPTION_PREVIEW_LENGTH = DEFAULT_PREVIEW_LENGTH;
