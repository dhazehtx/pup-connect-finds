import { Request, Response } from "express";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL });

export async function POST(req: Request, res: Response) {
  try {
    const { applicationId, userId, consent } = req.body;
    
    if (!applicationId || !userId || typeof consent !== "boolean") {
      return res.status(400).json({ 
        success: false, 
        message: "Missing applicationId, userId, or consent fields." 
      });
    }

    const result = await pool.query(
      `UPDATE provider_applications
       SET bgcheck_consent = $1
       WHERE id = $2
         AND user_id = $3
       RETURNING bgcheck_consent`,
      [consent, applicationId, userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    return res.json({ 
      success: true, 
      consent: result.rows[0].bgcheck_consent 
    });
    
  } catch (e: any) {
    console.error("[applications/consent]", e);
    return res.status(500).json({ 
      success: false, 
      message: e?.message || "Internal error" 
    });
  }
}