import { Request, Response } from 'express';
import { Pool } from '@neondatabase/serverless';
import { isUuid } from '../../lib/isUuid';

// Use direct PostgreSQL connection to bypass Supabase token issues
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function fail(res: Response, message: string, status = 400) {
  return res.status(status).json({ success: false, message });
}

export async function ensureOpenApplication(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    let { providerId } = req.body;
    console.log('[ENSURE OPEN APP] Request:', { userId, providerId });
    
    if (!userId) return fail(res, "Missing userId", 400);
    
    // 🔹 Normalize providerId - convert fabricated IDs to real UUIDs
    if (!isUuid(providerId)) {
      console.log('[ENSURE OPEN APP] Non-UUID providerId detected, finding/creating provider...');
      
      try {
        // Find existing provider by user_id
        const findProviderQuery = `
          SELECT id FROM providers WHERE user_id = $1 LIMIT 1
        `;
        const providerResult = await pool.query(findProviderQuery, [userId]);
        
        if (providerResult.rows.length > 0) {
          providerId = providerResult.rows[0].id;
          console.log('[ENSURE OPEN APP] Found existing provider:', providerId);
        } else {
          // Create new provider
          const createProviderQuery = `
            INSERT INTO providers (user_id) VALUES ($1) RETURNING id
          `;
          const createResult = await pool.query(createProviderQuery, [userId]);
          providerId = createResult.rows[0].id;
          console.log('[ENSURE OPEN APP] Created new provider:', providerId);
        }
      } catch (providerErr: any) {
        console.error('[ENSURE OPEN APP] Provider error:', providerErr);
        return fail(res, `DB error (provider lookup): ${providerErr.message}`, 500);
      }
    }
    
    // 1) Find existing draft/in_progress using direct PostgreSQL
    try {
      const existingQuery = `
        SELECT id FROM provider_applications 
        WHERE user_id = $1 AND provider_id = $2 AND status = 'pending'
        LIMIT 1
      `;
      const existingResult = await pool.query(existingQuery, [userId, providerId]);
      
      if (existingResult.rows.length > 0) {
        console.log('[ENSURE OPEN APP] Found existing:', existingResult.rows[0].id);
        return res.json({ success: true, applicationId: existingResult.rows[0].id, providerId });
      }
    } catch (findErr: any) {
      console.error('[ENSURE OPEN APP] Find error:', findErr);
      return fail(res, `DB error (find application): ${findErr.message}`, 500);
    }

    // 2) Create draft application using direct PostgreSQL
    try {
      console.log('[ENSURE OPEN APP] Creating new application...');
      const insertQuery = `
        INSERT INTO provider_applications (user_id, provider_id, status)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      const insertResult = await pool.query(insertQuery, [userId, providerId, 'pending']);
      
      console.log('[ENSURE OPEN APP] Created new:', insertResult.rows[0].id);
      return res.json({ success: true, applicationId: insertResult.rows[0].id, providerId });
    } catch (insErr: any) {
      console.error('[ENSURE OPEN APP] Insert error:', insErr);
      return fail(res, `DB error (create application): ${insErr.message}`, 500);
    }
    
  } catch (e: any) {
    console.error("[ENSURE OPEN APP] ERROR", e);
    return fail(res, e?.message || "Internal error", 500);
  }
}