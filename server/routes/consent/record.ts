import type { Request, Response } from "express";
import { Pool } from "@neondatabase/serverless";
import { insertUserConsentSchema } from "@shared/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * POST /api/consent/record
 * Records user consent for legal agreements (Terms, Privacy, etc.)
 */
export async function recordConsent(req: Request, res: Response) {
  try {
    const { userId, consentType, termsVersion, ipAddress, userAgent } = req.body;

    // Validate required fields
    if (!userId || !consentType || !termsVersion) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userId, consentType, termsVersion"
      });
    }

    // Validate consent type
    const validConsentTypes = ['terms', 'privacy', 'booking', 'stripe'];
    if (!validConsentTypes.includes(consentType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid consent type. Must be one of: ${validConsentTypes.join(', ')}`
      });
    }

    // Validate using Zod schema
    const consentData = {
      user_id: userId,
      consent_type: consentType,
      terms_version: termsVersion,
      accepted: true,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    };

    const validated = insertUserConsentSchema.parse(consentData);

    // Insert consent record
    const query = `
      INSERT INTO user_consents (
        user_id, 
        consent_type, 
        terms_version, 
        accepted, 
        ip_address, 
        user_agent,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, created_at
    `;

    const result = await pool.query(query, [
      validated.user_id,
      validated.consent_type,
      validated.terms_version,
      validated.accepted,
      validated.ip_address,
      validated.user_agent,
    ]);

    console.log(`[CONSENT] Recorded ${consentType} consent for user ${userId} (version: ${termsVersion})`);

    return res.json({
      success: true,
      consent: {
        id: result.rows[0].id,
        userId: validated.user_id,
        consentType: validated.consent_type,
        termsVersion: validated.terms_version,
        recordedAt: result.rows[0].created_at,
      },
    });
  } catch (error: any) {
    console.error("[CONSENT] Error recording consent:", error);
    
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to record consent",
    });
  }
}
