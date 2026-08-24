import { BRAND } from '@shared/brand';

/**
 * Server-side brand resolver. Applies environment overrides on top of the
 * canonical defaults so deployments can set real operational values (support
 * address, transactional sender, legal entity, app URL) without a code change.
 * Never returns a fabricated legal entity — empty means "not configured".
 */
export function getBrand() {
  return {
    name: BRAND.name,
    fullName: BRAND.fullName,
    domain: BRAND.domain,
    supportEmail: (process.env.SUPPORT_EMAIL || BRAND.supportEmail).trim(),
    fromEmail: (process.env.FROM_EMAIL || process.env.SENDGRID_FROM || BRAND.fromEmail).trim(),
    legalEntity: (process.env.LEGAL_ENTITY_NAME || BRAND.legalEntity).trim(),
    appUrl: (process.env.PUBLIC_APP_URL || process.env.APP_URL || process.env.FRONTEND_URL || `https://${BRAND.domain}`).trim(),
  };
}
