import { Request, Response } from "express";
import { serverSupabase } from "../../lib/supabaseServer";

export async function POST(req: Request, res: Response) {
  try {
    const { applicationId, userId, consent } = req.body;
    
    if (!applicationId || !userId || typeof consent !== "boolean") {
      return res.status(400).json({ 
        success: false, 
        message: "Missing applicationId, userId, or consent fields." 
      });
    }

    const supabase = serverSupabase();
    
    const { data, error } = await supabase
      .from("provider_applications")
      .update({ bgcheck_consent: consent })
      .eq("id", applicationId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("[applications/consent] Supabase error:", error);
      throw error;
    }

    return res.json({ 
      success: true, 
      consent: data.bgcheck_consent 
    });
    
  } catch (e: any) {
    console.error("[applications/consent]", e);
    return res.status(500).json({ 
      success: false, 
      message: e?.message || "Internal error" 
    });
  }
}