/**
 * AI Match listing filter: marketplace rows need at least this CLIP cosine score
 * (see `cosineSimilarity` in imageEmbedding.ts, mapped to 0–1) vs the user's query photo.
 *
 * Default is a conservative starting point. Refine with:
 *   npm run tune:ai-match
 * (requires HF_TOKEN; uses public reference images — not a substitute for labeled same-dog pairs,
 * but calibrates against “unrelated animal” similarity spread.)
 */
export const AI_MATCH_DEFAULT_MIN_LISTING_SCORE = 0.68;

export function getAiMatchMinListingScore(): number {
  const raw = parseFloat(
    process.env.AI_MATCH_MIN_LISTING_SCORE ?? String(AI_MATCH_DEFAULT_MIN_LISTING_SCORE),
  );
  if (Number.isNaN(raw)) return AI_MATCH_DEFAULT_MIN_LISTING_SCORE;
  return Math.min(1, Math.max(0, raw));
}

/**
 * Minimum CLIP cosine score (0–1) for a lost/found ALERT to surface as a
 * "possible photo match". The alert branch of /ai-match previously applied NO
 * floor, so every active alert with an embedding surfaced — including near-zero
 * similarity (unrelated dogs map to ~0.5 under the (cos+1)/2 remap). Defaults to
 * the listing floor for consistency; refine with `npm run tune:ai-match`.
 */
export const AI_MATCH_DEFAULT_MIN_ALERT_SCORE = AI_MATCH_DEFAULT_MIN_LISTING_SCORE;

export function getAiMatchMinAlertScore(): number {
  const raw = parseFloat(
    process.env.AI_MATCH_MIN_ALERT_SCORE ?? String(AI_MATCH_DEFAULT_MIN_ALERT_SCORE),
  );
  if (Number.isNaN(raw)) return AI_MATCH_DEFAULT_MIN_ALERT_SCORE;
  return Math.min(1, Math.max(0, raw));
}

/** Auto “possible photo match” notification when a new alert is posted (lost↔found CLIP compare). */
export const EMBEDDING_MATCH_NOTIFY_DEFAULT_MIN_SCORE = 0.78;

export function getEmbeddingMatchNotifyMinScore(): number {
  const raw = parseFloat(
    process.env.EMBEDDING_MATCH_NOTIFY_MIN_SCORE ??
      String(EMBEDDING_MATCH_NOTIFY_DEFAULT_MIN_SCORE),
  );
  if (Number.isNaN(raw)) return EMBEDDING_MATCH_NOTIFY_DEFAULT_MIN_SCORE;
  return Math.min(1, Math.max(0, raw));
}
