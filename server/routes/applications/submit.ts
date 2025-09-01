import { Router } from "express";
import { serverSupabase } from "../../lib/supabaseServer";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { applicationId, userId } = req.body;
    
    console.log('[APPLICATION SUBMIT] Submit request:', { applicationId, userId });
    
    if (!applicationId || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing applicationId or userId" 
      });
    }

    const supabase = serverSupabase();
    
    // First get the current application to check consent
    const { data: currentApp, error: fetchError } = await supabase
      .from("provider_applications")
      .select("bgcheck_consent")
      .eq("id", applicationId)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.error('[APPLICATION SUBMIT] Fetch error:', fetchError);
      throw fetchError;
    }

    const { data, error } = await supabase
      .from("provider_applications")
      .update({ 
        status: "submitted",
        bgcheck_status: currentApp.bgcheck_consent ? "pending" : "not_requested",
        updated_at: new Date().toISOString() 
      })
      .eq("id", applicationId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error('[APPLICATION SUBMIT] Database error:', error);
      throw error;
    }

    console.log('[APPLICATION SUBMIT] Success:', data.id);

    // TODO: enqueue admin notification if desired
    return res.json({ 
      success: true, 
      status: data.status 
    });
  } catch (e: any) {
    console.error("[APPLICATION SUBMIT] Error:", e);
    return res.status(500).json({ 
      success: false, 
      message: e?.message || "Internal error" 
    });
  }
});

export { router as submitRouter };