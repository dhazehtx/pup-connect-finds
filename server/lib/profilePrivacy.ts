/**
 * `profiles.privacy_settings` is JSON text. May include security prefs (useSecuritySettings)
 * and profile visibility flags — always merge PATCH payloads, never replace wholesale.
 */

export function parsePrivacySettingsObject(raw: string | null | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    return typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : { ...(raw as object) };
  } catch {
    return {};
  }
}

/** Public profile: location/website only if user opted in (explicit `true`). */
export function getPublicVisibilityFlags(priv: Record<string, unknown>): {
  showLocation: boolean;
  showWebsite: boolean;
} {
  return {
    showLocation: priv.show_location_on_public_profile === true,
    showWebsite: priv.show_website_on_public_profile === true,
  };
}

export function mergePrivacySettingsJson(
  existingRaw: string | null | undefined,
  patch: Record<string, unknown>,
): string {
  const base = parsePrivacySettingsObject(existingRaw);
  return JSON.stringify({ ...base, ...patch });
}
