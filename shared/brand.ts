/**
 * Canonical brand identity for PAWS.
 *
 * Single source of truth for the user-visible product name and public-facing
 * contact details. These are the CANONICAL defaults; deployment can override the
 * operational values (support email, from address, legal entity, app URL) via
 * environment variables — see `server/lib/brand.ts` for the server-side resolver.
 *
 * IMPORTANT: `legalEntity` is intentionally empty. Do not invent a legal company
 * name — surface a configured value or omit it, never a fabricated entity.
 */
export const BRAND = {
  /** Public product name shown throughout the UI and emails. */
  name: 'PAWS',
  /** Expanded name / what the acronym stands for. */
  fullName: 'Pet Adoption Web Services',
  /** Primary domain (no protocol). */
  domain: 'petadoptionwebservices.com',
  /** Default public support address (override with SUPPORT_EMAIL). */
  supportEmail: 'support@petadoptionwebservices.com',
  /** Default transactional sender (override with FROM_EMAIL / SENDGRID_FROM). */
  fromEmail: 'noreply@petadoptionwebservices.com',
  /** Registered legal entity — NOT yet decided. Configure via LEGAL_ENTITY_NAME. */
  legalEntity: '',
} as const;

export type Brand = typeof BRAND;
