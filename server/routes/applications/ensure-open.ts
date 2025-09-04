import { Request, Response } from 'express';
import { supabase } from '../../lib/supabase';

function fail(res: Response, message: string, status = 400) {
  return res.status(status).json({ success: false, message });
}

export async function ensureOpenApplication(req: Request, res: Response) {
  try {
    const { userId, providerId } = req.body;
    console.log('[ENSURE OPEN APP] Request:', { userId, providerId });
    
    if (!userId) return fail(res, "Missing userId", 400);
    if (!providerId) return fail(res, "Missing providerId", 400);

    // 1) Find existing draft/in_progress
    const { data: existing, error: findErr } = await supabase
      .from("provider_applications")
      .select("id")
      .eq("user_id", userId)
      .eq("provider_id", providerId)
      .in("status", ["draft", "in_progress"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findErr) {
      console.error('[ENSURE OPEN APP] Find error:', findErr);
      return fail(res, `DB error (find application): ${findErr.message}`, 500);
    }
    
    if (existing?.id) {
      console.log('[ENSURE OPEN APP] Found existing:', existing.id);
      return res.json({ success: true, applicationId: existing.id });
    }

    // 2) Create draft application
    console.log('[ENSURE OPEN APP] Creating new application...');
    const { data: created, error: insErr } = await supabase
      .from("provider_applications")
      .insert({ 
        user_id: userId, 
        provider_id: providerId, 
        status: "draft" 
      })
      .select("id")
      .single();

    if (insErr) {
      console.error('[ENSURE OPEN APP] Insert error:', insErr);
      return fail(res, `DB error (create application): ${insErr.message}`, 500);
    }

    console.log('[ENSURE OPEN APP] Created new:', created.id);
    return res.json({ success: true, applicationId: created.id });
    
  } catch (e: any) {
    console.error("[ENSURE OPEN APP] ERROR", e);
    return fail(res, e?.message || "Internal error", 500);
  }
}