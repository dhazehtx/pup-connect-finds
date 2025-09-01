import { Router } from "express";
import { serverSupabase } from "../../lib/supabaseServer";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { applicationId, userId, step, status } = req.body;
    
    console.log('[APPLICATION PROGRESS] Update request:', { applicationId, userId, step, status });
    
    if (!applicationId || !userId || !step || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }
    
    if (!/^step[1-8]_status$/.test(step)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid step name" 
      });
    }

    const supabase = serverSupabase();
    const { data, error } = await supabase
      .from("provider_applications")
      .update({ 
        [step]: status, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", applicationId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error('[APPLICATION PROGRESS] Database error:', error);
      throw error;
    }
    
    console.log('[APPLICATION PROGRESS] Success:', { applicationId, step, status });
    
    return res.json({ 
      success: true, 
      application: data 
    });
  } catch (e: any) {
    console.error("[APPLICATION PROGRESS] Error:", e);
    return res.status(500).json({ 
      success: false, 
      message: e?.message || "Internal error" 
    });
  }
});

export { router as progressRouter };