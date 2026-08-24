/**
 * Client feature flags.
 *
 * Used to cleanly disable features whose backing tables are not yet present in
 * the production Supabase Postgres, so users never enter a workflow that appears
 * functional and then fails. Flipping a flag back to `true` (once the owner has
 * applied the feature's schema/migrations) re-enables it with no other code
 * changes.
 *
 * Optional runtime override via a Vite env var, e.g. VITE_FEATURE_LOST_AND_FOUND=true.
 */
function envFlag(name: string, fallback: boolean): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = (import.meta as any)?.env?.[name];
    if (typeof v === 'string') {
      if (v.toLowerCase() === 'true') return true;
      if (v.toLowerCase() === 'false') return false;
    }
  } catch {
    /* import.meta not available in this context */
  }
  return fallback;
}

export const FEATURES = {
  /**
   * Lost & Found (lost pet alerts, sightings, search missions). Disabled for
   * closed beta: the `lost_pet_alerts` / `lost_pet_alert_reports` / `search_missions`
   * tables are not present in the production Supabase schema yet, so create/report
   * flows would error. Browse degrades to empty, but the feature is hidden to avoid
   * a broken-looking workflow.
   */
  lostAndFound: envFlag('VITE_FEATURE_LOST_AND_FOUND', false),
} as const;

export type FeatureName = keyof typeof FEATURES;

export function isFeatureEnabled(name: FeatureName): boolean {
  return FEATURES[name] === true;
}
